import {NativeModules} from "react-native";

import {
  ICurrentScreenInstance,
  INavigation,
} from "../navigation/interfaces/NavigationInterfaces";

export default class NavigationTracker {
  public currentScreen?: ICurrentScreenInstance = undefined;

  constructor(navigation: INavigation) {
    this.initNavigator(navigation);
  }

  public setLastScreenStart = (name: string) => {
    const cS = {
      name,
      startTime: new Date().getTime(),
    };
    this.currentScreen = cS;
    if (NativeModules.EmbraceManager.startView) {
      NativeModules.EmbraceManager.startView(cS.name);
    } else {
      console.warn(
        "[Embrace] The method startView was not found, please update the native SDK",
      );
    }
  };

  public updateLastScreen = (name: string) => {
    if (this.currentScreen && this.currentScreen.name !== name) {
      const cSEnd = {...this.currentScreen};
      cSEnd.endTime = new Date().getTime();
      if (NativeModules.EmbraceManager.endView) {
        NativeModules.EmbraceManager.endView(cSEnd.name);
        this.setLastScreenStart(name);
      } else {
        console.warn(
          "[Embrace] The method endView was not found, please update the native SDK",
        );
      }
    }
  };
  public initNavigator = (navigation: INavigation) => {
    navigation.events().registerComponentDidAppearListener(event => {
      if (!this.currentScreen || !this.currentScreen.name) {
        this.setLastScreenStart(event.componentName);
      }
      if (
        this.currentScreen &&
        this.currentScreen.name !== event.componentName
      ) {
        this.updateLastScreen(event.componentName);
      }
    });
  };
}
