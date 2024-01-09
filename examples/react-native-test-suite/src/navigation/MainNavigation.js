import React, {useRef, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useEmbraceNavigationTracker} from '@embrace-react-native/react-navigation';
import HomeScreen from '../screens/HomeScreen';

import NativeCrashes from '../screens/NativeCrashesScreen';
import JSCrashes from '../screens/JSCrashesScreen';

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
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="Actions" component={HomeScreen} />
      <Tab.Screen name="Crashes" component={CrashStack} />
    </Tab.Navigator>
  );
};

const MainNavigation = () => {
  const navigationRef = useRef();
  useEmbraceNavigationTracker(navigationRef);

  return (
    <NavigationContainer ref={navigationRef}>
      <BottomTab />
    </NavigationContainer>
  );
};
export default MainNavigation;
