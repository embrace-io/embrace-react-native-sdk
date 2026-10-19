# React Native Embrace - Navigation

> [!IMPORTANT]
>
> This module requires the [React Native Embrace SDK](https://www.npmjs.com/package/@embrace-io/react-native).

This package uses Embrace's React Native SDK and OpenTelemetry Tracer Provider to collect telemetry around Navigation based on [expo-router](https://github.com/expo/expo/tree/main/packages/expo-router), [@react-navigation/native](https://github.com/react-navigation/react-navigation) and [react-native-navigation](https://wix.github.io/react-native-navigation/).

For more information, see [Track navigation](https://embrace.io/docs/react-native/features/navigation/).

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

The tracker records its spans with the global OpenTelemetry tracer provider. By default, `initialize` from
`@embrace-io/react-native` registers the Embrace tracer provider as the global one, so call `initialize` before your app
renders and the tracker needs no further setup. `screenAttributes` are added to every span the tracker creates.

Using `expo-router`:

```javascript
import React from 'react';
import {EmbraceNavigationTracker} from "@embrace-io/react-native-navigation";
import {Stack, useNavigationContainerRef} from 'expo-router';

const App = () => {
  const expoNavigationRef = useNavigationContainerRef();

  return (
    <EmbraceNavigationTracker
      ref={expoNavigationRef}
      screenAttributes={{
        "static.attribute": 123456,
        "custom.key": "abcd...",
      }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{headerShown: false}} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </EmbraceNavigationTracker>
  );
};

export default App;
```

Using [@react-navigation/native](https://github.com/react-navigation/react-navigation), put the tracker inside your
`NavigationContainer`. Pass the value from `useNavigationContainerRef` to `NavigationContainer`, and wrap it in `useRef`
for the tracker:

```javascript
import React, {useRef} from 'react';
import {EmbraceNavigationTracker} from "@embrace-io/react-native-navigation";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import CartPage from "screens/CartPage";
import CheckoutPage from "screens/CheckoutPage";

const Tab = createBottomTabNavigator();

const App = () => {
  const navigationContainer = useNavigationContainerRef();
  const navigationRef = useRef(navigationContainer);

  return (
    <NavigationContainer ref={navigationContainer}>
      <EmbraceNavigationTracker
        ref={navigationRef}
        screenAttributes={{
          "static.attribute": 123456,
          "custom.key": "abcd...",
        }}>
        <Tab.Navigator>
          <Tab.Screen name="cart" component={CartPage} />
          <Tab.Screen name="checkout" component={CheckoutPage} />
        </Tab.Navigator>
      </EmbraceNavigationTracker>
    </NavigationContainer>
  );
};

export default App;
```

Using [react-native-navigation](https://wix.github.io/react-native-navigation/), wrap your app's entry screen with
`EmbraceNativeNavigationTracker`, and pass it the events registry from `Navigation.events()` wrapped in `useRef`:

```javascript
import React, {useRef} from "react";
import {EmbraceNativeNavigationTracker} from "@embrace-io/react-native-navigation";
import {Navigation} from "react-native-navigation";
import {HomeScreen} from "screens/HomeScreen";

Navigation.registerComponent(
  "HomeScreen",
  () => props => {
    const navRef = useRef(Navigation.events());

    return (
      <EmbraceNativeNavigationTracker
        ref={navRef}
        screenAttributes={{
          "static.attribute": 123456,
          "custom.key": "abcd...",
        }}>
        <HomeScreen {...props} />
      </EmbraceNativeNavigationTracker>
    );
  },
  () => HomeScreen,
);
```

## When Embrace is not the global tracer provider

If you pass `tracerProviderConfig: {registerGlobally: false}` to `initialize`, or another OpenTelemetry tracer provider
was registered as the global one first, the tracker's spans do not reach Embrace. Pass the Embrace tracer provider to
the tracker instead:

```javascript
import {getEmbraceTracerProvider} from "@embrace-io/react-native";

<EmbraceNavigationTracker
  ref={navigationRef}
  tracerProvider={getEmbraceTracerProvider()}>
  ...
</EmbraceNavigationTracker>
```

## Disable Auto Tracking for Native Screens

Embrace also collects native screens automatically. If you do not want to see native components in the session, you
can disable it in the native SDK configuration.

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
modify the setup in `EmbraceInitializer.swift` to remove the view capture service, see [Configurating the iOS SDK](https://embrace.io/docs/ios/open-source/integration/embrace-options/)
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
