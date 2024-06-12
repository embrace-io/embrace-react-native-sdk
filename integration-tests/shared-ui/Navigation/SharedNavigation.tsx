import React, { useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useEmbraceNavigationTracker } from "@embrace-io/react-navigation";
import NativeCrashes from "./screens/NativeCrashesScreen";
import JSCrashes from "./screens/JSCrashesScreen";
import HomeScreen from "./screens/HomeScreen";
import { INavigationRef } from "@embrace-io/react-navigation/lib/navigation/interfaces/NavigationInterfaces";

const Tab = createBottomTabNavigator();

const Stack = createNativeStackNavigator();

const CrashStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="NativeCrashes" component={NativeCrashes} />
    <Stack.Screen name="JsCrashes" component={JSCrashes} />
  </Stack.Navigator>
);

const BottomTab = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Actions" component={HomeScreen} />
      <Tab.Screen name="Crashes" component={CrashStack} />
    </Tab.Navigator>
  );
};

const SharedNavigation = () => {
  const navigationRef = useRef<any>();
  useEmbraceNavigationTracker(navigationRef as INavigationRef);

  return (
    <NavigationContainer ref={navigationRef}>
      <BottomTab />
    </NavigationContainer>
  );
};
export default SharedNavigation;
