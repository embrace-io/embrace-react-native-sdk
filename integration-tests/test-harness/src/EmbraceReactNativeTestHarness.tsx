import * as React from "react";
import {useRef} from "react";
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
import {NavigationTracker} from "@opentelemetry/instrumentation-react-native-navigation";
import {SpanTestingScreen} from "./screens/SpanTestingScreen";
import {NSFTestingScreen} from "./screens/NSFTestingScreen";

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
      </NavigationTracker>
    </NavigationContainer>
  );
};
