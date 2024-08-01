import {IEvent} from "../navigation/interfaces/NavigationInterfaces";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});
describe("Test React Native Navigation Tracker", () => {
  test("Navigation was not Provided", () => {
    const mockStartView = jest.fn();
    const mockEndView = jest.fn();

    jest.mock(
      "@embrace-io/react-native",
      () => ({
        startView: (viewName: string) => {
          mockStartView();
          return `id-${viewName}`;
        },
        endView: (id: string) => {
          mockEndView();
          return true;
        },
      }),
      {virtual: true},
    );
    const EmbraceNavigationTracker = require("../src/index");
    expect(EmbraceNavigationTracker.default.build()).toBe(0);
    expect(mockStartView).toHaveBeenCalledTimes(0);
    expect(mockEndView).toHaveBeenCalledTimes(0);
  });
  test("Embrace Base StartView does not exist", () => {
    jest.mock("@embrace-io/react-native", () => ({}), {virtual: true});

    const event = {
      componentName: "HelloScreen",
    };
    const navigation = {
      events: () => {
        return {
          registerComponentDidAppearListener: (
            callable: (event: IEvent) => void,
          ) => {
            callable(event);
          },
        };
      },
    };
    const EmbraceNavigationTracker = require("../src/index");
    expect(EmbraceNavigationTracker.default.build(navigation)).toBe(1);
  });
  test("Embrace Base SDK was not installed", () => {
    const EmbraceNavigationTracker = require("../src/index");
    expect(EmbraceNavigationTracker.default.build()).toBe(0);
  });
  test("Navigation was Provided", () => {
    const mockStartView = jest.fn();
    const mockEndView = jest.fn();

    jest.mock(
      "@embrace-io/react-native",
      () => ({
        startView: (viewName: string) => {
          mockStartView();
          return `id-${viewName}`;
        },
        endView: (id: string) => {
          mockEndView();
          return true;
        },
      }),
      {virtual: true},
    );
    const EmbraceNavigationTracker = require("../src/index");
    const event = {
      componentName: "HelloScreen",
    };
    const navigation = {
      events: () => {
        return {
          registerComponentDidAppearListener: (
            callable: (event: IEvent) => void,
          ) => {
            callable(event);
          },
        };
      },
    };

    expect(EmbraceNavigationTracker.default.build(navigation)).toBe(1);
    expect(mockStartView).toHaveBeenCalledTimes(1);
    expect(mockEndView).toHaveBeenCalledTimes(0);
  });
  test("Navigation was Provided twice", () => {
    const mockStartView = jest.fn();
    const mockEndView = jest.fn();

    jest.mock(
      "@embrace-io/react-native",
      () => ({
        startView: (viewName: string) => {
          mockStartView();
          return `id-${viewName}`;
        },
        endView: (id: string) => {
          mockEndView();
          return true;
        },
      }),
      {virtual: true},
    );
    const EmbraceNavigationTracker = require("../src/index");
    const event = {
      componentName: "HelloScreen",
    };
    const navigation = {
      events: () => {
        return {
          registerComponentDidAppearListener: (
            callable: (event: IEvent) => void,
          ) => {
            callable(event);
          },
        };
      },
    };

    expect(EmbraceNavigationTracker.default.build(navigation)).toBe(1);
    expect(EmbraceNavigationTracker.default.build(navigation)).toBe(1);

    expect(mockStartView).toHaveBeenCalledTimes(1);
    expect(mockEndView).toHaveBeenCalledTimes(0);
  });
  test("Navigation navigate to other screen", () => {
    const mockStartView = jest.fn();
    const mockEndView = jest.fn();

    jest.mock(
      "@embrace-io/react-native",
      () => ({
        startView: (viewName: string) => {
          mockStartView();
          return `id-${viewName}`;
        },
        endView: (id: string) => {
          mockEndView();
          return true;
        },
      }),
      {virtual: true},
    );
    const EmbraceNavigationTracker = require("../src/index");
    const event = {
      componentName: "HelloScreen",
    };
    const event2 = {
      componentName: "HelloScreen2",
    };
    const navigation = {
      events: () => {
        return {
          registerComponentDidAppearListener: (
            callable: (event: IEvent) => void,
          ) => {
            callable(event);
            callable(event2);
          },
        };
      },
    };

    expect(EmbraceNavigationTracker.default.build(navigation)).toBe(1);
    expect(mockStartView).toHaveBeenCalledTimes(1);
    expect(mockEndView).toHaveBeenCalledTimes(0);
  });
  test("Navigation navigate to other screen log end view", () => {
    const mockStartView = jest.fn();
    const mockEndView = jest.fn();

    jest.mock(
      "@embrace-io/react-native",
      () => ({
        startView: (viewName: string) => {
          mockStartView();
          return `id-${viewName}`;
        },
        endView: (id: string) => {
          mockEndView();
          return true;
        },
      }),
      {virtual: true},
    );
    const EmbraceNavigationTracker = require("../src/index");
    const event = {
      componentName: "HelloScreen",
    };
    const event2 = {
      componentName: "HelloScreen2",
    };
    const navigation = {
      events: () => {
        return {
          registerComponentDidAppearListener: (
            callable: (event: IEvent) => void,
          ) => {
            callable(event);
            callable(event2);
          },
        };
      },
    };

    expect(EmbraceNavigationTracker.default.build(navigation)).toBe(1);
    expect(mockStartView).toHaveBeenCalledTimes(2);
    expect(mockEndView).toHaveBeenCalledTimes(1);
  });
  test("Navigation navigate to the same screen", () => {
    const mockStartView = jest.fn();
    const mockEndView = jest.fn();

    jest.mock(
      "@embrace-io/react-native",
      () => ({
        startView: (viewName: string) => {
          mockStartView();
          return `id-${viewName}`;
        },
        endView: (id: string) => {
          mockEndView();
          return true;
        },
      }),
      {virtual: true},
    );
    const EmbraceNavigationTracker = require("../src/index");
    const event = {
      componentName: "HelloScreen",
    };
    const event2 = {
      componentName: "HelloScreen",
    };
    const navigation = {
      events: () => {
        return {
          registerComponentDidAppearListener: (
            callable: (event: IEvent) => void,
          ) => {
            callable(event);
            callable(event2);
          },
        };
      },
    };

    expect(EmbraceNavigationTracker.default.build(navigation)).toBe(1);
    expect(mockStartView).toHaveBeenCalledTimes(1);

    EmbraceNavigationTracker.default.instances["embrace-init"].currentScreen =
      undefined;

    EmbraceNavigationTracker.default.instances["embrace-init"].updateLastScreen(
      event.componentName,
    );
  });
});
