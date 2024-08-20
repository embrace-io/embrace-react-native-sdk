/**
 * This interface is to define Navigation instance
 */
export interface INavigation {
  events: () => IEvents;
}

/**
 * This interface is to define Event instance
 */
export interface IEvent {
  componentName: string;
}

/**
 * This interface is to define React Navigations Events methods that we are going to use
 * to track the screen
 */
export interface IEvents {
  registerComponentDidAppearListener: (
    callback: (event: IEvent) => void,
  ) => void;
}

/**
 * This interface is to define Screen instance to track
 */
export interface ICurrentScreenInstance {
  name: string;
  spanId?: string;
}
