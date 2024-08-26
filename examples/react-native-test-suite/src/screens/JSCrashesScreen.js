import React, {useState} from 'react';
import {View, FlatList} from 'react-native';

import ActionButton from '../components/ActionButton';

const JSCrashes = () => {
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
      name: 'JS Crash',
      onPress: () => {
        throw new Error('This is a JS crash');
      },
      backgroundColor: 'red',
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
    </View>
  );
};

export default JSCrashes;
