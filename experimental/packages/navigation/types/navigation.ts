interface TNavigationContainer {
  addListener: (
    event: 'state',
    callback: (args: {name: string}) => void,
  ) => void;
  getCurrentRoute: () => {name: string};
}

interface TNativeNavigationContainer {
  registerComponentDidAppearListener: (
    cb: (args: {componentName: string}) => void,
  ) => void;
  registerComponentDidDisappearListener: (
    cb: (args: {componentName: string}) => void,
  ) => void;
  registerCommandListener: (cb: () => void) => void;
}

export {type TNavigationContainer, type TNativeNavigationContainer};
