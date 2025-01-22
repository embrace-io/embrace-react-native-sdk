import * as React from "react";
import {LogTestingScreen} from "./screens/LogTestingScreen";
import {UserTestingScreen} from "./screens/UserTestingScreen";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {EmbraceNavigationTracker} from "@embrace-io/react-native-navigation";
import {SpanTestingScreen} from "./screens/SpanTestingScreen";
import FullScreenMessage from "./components/FullScreenMessage";
import {NetworkTestingScreen} from "./screens/NetworkTestingScreen";
import {ReduxTestingScreen} from "./screens/ReduxTestingScreen";

const Tab = createBottomTabNavigator();

export const EmbraceReactNativeTestHarness = () => {
  const navigationContainer = useNavigationContainerRef();
  const navigationContainerRef = React.useRef(navigationContainer);

  const {tracerProvider, isLoading: isLoadingTracerProvider} =
    useEmbraceNativeTracerProvider({});

  if (isLoadingTracerProvider || tracerProvider === null) {
    return <FullScreenMessage msg="Loading Tracer Provider" />;
  }

  return (
    // `NavigationContainer` is waiting for what `useNavigationContainerRef` is returning (both exported from `@react-navigation/native`)
    <NavigationContainer ref={navigationContainer}>
      <EmbraceNavigationTracker
        ref={navigationContainerRef}
        tracerProvider={tracerProvider}
        screenAttributes={{
          "test.attr": 654321,
          package: "@react-navigation/native",
        }}>
        <Tab.Navigator
          screenOptions={{
            tabBarLabelPosition: "beside-icon",
            tabBarIconStyle: {display: "none"},
          }}>
          <Tab.Screen
            name="log"
            options={{
              tabBarAccessibilityLabel: "LOG TESTING",
            }}
            component={LogTestingScreen}
          />
          <Tab.Screen
            name="span"
            options={{
              tabBarAccessibilityLabel: "SPAN TESTING",
            }}
            component={SpanTestingScreen}
          />
          <Tab.Screen
            name="user"
            options={{
              tabBarAccessibilityLabel: "USER TESTING",
            }}
            component={UserTestingScreen}
          />
          <Tab.Screen
            name="network"
            options={{
              tabBarAccessibilityLabel: "NETWORK TESTING",
            }}
            component={NetworkTestingScreen}
          />
          <Tab.Screen
            name="redux"
            options={{
              tabBarAccessibilityLabel: "REDUX TESTING",
            }}
            component={ReduxTestingScreen}
          />
        </Tab.Navigator>
      </EmbraceNavigationTracker>
    </NavigationContainer>
  );
};
