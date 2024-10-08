import React, {useEffect} from 'react';
import {SafeAreaView, Text, TouchableOpacity} from 'react-native';

import {initialize} from '@embrace-io/react-native';
// To test with Codepush
// import codePush from 'react-native-code-push';

import MainNavigation from './src/navigation/MainNavigation';

const App = () => {
  useEffect(() => {
    initialize();
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <TouchableOpacity
        style={{
          backgroundColor: 'rgba(44, 62, 80, 1)',
          height: 100,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => {
          setTimeout(() => {}, 3000);
        }}>
        <Text
          style={{
            color: 'white',
            fontSize: 30,
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
          Embrace Testing Suite
        </Text>
      </TouchableOpacity>
      <MainNavigation />
    </SafeAreaView>
  );
};

// To test with Codepush
// let codePushOptions = {checkFrequency: codePush.CheckFrequency.ON_APP_RESUME};

// App = codePush(codePushOptions)(App);
export default App;
