const zlib = require('zlib');
const fs = require('fs');
const path = require('path');
const { RequestLogger } = require('testcafe');

const logger = RequestLogger([{ method: 'GET' }, { method: 'POST' }, { method: 'PUT' }, { method: 'DELETE' }, { method: 'PATCH' }], {
  logRequestHeaders: true,
  logRequestBody: true,
  stringifyRequestBody: true,
  logResponseHeaders: true,
  logResponseBody: true,
});

const parseResponseBody = async responseBody =>
  new Promise((resolve, reject) => {
    zlib.gunzip(responseBody, async (error, buff) => {
      if (error !== null) {
        return reject(error);
      }
      return resolve(JSON.parse(buff.toString()));
    });
  });

const onRequest = async t => {
  await t.addRequestHooks(logger);
};

const onResponse = async t => {
  await t.removeRequestHooks(logger);

  const { network } = t.testRun.opts;
  if (network.takeOnFails && t.testRun.errs.length === 0) {
    return;
  }

  const { host } = new URL(t.testRun.test.pageUrl);
  const loggedRequests = [];
  for (let i = 0; i < logger.requests.length; i++) {
    const loggedRequest = logger.requests[i];
    if (!loggedRequest.request.url.includes(host)) {
      if (loggedRequest?.response?.body) {
        try {
          const body = await parseResponseBody(loggedRequest.response.body);
          loggedRequests.push({ ...loggedRequest, response: { ...loggedRequest.response, body } });
        } catch (e) {
          loggedRequests.push(loggedRequest);
        }
      } else {
        loggedRequests.push(loggedRequest);
      }
    }
  }

  if (loggedRequests.length > 0) {
    const now = new Date().toISOString();
    const networkPath = path.join(
      network.path,
      network.pathPattern
        .replaceAll('${DATE}', now.substr(0, 10))
        .replaceAll('${TIME}', now.substr(11, 8).replaceAll(':', '-'))
        .replaceAll('${FIXTURE}', t.testRun.test.fixture.name)
        .replaceAll('${TEST}', t.testRun.test.name)
        .replaceAll('${QUARANTINE_ATTEMPT}', t.testRun.quarantine.attempts.length + 1),
    );

    if (!fs.existsSync(path.dirname(networkPath))) {
      fs.mkdirSync(path.dirname(networkPath), { recursive: true });
    }
    fs.writeFileSync(networkPath, JSON.stringify(loggedRequests.slice(-network.requestLimit)));
  }
};

module.exports = { onRequest, onResponse };
