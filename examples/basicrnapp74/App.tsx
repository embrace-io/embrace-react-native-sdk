/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useRef, useState} from 'react';
import codePush from 'react-native-code-push';
import {Button, Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  initialize,
  addBreadcrumb,
  setUserIdentifier,
  clearUserIdentifier,
  addUserPersona,
  clearUserPersona,
  addSessionProperty,
  removeSessionProperty,
  startView,
  endView,
  logScreen,
  logMessage,
  getCurrentSessionId,
  getDeviceId,
  getLastRunEndState,
} from '@embrace-io/react-native';

import {
  startSpan,
  stopSpan,
  addSpanAttributeToSpan,
  addSpanEventToSpan,
  recordSpan,
  recordCompletedSpan,
} from '@embrace-io/react-native-spans';

import {useEmbraceNavigationTracker} from '@embrace-io/react-navigation';
import {
  applyMiddleware,
  compose,
  configureStore,
  createSlice,
} from '@reduxjs/toolkit';
import {buildEmbraceMiddleware} from '@embrace-io/react-native-action-tracker';
import {useEmbraceOrientationLogger} from '@embrace-io/react-native-orientation-change-tracker';

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0,
  },
  reducers: {
    incremented: state => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1;
    },
    decremented: state => {
      state.value -= 1;
    },
  },
});

export const {incremented, decremented} = counterSlice.actions;

const store = configureStore({
  reducer: counterSlice.reducer,
  enhancers: getDefaultEnhancers =>
    getDefaultEnhancers().concat(applyMiddleware(buildEmbraceMiddleware())),
});

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
        title={'get ids'}
        onPress={() => {
          getDeviceId().then(deviceId => {
            console.log('Embrace Device Id', deviceId);
          });

          getCurrentSessionId().then(sessionId => {
            console.log('Embrace Session Id', sessionId);
          });

          getLastRunEndState().then(resp => {
            console.log('LastRunEndState', resp);
          });
        }}
      />
      <Button
        title={'log testing'}
        onPress={async () => {
          logMessage('my warning message', 'warning');
          logMessage('my info message', 'info');
          logMessage('my error message', 'error');
        }}
      />
      <Button
        title={'span testing'}
        onPress={async () => {
          const span1 = await startSpan('span-w-events-attrs');

          // Adding an attribute to a specific span
          addSpanAttributeToSpan(span1, 'myKey', 'value');

          const attributes = {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3',
          };
          addSpanEventToSpan(
            span1,
            'eventName',
            new Date().getTime(),
            attributes,
          );

          stopSpan(span1);

          const span2 = await startSpan('span-w-error');
          const endTimeMs = new Date().getTime();
          stopSpan(span2, 'Failure', endTimeMs);

          const parentSpanId = await startSpan('parent-name');

          const firstChildSpanId = await startSpan(
            'firstchildname',
            parentSpanId,
          );

          const secondChildSpanId = await startSpan(
            'secondchildname',
            firstChildSpanId,
          );

          // Stopping Spans
          stopSpan(firstChildSpanId);
          stopSpan(secondChildSpanId);
          stopSpan(parentSpanId);

          const span3 = await startSpan(
            'span-w-starttime',
            undefined,
            new Date().getTime(),
          );
          stopSpan(span3);

          const trackMe = async () => {};
          await recordSpan(
            'span-using-record-span',
            trackMe,
            {
              key1: 'value1',
              key2: 'value2',
              key3: 'value3',
            },
            [
              {
                name: 'eventName',
                timeStampMs: new Date().getTime(),
                attributes: {eventKey: 'value'},
              },
            ],
          );

          const startTime = new Date().getTime();
          const endTime = new Date().getTime() + 1;

          await recordCompletedSpan(
            'span-using-record-completed-span',
            startTime,
            endTime,
            'None',
            undefined,
            {
              key1: 'value1',
              key2: 'value2',
              key3: 'value3',
            },
            [
              {
                name: 'eventName',
                timeStampMs: new Date().getTime(),
                attributes: {eventKey: 'value'},
              },
            ],
          );
        }}
      />

      <Button
        title="breadcrumb"
        onPress={() => {
          console.log('breadcrumb');
          addBreadcrumb(
            "component updated -- 'show' prop changed from true to false",
          );
        }}
      />

      <Button
        title="action"
        onPress={() => {
          console.log('action');
          store.dispatch(incremented());
        }}
      />

      <Button
        title="set user identifiers"
        onPress={() => {
          setUserIdentifier('my-user-id');
          addUserPersona('persona-1');
          addUserPersona('persona-to-clear');
          addSessionProperty('property1', 'valueforit', false);
          addSessionProperty('permanent-property', 'valueforit2', true);
          addSessionProperty('property-to-clear', 'valueforit3', false);
        }}
      />

      <Button
        title="clear some user identifiers"
        onPress={() => {
          clearUserIdentifier();
          clearUserPersona('persona-to-clear');
          removeSessionProperty('property-to-clear');
        }}
      />

      <Button
        title={'track components'}
        onPress={() => {
          startView('my-view');
          startView('my-view-never-ended');
          endView('my-view');
          logScreen('my-screen');
        }}
      />

      <Button
        title="js crash ota4"
        onPress={() => {
          console.log('trigger js crash');
          firstPartofJSCrashStack('ota update 4');
        }}
      />
    </View>
  );
}

function firstPartofJSCrashStack(msg: string) {
  secondPartofJSCrashStack(msg);
}

function secondPartofJSCrashStack(msg: string) {
  throw new Error('This is a crash: ' + msg);
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

function NavWithEmbrace({navigationRef}): React.JSX.Element {
  useEmbraceNavigationTracker(navigationRef);

  return (
    <Stack.Navigator initialRouteName="FirstScreen">
      <Stack.Screen name="FirstScreen" component={FirstScreen} />
      <Stack.Screen name="SecondScreen" component={SecondScreen} />
    </Stack.Navigator>
  );
}

function App(): React.JSX.Element {
  const [loading, setLoading] = useState(true);

  const navigationRef = useRef();
  useEmbraceOrientationLogger();

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
    <NavigationContainer ref={navigationRef}>
      <NavWithEmbrace navigationRef={navigationRef} />
    </NavigationContainer>
  );
}

export default codePush(App);
