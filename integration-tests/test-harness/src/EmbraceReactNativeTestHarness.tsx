import * as React from "react";
import {LogTestingScreen} from "./screens/LogTestingScreen";
import {OTLPTestingScreen} from "./screens/OTLPTestingScreen";
import {PropertyTestingScreen} from "./screens/PropertyTestingScreen";
import {TracerProviderTestingScreen} from "./screens/TracerProviderTestingScreen";
import {MiscTestingScreen} from "./screens/MiscTestingScreen";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {EmbraceNavigationTracker} from "@embrace-io/react-native-navigation";
import {SpanTestingScreen} from "./screens/SpanTestingScreen";
import {NSFTestingScreen} from "./screens/NSFTestingScreen";

const Tab = createBottomTabNavigator();

export const EmbraceReactNativeTestHarness = () => {
  const navigationContainer = useNavigationContainerRef();
  const navigationContainerRef = React.useRef(navigationContainer);
  const {tracerProvider} = useEmbraceNativeTracerProvider({});

  return (
    // `NavigationContainer` is waiting for what `useNavigationContainerRef` is returning (both exported from `@react-navigation/native`)
    <NavigationContainer ref={navigationContainer}>
      <EmbraceNavigationTracker
        ref={navigationContainerRef}
        tracerProvider={tracerProvider || undefined}
        screenAttributes={{
          "is-test-harness": true,
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
            name="prop"
            options={{
              tabBarAccessibilityLabel: "PROPERTY TESTING",
            }}
            component={PropertyTestingScreen}
          />
          <Tab.Screen
            name="tracer"
            options={{
              tabBarAccessibilityLabel: "TRACER PROVIDER TESTING",
            }}
            component={TracerProviderTestingScreen}
          />
          <Tab.Screen
            name="otlp"
            options={{
              tabBarAccessibilityLabel: "EMBRACE OTLP",
            }}
            component={OTLPTestingScreen}
          />
          <Tab.Screen
            name="misc"
            options={{
              tabBarAccessibilityLabel: "MISC TESTING",
            }}
            component={MiscTestingScreen}
          />
          <Tab.Screen
            name="nsf"
            options={{
              tabBarAccessibilityLabel: "NSF TESTING",
            }}
            component={NSFTestingScreen}
          />
        </Tab.Navigator>
      </EmbraceNavigationTracker>
    </NavigationContainer>
  );
};
