const networkRequestLogger = require('../../src/index.js')();

module.exports = {
  hostname: 'localhost',
  network: {
    path: 'examples/default/tmp',
    takeOnFails: false,
    pathPattern: '${DATE}/${FIXTURE}/network/${TEST}_${TIME}_${QUARANTINE_ATTEMPT}.json',
    requestLimit: 0,
  },
  color: true,
  browserInitTimeout: 20000,
  selectorTimeout: 10000,
  assertionTimeout: 10000,
  pageLoadTimeout: 10000,
  pageRequestTimeout: 10000,
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
