import { NativeModules } from 'react-native';
import { INavigation } from '../navigation/interfaces/NavigationInterfaces';
import NavigationTracker from './NavigationTracker';

/**
 * This interface is to define Navigation instances name
 */
export interface INavigationInstances {
  [instanceName: string]: NavigationTracker;
}

export default class EmbraceNavigationTracker {
  public static build = (
    navigation: INavigation,
    instanceName: string = 'embrace-init'
  ): number => {
    if (!NativeModules.EmbraceManager) {
      console.warn(
        '[Embrace] You must have the Embrace SDK to track screens, run `yarn add embrace-react-native`.'
      );
      return 0;
    }
    if (!navigation) {
      console.warn(
        '[Embrace] Navigation reference was not provided. Navigation tracker was not applied.'
      );
      return 0;
    }
    if (!EmbraceNavigationTracker.instances[instanceName]) {
      EmbraceNavigationTracker.instances[instanceName] = new NavigationTracker(
        navigation
      );
    }

    return 1;
  }
  private static instances: INavigationInstances = {};
}
