import * as React from "react";
import {useRef} from "react";
import {LogTestingScreen} from "./screens/LogTestingScreen";
import {UserTestingScreen} from "./screens/UserTestingScreen";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {NavigationTracker} from "@opentelemetry/instrumentation-react-native-navigation";
import {SpanTestingScreen} from "./screens/SpanTestingScreen";
import {NetworkTestingScreen} from "./screens/NetworkTestingScreen";
import {ReduxTestingScreen} from "./screens/ReduxTestingScreen";

const Tab = createBottomTabNavigator();

export const EmbraceReactNativeTestHarness = () => {
  const navigationContainer = useNavigationContainerRef();
  const navigationContainerRef = useRef(navigationContainer);
  const {tracerProvider} = useEmbraceNativeTracerProvider({});

  return (
    // `NavigationContainer` is waiting for what `useNavigationContainerRef` is returning (both exported from `@react-navigation/native`)
    <NavigationContainer ref={navigationContainer}>
      <NavigationTracker
        ref={navigationContainerRef}
        provider={tracerProvider || undefined}
        config={{
          attributes: {
            "emb.type": "ux.view",
          },
          debug: true,
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
      </NavigationTracker>
    </NavigationContainer>
  );
};
