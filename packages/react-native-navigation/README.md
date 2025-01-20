# React Native Embrace - Navigation

TBD

## Install

```sh
yarn add @embrace-io/react-native-navigation
```

or

```sh
npm install @embrace-io/react-native-navigation
```

## Setup in your code

If you are using `expo-router` or `@react-navigation/native` you need to wrap your entire application with the `NavigationTracker` component.

Using `expo-router`:

```javascript
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {EmbraceNavigationTracker} from "@embrace-io/react-native-navigation";
import {Stack, useNavigationContainerRef} from 'expo-router';
import {useEmbrace} from "@embrace-io/react-native";

const App: FC = () => {
  const {isStarted} = useEmbrace({ios: {appId: "abc123"}});

  // The provider is something you need to configure and pass down as prop into the `EmbraceNavigationTracker` component 
  // If your choice is not to pass any custom tracer provider, the <EmbraceNavigationTracker /> component will use the global one.
  // In both cases you have to make sure a tracer provider is registered BEFORE you attempt to record the first span.
  const {tracerProvider, isLoading: isLoadingTracerProvider} =
    useEmbraceNativeTracerProvider({}, isStarted);

  // If you do not use `expo-router` the same hook is also available in `@react-navigation/native` since `expo-router` is built on top of it
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
        "static.attribute.key": "static.attribute.value",
        "custom.attribute.key": "custom.attribute.value",
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

If you are using purely `@react-navigation/native`:

```javascript
import {FC} from 'react';
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
  const {isStarted} = useEmbrace({ios: {appId: "abc123"}});

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
          "static.attribute.key": "static.attribute.value",
          "custom.attribute.key": "custom.attribute.value",
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
        </Tab.Navigator>
      </EmbraceNavigationTracker>
    </NavigationContainer>
  );
};

export default App;
```

If you are using `wix/react-native-navigation` you are also able to track navigation.
You have to make sure you wrap your Root view with the `EmbraceNativeNavigationTracker` component and configure it as described before. 

```javascript
TBD example
```