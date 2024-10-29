import * as React from "react";
import {useRef} from "react";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {
  LogTestingScreen,
  TracerProviderTestingScreen,
} from "@embrace-io/react-native-test-harness";
import {useEmbraceNavigationTracker} from "@embrace-io/react-navigation";

const Tab = createBottomTabNavigator();

const EmbraceNavigation = () => {
  const navigationContainer = useNavigationContainerRef();
  const navigationContainerRef = useRef(navigationContainer);

  useEmbraceNavigationTracker(navigationContainerRef);

  return (
    <NavigationContainer ref={navigationContainerRef}>
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
    </NavigationContainer>
  );
};

export default EmbraceNavigation;
