import * as React from "react";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {EmbraceNavigationTracker} from "@embrace-io/react-native-navigation";
import {useEmbraceSDK} from "./useEmbraceSDK";
import {EmbraceSDKStatus} from "./EmbraceSDKStatus";
import {LogTestingScreen} from "./screens/LogTestingScreen";
import {UserTestingScreen} from "./screens/UserTestingScreen";
import {SpanTestingScreen} from "./screens/SpanTestingScreen";
import {NetworkTestingScreen} from "./screens/NetworkTestingScreen";
import {ReduxTestingScreen} from "./screens/ReduxTestingScreen";
import FullScreenMessage from "./components/FullScreenMessage";

const Tab = createBottomTabNavigator();

const EmbraceReactNativeTestHarness = () => {
  const {isPending, isStarted, error} = useEmbraceSDK();
  const navigationContainer = useNavigationContainerRef();
  const navigationContainerRef = React.useRef(navigationContainer);
  const {tracerProvider, isLoading: isLoadingTracerProvider} =
    useEmbraceNativeTracerProvider({}, isStarted);

  if (isPending || !isStarted) {
    return <EmbraceSDKStatus isPending={isPending} error={error} />;
  }

  if (isLoadingTracerProvider || tracerProvider === null) {
    return <FullScreenMessage msg="Loading Tracer Provider" />;
  }

  return (
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

export {EmbraceReactNativeTestHarness};
