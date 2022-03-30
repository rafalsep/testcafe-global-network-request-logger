# Global Hook for testcafe that records and saves JSON request/response
[![Build Status](https://travis-ci.org/rafalsep/testcafe-global-network-request-logger.svg)](https://travis-ci.org/rafalsep/testcafe-global-network-request-logger)

Uses TestCafe [global hooks](https://testcafe.io/documentation/403435/guides/advanced-guides/hooks#global-hooks) to record network calls executed in browser and saves them into file using same format as screenshots/videos.
It is meant to be used in CI, together with screenshot & video recording for better troubleshooting capability of failed tests

<p align="center">
    <img src="https://raw.github.com/rafalsep/testcafe-global-network-request-logger/master/media/content.png" alt="content" />
</p>

## Features
- supports gzipped or JSON responses
- once attached will execute for all tests
- uses similar config as screenshot and video for path and recording customization
- adds additional param that can be used to limit number of logged requests (usually only last few requests matter)
- supports quarantine mode and parallel test execution

### Note
Only intercepts cross domain requests to avoid recording locally requested resource files like HTML, CSS, JS or JSON.

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
  }
};
```

| Required | Argument               | Description                                                                                                                                                                                                                                            | Example                |
| -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| Yes      | network.path           | The base directory where screenshots are saved                                                                                                                                                                                                         | tmp                    |
| Yes      | network.takeOnFails    | `true` to take a screenshot whenever a test fails.                                                                                                                                                                                                     | true                   |
| Yes      | network.pathPattern    | A pattern that defines how TestCafe composes the relative path to a screenshot file. See [Screenshot and Video Directories](https://testcafe.io/documentation/402840/guides/advanced-guides/screenshots-and-videos#screenshot-and-video-directories).  | ${DATE}/${TEST}.json   |
| Yes      | network.requestLimit   | defines number of requests that should be logged, `0` means all                                                                                                                                                                                        | 3                      |

## Enable request logging
Once configured last step is to attach hook in `.testcaferc.js` file

```js
const { onRequest, onResponse } = require('testcafe-global-network-request-logger');

module.exports = {
  // some other config
  network: {
    // network config
  },
  hooks: {
    test: {
      before: async t => {
        await onRequest(t);
      },
      after: async t => {
        await onResponse(t);
      },
    },
  },
};
```

## Author
Rafal Szczepankiewicz
