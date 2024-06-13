type NavigationType = "stack" | "tab";

/**
 * This interface is to define Navigation Ref instance
 */
export interface INavigationRef {
  current: INavigationInstance;
}

/**
 * This interface is to define Screen history instance received from Navigation state
 */
export interface IHistory {
  name: string;
}

/**
 * This interface is to define Navigation Generic State instance
 */
export interface INavigationStateBase {
  name: string;
  index: number;
  routes: [];
  type: NavigationType;
}

/**
 * This interface is to define Navigation State instance
 */
export interface INavigationState extends INavigationStateBase {
  state: INavigationState;
}

interface INavigationData {
  state: INavigationState;
}

export interface INavigationListenerCurrentObject {
  data: INavigationData;
}

interface INavigationInstance {
  getCurrentRoute: () => INavigationState;
  addListener: (
    s: string,
    f: (e: INavigationListenerCurrentObject) => void,
  ) => () => void;
}

/**
 * This interface is to define Screen instance to track
 */
export interface ICurrentScreenInstance {
  name: string;
  startTime: number;
  endTime?: number;
}
