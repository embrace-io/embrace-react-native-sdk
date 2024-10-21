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

  public setLastScreenStart = async (name: string) => {
    const cS = {
      name,
    };
    this.currentScreen = cS;
    if (NativeModules.EmbraceManager.startView) {
      this.currentScreen.spanId = await NativeModules.EmbraceManager.startView(
        cS.name,
      );
    } else {
      console.warn(
        "[Embrace] The method startView was not found, please update the native SDK",
      );
    }
  };

  public updateLastScreen = async (name: string) => {
    if (this.currentScreen && this.currentScreen.name !== name) {
      if (NativeModules.EmbraceManager.endView && this.currentScreen.spanId) {
        await NativeModules.EmbraceManager.endView(this.currentScreen.spanId);
        this.setLastScreenStart(name);
      } else {
        console.warn(
          "[Embrace] The method endView was not found, please update the native SDK",
        );
      }
    }
  };

  public initNavigator = (navigation: INavigation) => {
    navigation.events().registerComponentDidAppearListener(async event => {
      if (!this.currentScreen || !this.currentScreen.name) {
        await this.setLastScreenStart(event.componentName);
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
