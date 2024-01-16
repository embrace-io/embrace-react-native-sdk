import { useEffect, useRef, useState } from 'react';
import { NativeModules } from 'react-native';
import {
  ICurrentScreenInstance,
  IHistory,
  INavigationRef,
  INavigationState,
} from '../navigation/interfaces/NavigationInterfaces';
import { findNavigationHistory } from '../navigation/Utils';

export const useEmbraceNavigationTracker = (
  navigationRef: INavigationRef,
  forceRefresh?: boolean
) => {
  const [isFirstScreen, setIsFirstScreen] = useState<boolean>(true);
  const currentScreen = useRef<ICurrentScreenInstance>();

  const findLastScreen = (currentRoute: INavigationState) => {
    const navigationHistory = findNavigationHistory(currentRoute);
    return navigationHistory.pop();
  };
  const setLastScreenStart = (name: string) => {
    const cS = {
      name,
      startTime: new Date().getTime(),
    };
    currentScreen.current = cS;
    if (NativeModules.EmbraceManager.startView) {
      NativeModules.EmbraceManager.startView(cS.name);
    } else {
      console.warn(
        '[Embrace] The method startView was not found, please update the native SDK'
      );
    }
  };
  const updateLastScreen = ({ name }: IHistory) => {
    if (!currentScreen.current?.name) {
      setLastScreenStart(name);
    } else if (currentScreen.current.name !== name) {
      const cSEnd = { ...currentScreen.current };
      cSEnd.endTime = new Date().getTime();
      if (NativeModules.EmbraceManager.endView) {
        NativeModules.EmbraceManager.endView(cSEnd.name);
        setLastScreenStart(name);
      } else {
        console.warn(
          '[Embrace] The method endView was not found, please update the native SDK'
        );
      }
    }
  };

  const findAndSetLastScreen = (currentRute: INavigationState) => {
    const lastScreen = findLastScreen(currentRute);
    if (lastScreen) {
      updateLastScreen(lastScreen);
    }
  };

  useEffect(() => {
    if (!NativeModules.EmbraceManager) {
      console.warn(
        '[Embrace] You must have the Embrace SDK to track screens, run `yarn add @embrace-io/core`.'
      );
      return;
    }
    if (!navigationRef) {
      console.warn(
        '[Embrace] Navigation reference was not provided. Navigation tracker was not applied.'
      );
      return;
    }
    if (!navigationRef.current) {
      console.warn(
        '[Embrace] Navigation reference current object is null. Navigation tracker was not applied.'
      );
      return;
    }

    const navigationRefC = navigationRef.current;

    if (isFirstScreen) {
      const currentRute = navigationRefC.getCurrentRoute();
      findAndSetLastScreen(currentRute);
      setIsFirstScreen(false);
    }

    console.log('[Embrace] Navigation tracker was applied.');
    const unsubscribe = navigationRefC.addListener('state', (e) => {
      findAndSetLastScreen(e.data.state);
    });
    return unsubscribe;
  }, [navigationRef, navigationRef?.current, forceRefresh]);
};
