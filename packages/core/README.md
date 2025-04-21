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

### Without hooks

Calling the `initialize` method setups up the tracking for the SDK on the JS side. This is needed even if you choose
to start the SDK earlier on the native side as explained below, however in that case the configuration passed through
in the `sdkConfig` object is ignored in favor of the native startup configuration.

```javascript
import React, { useEffect, useState } from 'react'
import { initialize } from '@embrace-io/react-native';

const App = () => {
  useEffect(() => {
    const initEmbrace = async () => {
      try {
        const isStarted = await initialize({
          sdkConfig: {
            ios: {
              appId: "abcdf",
            },
          },
        });

        if (isStarted) {
          // do something
        }
      } catch {
        console.log("Error initializing Embrace SDK");
      }
    };

    initEmbrace();
  });

  // regular content of the application
  return (
    ...
  );
}

export default App
```

### With hooks

We expose also a hook that handles the initialization of Embrace in a more React friendly way:

```javascript
import React, { useEffect, useState } from 'react'
import { useEmbrace } from '@embrace-io/react-native';

const App = () => {
  // minimum of configuration required
  const {isPending, isStarted} = useEmbrace({
    ios: {
      appId: "__APP_ID__", // 5 digits string
    },
  });


  if (isPending) {
    return (
      <View>
        <Text>Loading Embrace</Text>
      </View>
    );
  } else {
    if (!isStarted) {
      console.log('An error occurred during Embrace initialization');
    }
  }

  // regular content of the application
  return (
    ...
  );
}

export default App
```

In both cases we recommend to use these methods to initialize the React Native Embrace SDK at the top level of your
application just once to prevent side effects in the JavaScript layer.

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
