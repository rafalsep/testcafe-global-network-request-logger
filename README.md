# Global Network Request Logger for Testcafe

###### Global Hook for testcafe that will record and save network communication (request/response) with external services to JSON file

[![Build Status](https://travis-ci.org/rafalsep/testcafe-global-network-request-logger.svg)](https://travis-ci.org/rafalsep/testcafe-global-network-request-logger)

Uses TestCafe [global hooks](https://testcafe.io/documentation/403435/guides/advanced-guides/hooks#global-hooks) to record network calls executed in browser and saves them into file using same format as screenshots/videos.
It is meant to be used in CI, together with screenshot & video recording for better troubleshooting capability of failed tests

<p align="center">
    <img src="https://raw.github.com/rafalsep/testcafe-global-network-request-logger/master/media/content.png" alt="content" />
</p>

## Features

- zero dependencies
- supports gzipped or JSON responses
- once attached will execute for all tests
- uses similar config as [testcafe screenshot and video](https://testcafe.io/documentation/402840/guides/advanced-guides/screenshots-and-videos#screenshot-and-video-directories) for path and recording customization
- adds additional param that can be used to limit number of logged requests (usually only last few requests matter)
- supports quarantine mode and parallel test execution

### Note

Only intercepts cross domain requests to avoid recording locally requested resources like HTML, CSS or JS.

## Prerequisite

In order to use global hooks, [TestCafe Javascript configuration file](https://testcafe.io/documentation/402638/reference/configuration-file#javascript) must be used.

## Install

```
npm install testcafe-global-network-request-logger
```

## Configuration

Once installed add `network` configuration in `.testcaferc.js` file

```js
module.exports = {
  // some other config
  network: {
    path: 'tmp',
    takeOnFails: true,
    pathPattern: '${DATE}/${FIXTURE}/network/${TEST}_${TIME}_${QUARANTINE_ATTEMPT}.json',
    requestLimit: 0,
  },
};
```

| Required | Argument             | Description                                                                                                                                                                                                                                           | Example              |
| -------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Yes      | network.path         | The base directory where screenshots are saved                                                                                                                                                                                                        | tmp                  |
| Yes      | network.takeOnFails  | `true` to take a screenshot whenever a test fails.                                                                                                                                                                                                    | true                 |
| Yes      | network.pathPattern  | A pattern that defines how TestCafe composes the relative path to a screenshot file. See [Screenshot and Video Directories](https://testcafe.io/documentation/402840/guides/advanced-guides/screenshots-and-videos#screenshot-and-video-directories). | ${DATE}/${TEST}.json |
| Yes      | network.requestLimit | defines number of requests that should be logged, `0` means all                                                                                                                                                                                       | 3                    |

## Enable request logging

Once configured last step is to attach hook in `.testcaferc.js` file

```js
const networkRequestLogger = require('testcafe-global-network-request-logger')(/* FILTER */);

module.exports = {
  // some other config
  network: {
    // network config
  },
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
```

### FILTER

Leave undefined for default (records all HTTP non OPTION, JSON requests) or define custom filter as described in [testcafe docs](https://testcafe.io/documentation/402769/reference/test-api/requestlogger/constructor#select-requests-to-be-handled-by-the-hook)

## Examples

See working examples in examples folder

## Author

Rafal Szczepankiewicz
