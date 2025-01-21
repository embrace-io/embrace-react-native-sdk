# React Native Embrace

Embrace gathers the information needed to identify issues and measure performance automatically upon integration.
The following React Native guide provides simple instruction on how to call the relevant functions so teams can be provided
much needed additional context (logs and user info) and measure the timing of key areas of their app explicitly (spans).

For additional info please refer to the [React Native Guide](https://embrace.io/docs/react-native).

# Requirements

Only an Embrace App ID and an Embrace API Token.

_If you need an App ID and API Token, [Go to our dashboard](https://dash.embrace.io/signup/) to create an account._

# Integration

## Add the JavaScript library

npm:

```sh
npm install @embrace-io/react-native
```

yarn:

```sh
yarn add @embrace-io/react-native
```

For iOS you will also need to install or update pods for the application:

```sh
cd ios && pod install --repo-update
```

## Run the setup scripts

The JavaScript Embrace SDK ships with a setup script to modify the files in your
project to add the native dependencies. The setup scripts can be found in your
`node_modules` folder at `node_modules/@embrace-io/react-native/lib/scripts/setup`

```bash
node node_modules/@embrace-io/react-native/lib/scripts/setup/installAndroid.js
```

```bash
node node_modules/@embrace-io/react-native/lib/scripts/setup/installIos.js
```

To run these steps manually refer to [this section of our guide](https://embrace.io/docs/react-native/integration/add-embrace-sdk/#manually)

## Initialize the Embrace SDK

Initialize method applies the necessary listener to your application. This allow Embrace to track javascript errors, check js bundle changes (if you use OTA), track js patch and react native versions.

```javascript
import {View} from "react-native";
import React, {useEffect} from "react";
import {initialize} from "@embrace-io/react-native";

const App = () => {
  useEffect(() => {
    // `initialize` is a Promise, so if you want to perform an action and it must be tracked, it is recommended to await for the method to finish
    const handleInit = async () => {
      const hasStarted = await initialize({
        sdkConfig: {
          ios: {
            appId: "abcdf",
          },
        },
      });

      if (hasStarted) {
        // do something
      }
    };

    handleInit();
  }, []);

  // rest of the app
  return <View>...</View>;
};

export default App;
```

## Uploading source maps

The Embrace SDK allows you to view both native and JavaScript stack traces for crashes and error logs.
Refer to our guide on [uploading symbol files](https://embrace.io/docs/react-native/integration/upload-symbol-files/).

## Additional features

Additional features for our SDK are kept in other packages to allow you to include just the dependencies for the ones
you are using and to keep your overall bundle size smaller. Once this core package is installed you can check out the
documentation in our [Feature Reference](/react-native/features/) to learn more about these additional packages. The
various screens in our [Test Harness](https://github.com/embrace-io/embrace-react-native-sdk/tree/main/integration-tests/test-harness)
also provide examples of how these packages can be used with the core SDK.

## Troubleshooting

Please refer to our [complete integration guide](https://embrace.io/docs/react-native/integration/). If you continue
to run into issues please [contact us directly](mailto:support@embrace.io) or reach out in our [Community Slack](https://community.embrace.io)
