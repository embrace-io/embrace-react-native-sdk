An integration test harness that runs RN apps integrated with the Embrace SDK and sets up a mock server to allow
verifications on the payloads that would have been sent to Embrace.

## Setup

The harness uses WebdriverIO's [Testrunner](https://webdriver.io/docs/testrunner/) to spin up a [Appium](http://appium.io/docs/en/latest/intro/) client and server to perform the device automation. [Mockserver](https://www.mock-server.com/#what-is-mockserver) is
launched for the suite run so that requests sent from the device can be inspected.

    ```bash
    npm install
    ```

For any future updates the [Appium Installer](https://webdriver.io/docs/appium) provides a handy setup wizard:

    ```bash
    npx appium-installer
    ```

## Run tests

Make sure the test apps have the latest local @embrace-io/react-native changes:

    ```bash
    npm run update-local-embrace
    ```

Make sure the test apps are installed on the device/emulator before running tests. Note that building the debug variant
of the app may interfere with the tests as the debug menu gets in the way of UI elements.

Android can run in release mode:

```bash
cd basic-test-app
npx expo run:android --variant release
```

For ios it doesn't apply the `--variant release` mode, so we can do it through xcode:

- Open your project in Xcode.
- Select your target and go to Product > Scheme > Edit Scheme.
- Under the Run section, change the Build Configuration from Debug to Release.
- Press Cmd + R to build and run the app in release mode.

or simply run 

```bash
npx expo run:ios --configuration Release
```

Run the test suite:

    ```bash
    npm test
    ```

## Debugging tips

### Appium Inspector

To help figure out the selectors to use for grabbing UI elements it can be useful to interact with Appium using
the Appium Inspector. First install the Appium server and drivers globally:

    ```bash
    npm install -g appium
    appium driver install uiautomator2 # android / ios
    appium driver install xcuitest # ios
    ```

Then install [Appium Inspector](https://github.com/appium/appium-inspector)

### Mockserver

You can invoke the Mockserver and watch its output directly to get a look at the payloads it is receiving at different
endpoints (Note this may include some binary output that doesn't play nice with your terminal):

    ```bash
    npx tsx helpers/invoke_embrace_server.ts
    ```

## CI

TODO for the moment the utility here is to be able to run tests locally during development, as a next task need to hook this up to
CI tools to verify a passing suite for new releases. Likely this means updating or creating a new `wdio.conf.ts` that
can be configured to point to a remote environment. See what capabilities are available for that [here](https://appium.io/docs/en/2.1/guides/caps/)