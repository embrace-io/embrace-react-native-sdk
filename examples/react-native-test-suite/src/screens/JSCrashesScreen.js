import React, {useState} from 'react';
import {View, FlatList} from 'react-native';

import ActionButton from '../components/ActionButton';

const JSCrashes = () => {
  const [showKaboom, setShowKaboom] = useState(false);
  const [fixJSXError, setFixJSXError] = useState(false);
  const [fixJSXErrorAgain, setFixJSXErrorAgain] = useState(false);

  const CustomErrorComponent = ({cleanErrorHanlder}) => {
    const handleOnClean = () => {
      cleanErrorHanlder();
      setFixJSXError(true);
    };
    const handleOnCleanAgain = () => {
      cleanErrorHanlder();
      setFixJSXErrorAgain(true);
    };

    return (
      <View style={{alignItems: 'center'}}>
        {fixJSXError ? (
          <Text
            style={{
              backgroundColor: 'red',
              padding: 10,
              color: 'white',
              textAlign: 'center',
            }}>
            Was fixed but still have some error, try fix it again!
          </Text>
        ) : (
          <Text
            style={{
              backgroundColor: 'red',
              padding: 10,
              color: 'white',
              textAlign: 'center',
            }}>
            Oops!
          </Text>
        )}
        {fixJSXError ? (
          <Button title="Fix Error" onPress={handleOnCleanAgain} />
        ) : (
          <Button title="Fix Error" onPress={handleOnClean} />
        )}
      </View>
    );
  };

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
    }, // {
    //   name: 'Force JSX Error',
    //   onPress: () => {
    //     setShowKaboom(true);
    //   },
    //   backgroundColor: '#26b3bd',
    // },
  ];
  return (
    <View
      style={{
        flex: 1,
        marginTop: 10,
        paddingBottom: 50,
      }}>
      <FlatList data={actions} renderItem={renderAction} numColumns={2} />
      {/* <ErrorHandler unmountChildrenOnError>
        {showKaboom && <View>asd</View>}
      </ErrorHandler>
      <ErrorHandler ErrorFallbackComponent={CustomErrorComponent}>
        {showKaboom && !fixJSXErrorAgain && <View>asd</View>}
        {fixJSXErrorAgain && (
          <View>
            <Text
              style={{
                padding: 10,
                backgroundColor: 'green',
                color: 'white',
                textAlign: 'center',
              }}>
              Now its fixed
            </Text>
          </View>
        )}
      </ErrorHandler> */}
    </View>
  );
};

export default JSCrashes;
