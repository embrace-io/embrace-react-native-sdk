The tooling in this directory is intended to facilitate both manual QA and integration testing of React Native apps
integrated with the Embrace SDK.

## Setup

```bash
npm install
```

## Test Applications

Because React Native has not yet reached 1.0.0 each minor version release has the potential to introduce breaking
changes, so we aim to test the Embrace SDK across a range of current and past minor versions
([see here](https://reactnative.dev/versions) for a current list).

To help spin up these apps we leverage react native templates and include one per minor version / framework we want to
do testing on.

### Creating new application templates

A simple way to create a new template is to start by creating an app using `@react-native-community/cli init` at the
desired RN version:

```bash
npx @react-native-community/cli init ProjectName --skip-git-init --skip-install --pm yarn --version 0.x.y
```

Then moving over the created app into the templates folder (`mv ProjectName templates/my-new-template`), removing any
unneeded files, and adding Embrace specific setup.

The ["Current Tags"](https://www.npmjs.com/package/react-native?activeTab=versions) section of the react-native package
in NPM can help decide which specific patch version to pin the template to for a given minor version, there will generally
be one that has been tagged with `0.minor-stable`.

A similar approach can be done using Expo's cli for creating new apps:

```bash
npx create-expo
```

Though note that in this case a version can't be passed as different releases of expo are tied to particular RN versions,
instead you can run a different version of the `create-expo` package.

### Creating new apps from templates

New test apps can be created from templates as needed. To create a new bare react native app run:

```bash
npx @react-native-community/cli init <test-app> --package-name io.embrace.<test-app> --skip-git-init --skip-install --pm yarn --template $(pwd)/templates/react-native-test-app-template
```

To create a new test expo app run:

```bash
npx create-expo --template ./templates/<template-app>/<artifact>.tgz
```

For one-off testing the created app can just be removed afterward. If the app represents a particular setup that we
will need to test in the future it can be committed to the repo. For example the `basic-test-app` is useful to keep in
the repo for quickly testing a basic app setup from React Native's [getting started guide](https://reactnative.dev/docs/environment-setup#start-a-new-react-native-project-with-expo).

## Running Applications

### Embrace setup

Make sure the test app has the latest locally built @embrace-io/* packages and test harness:
```bash
./update-local-embrace.sh <test-app>
```

Set the test app up with a particular embrace config:
```bash
npm run set-embrace-config <test-app> <dir/config.json> --namespace=<namespace>
```

Depending on the testing being done `embrace-configs/` has a few different configuration options: 
* using real app_ids without setting `endpoint` -> Sends actual data to Embrace allowing verifications to be done on
the Embrace dashboard
* pointing to either a local or remote mock-api -> Data is captured by the mock-api tool allowing the payloads that
would have been sent to Embrace to be verified

### Build and install on device

NOTE: when building for manual QA the default debug variant is usually fine, however this version interferes with
automated testing as the debug menu gets in the way of UI elements.

Android can be built and run in release mode by doing:

```bash
cd <test-app>
# expo
npx expo run:android --variant release
# react native
npx react-native run-android --mode release
```

For iOS, before running it

```bash
cd <test-app>/ios
pod install
```

And then it can be built and run in release mode by doing:

```bash
cd ..
# expo
npx expo run:ios --configuration Release
# react native
pushd ios && pod install && popd
npx react-native run-ios --mode Release
```

or through xCode:

- Open the test app project in Xcode.
- Select your target and go to Product > Scheme > Edit Scheme.
- Under the Run section, change the Build Configuration from Debug to Release.
- Press Cmd + R to build and run the app in release mode.

## Integration Testing

For automated testing WebdriverIO's [Testrunner](https://webdriver.io/docs/testrunner/) is used to spin up an [Appium](http://appium.io/docs/en/latest/intro/)
client and server to perform the device automation. [Mockserver](https://www.mock-server.com/#what-is-mockserver) is
launched for the suite run so that requests sent from the device can be inspected.

### Running locally

Follow the steps from "Build and install on device" above to have an app running on an emulator with the Embrace test
harness and pointing to the local node mock server.

Run the integration tests specifying the package name of app being tested

```bash
npm test -- --package=foobar --platform=android # ios, both
```

### CI

TODO for the moment the utility here is to be able to run tests locally during development, as a next task need to hook this up to
CI tools to verify a passing suite for new releases. Likely this means updating or creating a new `wdio.conf.ts` that
can be configured to point to a remote environment. See what capabilities are available for that [here](https://appium.io/docs/en/2.1/guides/caps/)

### Adding new specs

Each test app should render the `EmbraceTestHarness` component which includes UI elements for interacting with the Embrace
SDK. Likely any new specs should start with adding a new UI element in `test-harness` that can be interacted with
for the test. Every React Native test app should then get this new functionality automatically, the Expo apps use file-based
navigation so if a new testing screen is added those apps and templates will have to be updated with a new tab for it.

The verification of the payload sent as a result of that interaction should then be added under `specs/`.

## Troubleshooting

### Appium updates

If needing to do any future updates to Appium the [Appium Installer](https://webdriver.io/docs/appium) provides a handy
setup wizard:

```bash
npx appium-installer
```

### UI element not found during testing

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

### Appium gives 500 during test run

"Could not proxy command to remote server. Original error: Error: socket hang up"

Try:

```bash
# Android
adb uninstall io.appium.uiautomator2.server
adb uninstall io.appium.uiautomator2.server.test

# iOS
xcrun simctl uninstall booted io.appium.uiautomator2.server
xcrun simctl uninstall booted io.appium.uiautomator2.server.test
```
