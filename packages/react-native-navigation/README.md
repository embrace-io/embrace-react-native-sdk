# React Native Embrace - Navigation

> [!IMPORTANT]
>
> This module requires both the [React Native Embrace SDK](https://www.npmjs.com/package/@embrace-io/react-native) and
> the [React Native Embrace Tracer Provider](https://www.npmjs.com/package/@embrace-io/react-native-tracer-provider).

This package uses Embrace's React Native SDK and OpenTelemetry Tracer Provider to collect telemetry around Navigation based on [expo-router](https://github.com/expo/expo/tree/main/packages/expo-router), [@react-navigation/native](https://github.com/react-navigation/react-navigation) and [react-native-navigation](https://wix.github.io/react-native-navigation/).

## Install the component

npm:

```sh
npm install @embrace-io/react-native-navigation
```

yarn:

```sh
yarn add @embrace-io/react-native-navigation
```

## Setup in your code

Using `expo-router`:

```javascript
import React from 'react';
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {EmbraceNavigationTracker} from "@embrace-io/react-native-navigation";
import {Stack, useNavigationContainerRef} from 'expo-router';
import {useEmbrace} from "@embrace-io/react-native";

const App = () => {
  const {isStarted} = useEmbrace({
    ios: {
      appId: "__APP_ID__"
    }
  });

  // The provider is something you need to configure and pass down as prop into the `<EmbraceNavigationTracker />` component 
  // If your choice is not to pass any custom tracer provider, the component will use the global one.
  // In both cases you have to make sure a tracer provider is registered BEFORE you attempt to record the first span (otherwise somo initial telemetry can be missed).
  const {tracerProvider, isLoading: isLoadingTracerProvider} =
    useEmbraceNativeTracerProvider({}, isStarted);

  // If you do not use `expo-router` the same hook is also available in `@react-navigation/native` since `expo-router` is built on top of it.
  // Make sure this ref is passed also to the navigation container at the root of your app (if not, the ref would be empty and you will get a console.warn message instead).
  const expoNavigationRef = useNavigationContainerRef();

  if (isLoadingTracerProvider || tracerProvider === null) {
    return (
      <View>
        <View>
          <Text>Loading Tracer Provider...</Text>
        </View>
      </View>
    );
  }

  return (
    <EmbraceNavigationTracker
      ref={expoNavigationRef}
      tracerProvider={tracerProvider}
      // These static attributes will be passed into each created span
      screenAttributes={{
          "static.attribute": 123456,
          "custom.key": "abcd...",
      }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{headerShown: false}} />
        <Stack.Screen name="+not-found" />
        ... rest of stack
      </Stack>
    </EmbraceNavigationTracker>
  );
};

export default App;
```

If you are using purely [@react-navigation/native](https://github.com/react-navigation/react-navigation):

```javascript
import React from 'react';
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {EmbraceNavigationTracker} from "@embrace-io/react-native-navigation";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {useEmbrace} from "@embrace-io/react-native";
import CartPage from "screens/CartPage";
import CheckoutPage from "screens/CheckoutPage";

const Tab = createBottomTabNavigator();

const App = () => {
  const {isStarted} = useEmbrace({
    ios: {
      appId: "__APP_ID__"
    }
  });

  // The provider is something you need to configure and pass down as prop into the `EmbraceNavigationTracker` component 
  // If your choice is not to pass any custom tracer provider, the <EmbraceNavigationTracker /> component will use the global one.
  // In both cases you have to make sure a tracer provider is registered BEFORE you attempt to record the first span.
  const {tracerProvider, isLoading: isLoadingTracerProvider} =
    useEmbraceNativeTracerProvider({}, isStarted);

  // Tip! as of now if you inspect the source code of `useNavigationContainerRef` from `@react-navigation/native` you will see that it returns `navigation.current` instead of the entire shape of a reference
  const navigationRefVal = useNavigationContainerRef();
  // We need here the entire shape, so we re-create it and pass it down into the `ref` prop for the `EmbraceNavigationTracker` component.
  const navigationRef = useRef(navigationRefVal);

  if (isLoadingTracerProvider || tracerProvider === null) {
    return (
      <View>
        <View>
          <Text>Loading Tracer Provider...</Text>
        </View>
      </View>
    );
  }

  return (
    // `NavigationContainer` is waiting for what `useNavigationContainerRef` is returning (both exported from `@react-navigation/native`)
    <NavigationContainer ref={navigationRefVal}>
      <EmbraceNavigationTracker
        ref={navigationRef}
        tracerProvider={tracerProvider}
        screenAttributes={{
          "static.attribute": 123456,
          "custom.key": "abcd...",
        }}>
        <Tab.Navigator
          screenOptions={{
            tabBarLabelPosition: "beside-icon",
            tabBarIconStyle: {display: "none"},
          }}>
          <Tab.Screen
            name="cart"
            options={{
              tabBarAccessibilityLabel: "Cart",
            }}
            component={CartPage}
          />
          <Tab.Screen
            name="checkout"
            options={{
              tabBarAccessibilityLabel: "Checkout",
            }}
            component={CheckoutPage}
          />
          ... rest of tabs
        </Tab.Navigator>
      </EmbraceNavigationTracker>
    </NavigationContainer>
  );
};

export default App;
```

NOTE: If you are using [@react-navigation/native](https://github.com/react-navigation/react-navigation) you need to wrap your entire application with the `NavigationTracker` component as described in their official documentation.

If you are using [react-native-navigation](https://wix.github.io/react-native-navigation/) you are also able to track navigation changes.
You have to make sure you wrap your entry view with the `<EmbraceNativeNavigationTracker />` component and initialize Embrace as soon as possible to avoid missing telemetry data.

```javascript
// index.ts
import React, {useRef} from "react";
import {EmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {TracerProvider} from "@opentelemetry/api";
import {EmbraceNativeNavigationTracker} from "@embrace-io/react-native-navigation";
import {initialize} from "@embrace-io/react-native";
import {Navigation} from "react-native-navigation";
import {HomeScreen} from "screens/HomeScreen";

const initApp = async () => {
  // this example is showing how we can initialize Embrace not using hooks
  await initialize({
    sdkConfig: {
      ios: {appId: "__APP_ID__"},
    },
  });

  let embraceTracerProvider: TracerProvider;
  try {
    embraceTracerProvider = new EmbraceNativeTracerProvider();
  } catch (e) {
    console.log(
      "Error creating `EmbraceNativeTracerProvider`. Will use global tracer provider instead",
      e,
    );
  }

  Navigation.registerComponent(
    "HomeScreen",
    () =>
      (props) => {
        // make sure to wrap the events registry instance in a React ref
        const navRef = useRef(Navigation.events());

        return (
          <EmbraceNativeNavigationTracker
            ref={navRef}
            tracerProvider={embraceTracerProvider}
            screenAttributes={{
              "test.attr": 98765,
              dev: true,
            }}>
            <HomeScreen {...props} />
          </EmbraceNativeNavigationTracker>
        );
      },
    () => HomeScreen,
  );

  // ... rest of registration and configuration
};

// root of the app
initApp();
```

## Disable Auto Tracking for Native Screens

Embrace also collects automatically the Native screens, if you do not want to see Native components in the Session you can disable it:

### JavaScript

```javascript
const App = () => {
  const {isPending, isStarted} = useEmbrace({
    ios: {
      appId: "__APP_ID__",
      disableAutomaticViewCapture: true, // disabling the feature just for iOS
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

### Android

Go to your `embrace-config.json` inside `android/app/src/main` and edit the `sdk_config` key.
With these changes your file should at least look like the following:

```json
{
  "app_id": "APP_ID",
  "api_token": "API_TOKEN",
  "sdk_config": {
    "app_framework": "react_native",
    "view_config": {
      "enable_automatic_activity_capture": false // disabling automatic capture
    }
  }
}
```

### iOS:

If you used the automated installation script or followed the manual steps for setting up the iOS SDK then you can
modify the setup in `EmbraceInitializer.swift` to remove the view capture service, see [Configurating the iOS SDK](/ios/open-source/integration/embrace-options/)
for more details:

```swift
import Foundation
import EmbraceIO
import EmbraceCrash

@objcMembers class EmbraceInitializer: NSObject {
    static func start() -> Void {
        do {
         
            try Embrace
                .setup(
                    options: Embrace.Options(
                        appId: "__APP_ID__",
                        platform: .reactNative,
                        captureServices: CaptureServiceBuilder()
                            .addDefaults()
                            .remove(ofType: ViewCaptureService.self)
                            .build(),
                        crashReporter: EmbraceCrashReporter()
                    )
                )
                .start()
        } catch let e {
            print("Error starting Embrace \(e.localizedDescription)")
        }
    }
}
```