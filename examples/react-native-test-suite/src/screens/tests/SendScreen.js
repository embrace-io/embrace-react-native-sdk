import React, {useEffect} from 'react';
import {View, Text, BackHandler} from 'react-native';

const SendScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        padding: 30,
        backgroundColor: 'white',
      }}>
      <Text style={{textAlign: 'center', fontSize: 25, fontWeight: '700'}}>
        Use me to send a session after a crash
      </Text>
    </View>
  );
};

export default SendScreen;
