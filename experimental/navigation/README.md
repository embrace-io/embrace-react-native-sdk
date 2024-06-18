# OpenTelemetry Navigation Instrumentation for React Native
This is an experimental package under active development. New releases may include breaking changes.

This module provides instrumentation for [react-native/nagivation](https://reactnavigation.org/docs/getting-started), [expo-router](https://docs.expo.dev/router/introduction/) and [wix/react-native-navigation](https://wix.github.io/react-native-navigation/docs/before-you-start/)

## Installation
```
npm i @embrace-io/react-native
```

or if you use yarn

```
yarn add @embrace-io/react-native
```

## Supported Versions
  - Nodejs `>=14`

## Usage
This package is designed to streamline your workflow by requiring minimal setup. To use this package, you only need to pass a reference and a provider.

If you are using `expo-router` or `react-native/navigation` you need to wrap your entire application with the `NavigationTracker` component.

```javascript
import {FC} from 'react';
import {Stack, useNavigationContainerRef} from 'expo-router';
import {NavigationTracker} from '@embrace/react-native/experimental/navigation';

const App: FC = () => {
  const navigationRef = useNavigationContainerRef(); // if you do not use `expo-router` the same hook is also available in `@react-navigation/native` since `expo-router` is built on top of it
  const provider = useProvider(); // the provider is something you need to configure and pass down as prop into the `NavigationTracker` component

  return (
    <NavigationTracker ref={navigationRef} provider={provider}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{headerShown: false}} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </NavigationTracker>
  );
};

export default App;
```

If you are using `wix/react-native-navigation` you are also able to track navigation changes by importing and implement the `NativeNavigationTracker` component. The purpose in here is to wrap the entire application with the exposed component.

```javascript
import {FC} from 'react';
import {NativeNavigationTracker} from '@embrace/react-native/experimental/navigation';
import {Navigation} from "react-native-navigation";

Navigation.registerComponent('Home', () => HomeScreen);

Navigation.events().registerAppLaunchedListener(async () => {
  Navigation.setRoot({
    root: {
      stack: {
        children: [
          {
            component: {
              name: 'Home'
            }
          }
        ]
      }
    }
  });
});

const HomeScreen: FC = () => {
  const navigationRef = useRef(Navigation.events()); // this is the important part. Make sure you pass a reference with the return of Navigation.events();
  const provider = useProvider(); // again, the provider should be passed down into the `NativeNavigationTracker` with the selected exporter and processor configured

  return (
    <NativeNavigationTracker ref={navigationRef} provider={provider}>
      {/* content of the app goes here */}
    </NavigationTracker>
  );
};

export default App;
```

### NOTE
`useProvider` hook in this example returns an instance of a configured provided.
It doesn't matter what provider you pick, you just need to pass down one with all of your configurations. In order to create that provider you would probably need to take a look at the official [Open Telemetry JS docs](https://github.com/open-telemetry/opentelemetry-js). You can take a look at our suggestion (`experimental/testUtils/hooks/useProvider.ts`) but have in consideration this is the smallest and simplest provider that adds just few configurations.
