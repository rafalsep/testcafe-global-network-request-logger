const networkRequestLogger = require('../../src/index.js')(/aa.com|affirm.com/);

module.exports = {
  hostname: 'localhost',
  network: {
    path: 'examples/custom-filter/tmp',
    takeOnFails: false,
    pathPattern: '${DATE}/${TEST}.json',
    requestLimit: 0,
  },
  color: true,
  browserInitTimeout: 20000,
  selectorTimeout: 10000,
  assertionTimeout: 10000,
  pageLoadTimeout: 10000,
  pageRequestTimeout: 10000,
  skipJsErrors: true,
  skipUncaughtErrors: true,
  hooks: {
    test: {
      before: async t => {
        await networkRequestLogger.onBeforeHook(t);
      },
      after: async t => {
        await networkRequestLogger.onAfterHook(t);
      },
    },
  },
};
