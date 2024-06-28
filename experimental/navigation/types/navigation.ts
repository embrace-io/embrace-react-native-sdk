interface INavigationContainer {
  addListener: (
    event: "state",
    callback: (args: {name: string}) => void,
  ) => void;
  getCurrentRoute: () => {name: string};
}

interface INativeNavigationContainer {
  registerComponentDidAppearListener: (
    cb: (args: {componentName: string}) => void,
  ) => void;
  registerComponentDidDisappearListener: (
    cb: (args: {componentName: string}) => void,
  ) => void;
}

export {type INavigationContainer, type INativeNavigationContainer};
