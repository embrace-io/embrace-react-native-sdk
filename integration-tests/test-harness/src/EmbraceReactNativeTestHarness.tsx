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
import FullScreenMessage from "./components/FullScreenMessage";
import {useEmbrace} from "@embrace-io/react-native";
import {ReduxTestingScreen} from "./screens/ReduxTestingScreen";

const Tab = createBottomTabNavigator();

export const EmbraceReactNativeTestHarness = () => {
  const navigationContainer = useNavigationContainerRef();
  const navigationContainerRef = React.useRef(navigationContainer);

  // TBD: should we have a different hook that tell us if Embrace is started without the need of passing sdk config?
  // FIXME: if we use the hook multiple times as it is now it's printing extra console logs making me think some code is running multiple times when it shouldn't. To double-check during QA.
  const {isStarted} = useEmbrace({ios: {appId: "abc123"}}); // here the hook would ignore whatever we put in since the sdk is already is started (done in the root of test harness)

  const {tracerProvider, isLoading: isLoadingTracerProvider} =
    useEmbraceNativeTracerProvider({}, isStarted);

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
