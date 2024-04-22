import React, {useEffect, useState} from 'react';
import {View, Text, BackHandler, NativeModules} from 'react-native';
import {logBreadcrumb, logMessage} from '@embrace-io/react-native';

const ACTIONS = [
  {
    name: 'Send logBreadcrumb',
    hasBeenProcess: undefined,
    action: () => logBreadcrumb('Auto-Test logBreadcrumb'),
  },
  {
    name: 'Send logMessage - default',
    hasBeenProcess: undefined,
    action: () => logMessage('Auto-Test logMessage - default'),
  },
  {
    name: 'Send logMessage - info',
    hasBeenProcess: undefined,
    action: () => logMessage('Auto-Test logMessage - info', 'info'),
  },
  {
    name: 'Send logMessage - error',
    hasBeenProcess: undefined,
    action: () => logMessage('Auto-Test logMessage - error', 'error'),
  },
  {
    name: 'Send logMessage - warning',
    hasBeenProcess: undefined,
    action: () => logMessage('Auto-Test logMessage - warning', 'warning'),
  },
];

const Breadcrumbs = () => {
  const [currentActions, setCurrentActions] = useState(ACTIONS);
  // const currentActions = useRef(ACTIONS);

  const processActions = () => {
    const pendientJobIndex = currentActions.findIndex(
      action => !action.hasBeenProcess,
    );
    if (!pendientJobIndex === -1) return;
    const tmpJob = [...currentActions];

    const pendientJob = tmpJob[pendientJobIndex];
    if (pendientJob) {
      pendientJob.action();
      pendientJob.hasBeenProcess = true;
      setCurrentActions(tmpJob);
      setTimeout(() => {
        processActions();
      }, 1000);
    } else {
      console.log('NativeModules', NativeModules);
      // BackHandler.exitApp();
      // NativeModules.RCExitApp.exitApp();
    }
  };
  console.log('NativeModule wws', Object.getOwnPropertyNames(NativeModules));

  useEffect(() => {
    processActions();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        padding: 30,
        backgroundColor: 'white',
      }}>
      <Text style={{textAlign: 'center', fontSize: 25, fontWeight: '700'}}>
        Breadcrumbs and Logs
      </Text>
      <View
        style={{
          marginTop: 20,
        }}>
        {currentActions.map(r => {
          return (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontSize: 30, marginTop: -5}}>•</Text>
              <Text>{`${r.name} -> `}</Text>
              <Text style={{color: r.hasBeenProcess ? 'green' : 'red'}}>
                {r.hasBeenProcess === undefined
                  ? 'Pending'
                  : `${r.hasBeenProcess}`}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default Breadcrumbs;
