import * as React from "react";
import {LogTestingScreen} from "./screens/LogTestingScreen";
import {TracerProviderTestingScreen} from "./screens/TracerProviderTestingScreen";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {NavigationTracker} from "@opentelemetry/instrumentation-react-native-navigation";

const Tab = createBottomTabNavigator();

export const EmbraceReactNativeTestHarness = () => {
  const navigationContainerRef = useNavigationContainerRef();
  const {tracerProvider} = useEmbraceNativeTracerProvider({});

  return (
    <NavigationContainer ref={navigationContainerRef}>
      <NavigationTracker
        // @ts-ignore
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
            name="LOG TESTING"
            options={{
              tabBarAccessibilityLabel: "LOG TESTING",
            }}
            component={LogTestingScreen}
          />
          <Tab.Screen
            name="TRACER PROVIDER TESTING"
            options={{
              tabBarAccessibilityLabel: "TRACER PROVIDER TESTING",
            }}
            component={TracerProviderTestingScreen}
          />
        </Tab.Navigator>
      </NavigationTracker>
    </NavigationContainer>
  );
};
