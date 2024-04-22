import React, {useRef, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useEmbraceNavigationTracker} from '@embrace-io/react-navigation';
import HomeScreen from '../screens/HomeScreen';

import NativeCrashes from '../screens/NativeCrashesScreen';
import JSCrashes from '../screens/JSCrashesScreen';
import Breadcrumbs from '../screens/tests/Breadcrumbs';
import SendScreen from '../screens/tests/SendScreen';

const Tab = createBottomTabNavigator();

const Stack = createNativeStackNavigator();

const CrashStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="NativeCrashes" component={NativeCrashes} />
    <Stack.Screen name="JsCrashes" component={JSCrashes} />
  </Stack.Navigator>
);
const ActionStack = createNativeStackNavigator();

const ActionStacks = () => (
  <ActionStack.Navigator screenOptions={{headerShown: false}}>
    <ActionStack.Screen name="HomeScreen" component={HomeScreen} />
    <ActionStack.Screen name="Breadcrumbs" component={Breadcrumbs} />
    <ActionStack.Screen name="SendScreen" component={SendScreen} />
  </ActionStack.Navigator>
);
const BottomTab = () => {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="Actions" component={ActionStacks} />
      <Tab.Screen name="Crashes" component={CrashStack} />
    </Tab.Navigator>
  );
};

const MainNavigation = () => {
  const navigationRef = useRef();
  useEmbraceNavigationTracker(navigationRef);

  console.log('ASD', navigationRef.current);
  const deepLinksConf = {
    screens: {
      Actions: {
        screens: {
          Breadcrumbs: {
            path: 'breadcrumbs',
          },
          SendScreen: {
            path: 'sendData',
          },
        },
      },
    },
  };

  const linking = {
    prefixes: ['tests://'],
    config: deepLinksConf,
  };
  return (
    <NavigationContainer ref={navigationRef}>
      <Tab.Navigator screenOptions={{headerShown: false}}>
        <Tab.Screen name="Actions" component={ActionStacks} />
        <Tab.Screen name="Crashes" component={CrashStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
export default MainNavigation;
