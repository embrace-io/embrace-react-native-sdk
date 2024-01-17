import React, {useState} from 'react';
import {View, FlatList, Alert} from 'react-native';
import {
  endMoment,
  addBreadcrumb,
  logMessage,
  startMoment,
  getLastRunEndState,
  getCurrentSessionId,
} from '@embrace-io/react-native';
import {getPokemonWithAxios, getPokemonWithFetch} from '../api/apis';
import ActionButton from '../components/ActionButton';
import WebViewScreen from './WebViewScreen';
import {useEmbraceOrientationLogger} from '@embrace-io/orientation-change-tracker';

const HomeScreen = () => {
  useEmbraceOrientationLogger();

  const [hasMomentStarted, setHasMomentStarted] = useState(false);

  const [showWebView, setShowWebView] = useState(false);

  const handleOnStartMoment = () => {
    startMoment('MomentFromEmbraceTestSuite-4');
    setHasMomentStarted(true);
  };
  const handleOnEndMoment = () => {
    endMoment('MomentFromEmbraceTestSuite-4');
    setHasMomentStarted(false);
  };

  const renderAction = ({item}) => {
    return (
      <ActionButton
        id={item.id}
        onPress={item.onPress}
        actionName={item.name}
        backgroundColor={item.backgroundColor}
      />
    );
  };

  const actions = [
    {
      name: 'Start Moment',
      onPress: handleOnStartMoment,
      backgroundColor: '#6bf',
    },

    {
      name: 'Log Message',
      onPress: () => {
        logMessage('Custom Message From Embrace Test Suite');
      },
      backgroundColor: '#fd6',
    },
    {
      name: 'Add Breadcrumb',
      onPress: () => {
        addBreadcrumb('Custom Breadcrumb From Embrace Test Suite');
      },
      backgroundColor: '#26b3bd',
    },
    {
      name: 'Log API Call Fetch',
      onPress: () => {
        getPokemonWithFetch();
      },
      backgroundColor: '#26b3bd',
    },
    {
      name: 'Log API Call Fetch',
      onPress: () => {
        getPokemonWithAxios();
      },
      backgroundColor: '#26b3bd',
    },
    {
      name: 'Show WebView',
      onPress: () => {
        setShowWebView(true);
      },
      backgroundColor: 'green',
    },
    {
      name: 'Show LastRunEndState',
      onPress: () => {
        getLastRunEndState().then(resp => {
          Alert.alert('LastRunEndState', resp);
        });
      },
      backgroundColor: 'lightblue',
    },

    {
      name: 'Show Current Session ID',
      onPress: () => {
        getCurrentSessionId().then(resp => {
          Alert.alert('Current Session ID', resp);
        });
      },
      backgroundColor: 'lightblue',
    },
  ];

  return (
    <>
      <View
        style={{
          flex: 1,
          marginTop: 10,
          paddingBottom: 50,
        }}>
        <FlatList data={actions} renderItem={renderAction} numColumns={2} />
      </View>
      <WebViewScreen visible={showWebView} closePopup={setShowWebView} />
      {hasMomentStarted && (
        <View style={{position: 'absolute', bottom: 10, width: '100%'}}>
          <ActionButton
            backgroundColor="green"
            actionName="End Moment"
            onPress={handleOnEndMoment}
          />
        </View>
      )}
    </>
  );
};

export default HomeScreen;
