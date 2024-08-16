/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';

import {Button, Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {initialize, triggerNativeCrash} from '@embrace-io/react-native';
//import CrashTester from 'react-native-crash-tester';

const Stack = createNativeStackNavigator();

function FirstScreen({navigation}) {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>First Screen</Text>
      <Button
        title="Go to Second Screen"
        onPress={() => navigation.navigate('SecondScreen')}
      />

      <Button
        title="native crash"
        onPress={() => {
          console.log('trigger native crash');
          triggerNativeCrash();
          //CrashTester.nativeCrash('Custom message for native crash!')
        }}
      />

      <Button
        title="js crash"
        onPress={() => {
          console.log('trigger js crash');
          throw new Error('This is a crash');
        }}
      />
    </View>
  );
}

function SecondScreen({navigation}) {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Second Screen</Text>
      <Button
        title="Go to First Screen"
        onPress={() => navigation.navigate('FirstScreen')}
      />
    </View>
  );
}

function App(): React.JSX.Element {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startEmbrace = async () => {
      try {
        const hasStarted = await initialize({
          sdkConfig: {
            ios: {
              appId: 'cvKeD',
            },
          },
        });
        if (hasStarted) {
          setLoading(false);
        } else {
          console.log("embrace didn't start");
        }
      } catch (e) {
        console.log(e);
      }
    };
    startEmbrace();
  }, []);

  if (loading) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text>Loading Embrace</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="FirstScreen">
        <Stack.Screen name="FirstScreen" component={FirstScreen} />
        <Stack.Screen name="SecondScreen" component={SecondScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
