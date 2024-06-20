import React, {useEffect, useRef, useState} from 'react';
import {View, FlatList, Alert, Button, UIManager} from 'react-native';
import {
  endMoment,
  addBreadcrumb,
  logMessage,
  startMoment,
  getLastRunEndState,
  getCurrentSessionId,
  startView,
} from '@embrace-io/react-native';
import {
  startSpan,
  stopSpan,
  addSpanAttributeToSpan,
  recordSpan,
  recordCompletedSpan,
  addSpanEventToSpan,
} from '@embrace-io/react-native-spans';
import {Events} from '@embrace-io/react-native-spans/interfaces/ISpans';
import {getPokemonWithAxios, getPokemonWithFetch} from '../api/apis';
import ActionButton from '../components/ActionButton';
import WebViewScreen from './WebViewScreen';
// import ErrorBoundary from '@embrace-io/error-handler';
// import ErrorBoundary from '../components/ErrorBoundary';
// import ErrorHandler from '@embrace-io/react-native/lib/src/error-handler/ErrorHandler';

const HomeScreen = () => {
  const spanId = useRef();
  const spanId2 = useRef();
  const spanId3 = useRef();
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
  const spanVersion = '192';
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

    {
      name: 'Start Span With Name',
      onPress: () => {
        startSpan(`ESARR ${spanVersion}`).then(id => {
          console.log('SPAN ID', id);
          spanId.current = id;
        });
      },
      backgroundColor: 'lightblue',
    },
    {
      name: 'Start Span With Name 2',
      onPress: () => {
        startSpan(`ESARR ${spanVersion}`, spanId.current).then(id => {
          console.log('SPAN ID', id);
          spanId2.current = id;
        });
      },
      backgroundColor: 'lightblue',
    },

    {
      name: 'Start Span With Name 2',
      onPress: () => {
        startSpan(`ESARR ${spanVersion}`, spanId2.current).then(id => {
          console.log('SPAN ID', id);
          spanId3.current = id;
        });
      },
      backgroundColor: 'lightblue',
    },
    {
      name: 'STOP Span With Name',
      onPress: () => {
        stopSpan(spanId.current);
      },
      backgroundColor: 'lightblue',
    },

    {
      name: 'STOP Span With Name',
      onPress: () => {
        stopSpan(spanId2.current);
      },
      backgroundColor: 'lightblue',
    },

    {
      name: 'STOP Span With Name',
      onPress: () => {
        stopSpan(spanId3.current);
      },
      backgroundColor: 'lightblue',
    },
    {
      name: 'Add Event Span With Name',
      onPress: () => {
        const name = `EVENTO UNO DO ${spanVersion}`;
        const time = new Date().getTime();
        const at = {hola: 'chau'};
        addSpanEventToSpan(spanId.current, name, time, at)
          .catch(e => console.log('addSpanEventToSpanId CATCH', e))
          .then(r => console.log('addSpanEventToSpanId THEN', r));
      },
      backgroundColor: 'lightblue',
    },
    {
      name: 'Add Event Span',
      onPress: () => {
        const key = 'ww';
        const value = 'rr';
        console.log('addSpanAttributeToSpan', spanId.current, key, value);
        addSpanAttributeToSpan(spanId.current, key, value)
          .catch(e => console.log('addSpanAttributesToSpanId CATCH', e))
          .then(r => console.log('addSpanAttributesToSpanId THEN', r));
      },
      backgroundColor: 'lightblue',
    },
    {
      name: 'Record Event Span',
      onPress: () => {
        const name = `RECORDDDD ${spanVersion}`;
        const at = {RRR: 'GGGG'};
        const at2 = {PPP: 'QR'};
        const events = [
          {
            name: 'Event 2',
            timeStampMs: new Date().getTime(),
            attributes: at2,
          },
        ];
        // const myCallback = new Promise(r => {
        //   setTimeout(() => {
        //     throw new Error('NO SE QUE PASOOUOUOUOUOU');
        //     r('hey');
        //     console.log('RRRyyyyy');
        //   }, 5000);
        // });

        const myCallback = () => {
          console.log('ads');
          // throw new Error('NO SE QUE PASOOUOUOUOUOU');
        };

        console.log(
          'RECORD LA   eqasdadsdasasweqw  q ads ads aewqe     Assd sAA',

          recordSpan(name, myCallback, at, events, spanId.current)
            .catch(r => {
              console.log(
                'MYedassaddsadsaads  asdadsdsaweqw  CRASHESITO',
                r.message,
              );
            })
            .then(r => {
              console.log(
                `NAasqe qwew asd d  adsqewd    aqeweqw  asdDA ${r} r`,
              );

              console.log('LLEGa a adssdsdaO ACA Cuando', r);
            }),
        );
        console.log('WEeea qwessd asdsde');
      },
      backgroundColor: 'lightblue',
    },
    {
      name: 'recordCompletedSpan Event Span',
      onPress: () => {
        const name = `COMPLE asdTED WITH NAME ${spanVersion}`;
        const st = new Date().getTime();
        const et = new Date().getTime();
        const errorCode = 'None';
        const at = {we: 'we'};
        const at2 = {PPPKKK: 'QkkkkKKR'};
        const events = [
          {
            name: 'Event f',
            timestampNanos: new Date().getTime(),
            attributes: {qwe: 'rw'},
          },
        ];
        // name,
        //   startTimeNanos,
        //   endTimeNanos,
        //   (errorCode = 'None'),
        //   parentSpanId,
        //   attributes,
        //   events;
        recordCompletedSpan(name, st, et, errorCode, spanId.current, at, events)
          .catch(e => console.log('crash', e))
          .then(r => console.log('THEN', r));
      },
      backgroundColor: 'lightblue',
    },
  ];

  console.log('R    asd qjjjr qwr aeqw  h rrqwwqqrwqwrq qe eqwwwrqw  eeg RR');

  useEffect(() => {
    // setTimeout(() => {
    //   Alert.alert('TIME RAM', performance.memory.usedJSHeapSize);
    // }, 5000);
    // asd();
  }, []);

  const asd = () => {
    setTimeout(() => {
      throw Error('SUSSAN Erroreee');
    }, 5000);
  };

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
          {asdf}
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
// const WrappedError = props => {
//   const Fallback = ({error, componentStack, resetErrorState}) => {
//     console.log('error', error);
//     console.log('componentStack', componentStack);
//     console.log('resetErrorState', resetErrorState);
//     return <Button title="Reset" onPress={resetErrorState} />;
//   };
//   return (
//     <ErrorBoundary
//       FallbackComponent={Fallback}
//       onErrorHandler={(r, t) => {
//         console.log('onErrorHandlerw', r.message, t);
//       }}>
//       <HomeScreen {...props} />
//     </ErrorBoundary>
//   );
// };

export default HomeScreen;
