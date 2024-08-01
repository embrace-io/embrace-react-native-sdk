import {
  ICurrentScreenInstance,
  INavigation,
} from "../navigation/interfaces/NavigationInterfaces";

import {startView, endView} from "@embrace-io/react-native";

export default class NavigationTracker {
  public currentScreen?: ICurrentScreenInstance = undefined;
  private lastId?: string = undefined;

  constructor(navigation: INavigation) {
    this.initNavigator(navigation);
  }

  public setLastScreenStart = async (name: string) => {
    const cS = {
      name,
      startTime: new Date().getTime(),
    };
    this.currentScreen = cS;
    if (startView) {
      this.lastId = await startView(cS.name);
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
      if (endView && this.lastId) {
        endView(this.lastId);
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
