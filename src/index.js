const zlib = require('zlib');
const fs = require('fs');
const path = require('path');
const { RequestLogger } = require('testcafe');

const parseResponseBody = async responseBody =>
  new Promise((resolve, reject) => {
    zlib.gunzip(responseBody, async (error, buff) => {
      if (error !== null) {
        return reject(error);
      }
      return resolve(buff.toString());
    });
  });

function NetworkRequestLogger(filter = request => ['get', 'post', 'patch', 'put', 'delete'].includes(request?.method?.toLowerCase()) && request.headers?.accept?.includes('application/json')) {
  const logger = RequestLogger(filter, { logRequestHeaders: true, logRequestBody: true, stringifyRequestBody: true, logResponseHeaders: true, logResponseBody: true });

  this.onBeforeHook = async t => {
    await t.addRequestHooks(logger);
  };

  this.onAfterHook = async t => {
    await t.removeRequestHooks(logger);

    const { network } = t.testRun.opts;
    if (network.takeOnFails && t.testRun.errs.length === 0) {
      return;
    }

    const { host } = new URL(t.testRun.test.pageUrl);
    const loggedRequests = [];
    const externalRequests = logger.requests.filter(loggedRequest => !loggedRequest?.request?.url?.includes(host));
    for (let i = 0; i < externalRequests.length; i++) {
      const loggedRequest = externalRequests[i];
      if (loggedRequest?.response?.body) {
        const body = loggedRequest?.response.headers['content-encoding'] === 'gzip' ? await parseResponseBody(loggedRequest?.response?.body) : loggedRequest?.response?.body;
        loggedRequests.push({ ...loggedRequest, response: { ...loggedRequest?.response, body: loggedRequest?.response.headers['content-type'] === 'application/json' ? JSON.parse(body) : body } });
      } else {
        loggedRequests.push(loggedRequest);
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
          .replaceAll('${QUARANTINE_ATTEMPT}', (t.testRun.quarantine ? t.testRun.quarantine.attempts.length : 0) + 1),
      );

      if (!fs.existsSync(path.dirname(networkPath))) {
        fs.mkdirSync(path.dirname(networkPath), { recursive: true });
      }
      fs.writeFileSync(networkPath, JSON.stringify(loggedRequests.slice(-network.requestLimit)));
    }
  };
  return this;
}

module.exports = NetworkRequestLogger;
