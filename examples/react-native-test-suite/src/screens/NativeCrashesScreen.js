import {useNavigation} from '@react-navigation/core';
import React from 'react';
import {View, NativeModules, FlatList, Platform} from 'react-native';

import ActionButton from '../components/ActionButton';

const {CrashTestModule} = NativeModules;

const isIOS = Platform.OS === 'ios';

const NativeCrashes = () => {
  console.log('CrashTestModule', CrashTestModule);
  const navigation = useNavigation();
  const renderAction = ({item}) => {
    return (
      <ActionButton
        onPress={item.onPress}
        actionName={item.name}
        backgroundColor={item.backgroundColor}
      />
    );
  };

  const actions = [
    {
      name: 'C++ Crash',
      onPress: () => {
        console.log('CrashTestModule', CrashTestModule.generateCPPCrash);
        CrashTestModule.generateCPPCrash();
      },
      backgroundColor: 'red',
    },
    {
      name: 'Native Crash',
      onPress: () => CrashTestModule.generateNativeCrash(),
      backgroundColor: '#7f0000',
    },
    isIOS && {
      name: `NS`,
      onPress: () => CrashTestModule.generatePlatformCrash(),
      backgroundColor: '#7f0000',
    },
  ];
  return (
    <View
      style={{
        flex: 1,
        marginTop: 10,
        paddingBottom: 50,
      }}>
      <FlatList data={actions} renderItem={renderAction} numColumns={2} />
      <View style={{height: 100, flex: 0.2}}>
        <ActionButton
          onPress={() => navigation.navigate('JsCrashes')}
          actionName={'JS Crashes'}
          backgroundColor={'rgba(44, 62, 80, 1)'}
        />
      </View>
    </View>
  );
};

export default NativeCrashes;
