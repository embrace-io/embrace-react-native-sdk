import React, {useRef} from 'react';
import {View, FlatList, Alert} from 'react-native';
import {
  addBreadcrumb,
  logMessage,
  getLastRunEndState,
  getCurrentSessionId,
  setUserAsPayer,
  clearUserAsPayer,
  endSession,
} from '@embrace-io/react-native';
import {
  startSpan,
  stopSpan,
  addSpanAttributeToSpan,
  recordSpan,
  recordCompletedSpan,
  addSpanEventToSpan,
} from '@embrace-io/react-native-spans';
import {getPokemonWithAxios, getPokemonWithFetch} from '../api/apis';
import ActionButton from '../components/ActionButton';
import ErrorBoundary from './ErrorBoundary';
import Counter from '../features/counter/counter';

const HomeScreen = () => {
  const spanId1 = useRef();
  const spanId2 = useRef();
  const spanId3 = useRef();

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
      name: 'Log Message',
      onPress: () => {
        logMessage('Custom Message From Embrace Test Suite');
      },
      backgroundColor: '#fd6',
    },
    {
      name: 'Add Breadcrumb',
      onPress: () => {
        addBreadcrumb('Custom Breadcrumb From Embrace Test Suite').then(rr =>
          console.log('RR', rr),
        );
      },
      backgroundColor: '#26b3bd',
    },
    {
      name: 'Add Payer',
      onPress: () => {
        setUserAsPayer().then(rr => console.log('RR', rr));
      },
      backgroundColor: '#26b3bd',
    },
    {
      name: 'Clear Payer',
      onPress: () => {
        clearUserAsPayer().then(rr => console.log('RR', rr));
      },
      backgroundColor: '#26b3bd',
    },
    {
      name: 'Log API Call With Fetch',
      onPress: () => {
        getPokemonWithFetch();
      },
      backgroundColor: '#26b3bd',
    },
    {
      name: 'Log API Call With Axios',
      onPress: () => {
        getPokemonWithAxios();
      },
      backgroundColor: '#26b3bd',
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
    {
      name: 'End Session (And start a new one)',
      onPress: () => {
        endSession().then(r => console.log('The session has been ended', r));
      },
      backgroundColor: '#26b3bd',
    },
    {
      name: 'Start Span With Name - 1',
      onPress: () => {
        const date = new Date();

        startSpan(`Span Name`, undefined, date.getTime()).then(id => {
          spanId1.current = id;
        });
      },
      backgroundColor: 'lightblue',
    },
    {
      name: 'Start Span With Name - 2',
      onPress: () => {
        const date = new Date();
        startSpan(`Span Name 2`, spanId1.current, date.getTime()).then(id => {
          spanId2.current = id;
        });
      },
      backgroundColor: 'lightblue',
    },
    {
      name: 'Start Span With Name - 3',
      onPress: () => {
        const date = new Date();
        startSpan(`Span Name 3`, spanId2.current, date.getTime()).then(id => {
          spanId3.current = id;
        });
      },
      backgroundColor: 'lightblue',
    },
    {
      name: 'Stop Span With Name - 1',
      onPress: () => {
        const date = new Date();
        stopSpan(spanId1.current, 'None', date.getTime());
      },
      backgroundColor: 'lightblue',
    },
    {
      name: 'Stop Span With Name - 2',
      onPress: () => {
        const date = new Date();
        stopSpan(spanId2.current, 'None', date.getTime());
      },
      backgroundColor: 'lightblue',
    },
    {
      name: 'Stop Span With Name - 3',
      onPress: () => {
        const date = new Date();
        stopSpan(spanId3.current, 'None', date.getTime());
      },
      backgroundColor: 'lightblue',
    },
    {
      name: 'Add Event Span to Span - 1',
      onPress: () => {
        const name = `Event Name`;
        const time = new Date().getTime();
        const at = {eventKey: 'Eventvalue'};
        addSpanEventToSpan(spanId1.current, name, time, at)
          .catch(e => console.log('addSpanEventToSpanId Catch', e))
          .then(r => console.log('addSpanEventToSpanId Then', r));
      },
      backgroundColor: 'lightblue',
    },
    {
      name: 'Add Attribute to Span - 1',
      onPress: () => {
        const key = 'attributeKey';
        const value = 'attributeValue';
        addSpanAttributeToSpan(spanId1.current, key, value)
          .catch(e => console.log('addSpanAttributesToSpanId Catch', e))
          .then(r => console.log('addSpanAttributesToSpanId Then', r));
      },
      backgroundColor: 'lightblue',
    },
    {
      name: 'Record Event Span Arround a function',
      onPress: () => {
        const name = `Record Event Span Name ${spanVersion}`;
        const at = {attributeKey1: 'attributeValue1'};
        const at2 = {attributeKey2: 'attributeValue2'};
        const events = [
          {
            name: 'Event 2',
            timeStampMs: new Date().getTime(),
            attributes: at2,
          },
        ];

        const myCallback = () => {
          console.log('Something expensive.');
        };

        recordSpan(name, myCallback, at, events, spanId1.current)
          .catch(r => {
            console.log('recordSpan Crash', r.message);
          })
          .then(r => {
            console.log(`recordSpan Then ${r}`);
          });
      },
      backgroundColor: 'lightblue',
    },
    {
      name: 'Record Completed Span',
      onPress: () => {
        const name = `recordCompletedSpan WITH NAME ${spanVersion}`;
        const st = new Date().getTime();
        const et = new Date().getTime();
        const errorCode = 'None';
        const at = {someKey: 'someValue'};
        const events = [
          {
            name: 'Event f',
            timestampNanos: new Date().getTime(),
            attributes: {someEventKey: 'someEventvalue'},
          },
        ];

        recordCompletedSpan(
          name,
          st,
          et,
          errorCode,
          spanId1.current,
          at,
          events,
        )
          .catch(e => console.log('recordCompletedSpan Crash', e))
          .then(r => console.log('recordCompletedSpan Then', r));
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
        <Counter />
        <FlatList data={actions} renderItem={renderAction} numColumns={2} />
      </View>
    </>
  );
};

const Wrapper = props => {
  return (
    <ErrorBoundary>
      <HomeScreen {...props} />
    </ErrorBoundary>
  );
};
export default Wrapper;
