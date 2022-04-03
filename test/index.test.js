const mockZlib = require('zlib');
const fs = require('fs');
const path = require('path');
const networkRequestLogger = require('../src/index')();

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(() => false),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

jest.mock('testcafe', () => ({
  RequestLogger: function RequestLogger() {
    return {
      requests: [
        {
          request: { url: 'http://some-url.com/v1/zip' },
          response: { body: mockZlib.gzipSync(Buffer.from(JSON.stringify({ mockResponse: 'zippedContent1' }))), headers: { 'content-encoding': 'gzip', 'content-type': 'application/json' } },
        },
        { request: { url: 'http://some-url.com/v1/normal' }, response: { body: '{"mockResponse":"jsonContent1"}', headers: { 'content-type': 'application/json' } } },
        { request: { url: 'http://some-url.com/v1/normal' }, response: { body: { mockResponse: 'jsonContent2' }, headers: {} } },
        { request: { url: 'http://localhost:8081/someFile.js' }, response: { headers: {} } },
        { request: { url: 'http://some-url.com/v1/nobody' }, response: { headers: {} } },
        {
          request: { url: 'http://some-url.com/v1/zip' },
          response: { body: mockZlib.gzipSync(Buffer.from(JSON.stringify({ mockResponse: 'zippedContent2' }))), headers: { 'content-encoding': 'gzip', 'content-type': 'application/json' } },
        },
      ],
    };
  },
}));

jest.useFakeTimers('modern').setSystemTime(new Date(Date.UTC(2023, 3, 5, 10)).getTime());

it('Should attach request logger during on request invocation', async () => {
  const t = { addRequestHooks: jest.fn() };

  await networkRequestLogger.onBeforeHook(t);

  expect(t.addRequestHooks).toHaveBeenCalledTimes(1);
});

it('Should not process any requests when only record on errors is enabled and all tests are successful', async () => {
  const t = {
    removeRequestHooks: jest.fn(),
    testRun: { opts: { network: { takeOnFails: true } }, errs: [] },
  };

  await networkRequestLogger.onAfterHook(t);

  expect(t.removeRequestHooks).toHaveBeenCalledTimes(1);
});

it('Should log up to 4 requests (2 gzipped, 1 with json body, 1 with no body), second quarantine attempt', async () => {
  const t = {
    removeRequestHooks: jest.fn(),
    testRun: {
      opts: { network: { path: 'tmp', takeOnFails: false, pathPattern: '${DATE}/${FIXTURE}/network/${TEST}_${TIME}_${QUARANTINE_ATTEMPT}.json', requestLimit: 4 } },
      errs: [],
      test: { pageUrl: 'http://localhost:8081', fixture: { name: 'fixtureName' }, name: 'testName' },
      quarantine: { attempts: [{}] },
    },
  };

  await networkRequestLogger.onAfterHook(t);

  expect(t.removeRequestHooks).toHaveBeenCalledTimes(1);
  const expectedDirname = path.join('tmp', '2023-04-05', 'fixtureName', 'network');
  expect(fs.existsSync).toHaveBeenCalledWith(expectedDirname);
  expect(fs.mkdirSync).toHaveBeenCalledWith(expectedDirname, { recursive: true });
  expect(fs.writeFileSync).toHaveBeenCalledWith(
    path.join(expectedDirname, 'testName_10-00-00_2.json'),
    '[{"request":{"url":"http://some-url.com/v1/normal"},"response":{"body":{"mockResponse":"jsonContent1"},"headers":{"content-type":"application/json"}}},' +
      '{"request":{"url":"http://some-url.com/v1/normal"},"response":{"body":{"mockResponse":"jsonContent2"},"headers":{}}},' +
      '{"request":{"url":"http://some-url.com/v1/nobody"},"response":{"headers":{}}},' +
      '{"request":{"url":"http://some-url.com/v1/zip"},"response":{"body":{"mockResponse":"zippedContent2"},"headers":{"content-encoding":"gzip","content-type":"application/json"}}}]',
  );
});
