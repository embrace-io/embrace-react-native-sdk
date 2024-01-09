import React from 'react';
import {TouchableOpacity, View, Text} from 'react-native';

const ActionButton = ({actionName, onPress, backgroundColor = 'white', id}) => {
  return (
    <TouchableOpacity
      testID={id}
      accessibilityLabel={id}
      style={{
        backgroundColor,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 7,
        },
        shadowOpacity: 0.4,
        shadowRadius: 9,
        elevation: 14,
        margin: 10,
        borderRadius: 10,
      }}
      onPress={onPress}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: backgroundColor === 'white' ? 'black' : 'white',
          textAlign: 'center',
        }}>
        {actionName}
      </Text>
    </TouchableOpacity>
  );
};

export default ActionButton;
