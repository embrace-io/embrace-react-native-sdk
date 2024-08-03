import {IEvent} from "../navigation/interfaces/NavigationInterfaces";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});
describe("Test React Native Navigation Tracker", () => {
  test("Navigation was not Provided", () => {
    const mockStartView = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            startView: mockStartView,
          },
        },
      }),
      {virtual: true},
    );
    const EmbraceNavigationTracker = require("../src/index");
    expect(EmbraceNavigationTracker.default.build()).toBe(0);
  });
  test("Embrace Base StartView does not exist", () => {
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {},
        },
      }),
      {virtual: true},
    );

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
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {},
      }),
      {virtual: true},
    );

    const EmbraceNavigationTracker = require("../src/index");
    expect(EmbraceNavigationTracker.default.build()).toBe(0);
  });
  test("Navigation was Provided", () => {
    const mockStartView = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            startView: mockStartView,
          },
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
  });
  test("Navigation was Provided twice", () => {
    const mockStartView = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            startView: mockStartView,
          },
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
  });
  test("Navigation navigate to other screen", () => {
    const mockStartView = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            startView: mockStartView,
          },
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
  });
  test("Navigation navigate to other screen log end view", () => {
    const mockStartView = jest.fn();
    const mockEndView = jest.fn();

    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            endView: (spanId: string) => {
              mockEndView();
              return true;
            },
            startView: (spanName: string) => {
              mockStartView();
              return `id-${spanName}`;
            },
          },
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
          registerComponentDidAppearListener: async (
            callable: (event: IEvent) => Promise<void>,
          ) => {
            callable(event);
            jest.runAllTicks();
            callable(event2);
          },
        };
      },
    };

    expect(EmbraceNavigationTracker.default.build(navigation)).toBe(1);
    expect(mockStartView).toHaveBeenCalledTimes(1);
    expect(mockEndView).toHaveBeenCalledTimes(1);
  });
  test("Navigation navigate to the same screen", () => {
    const mockStartView = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            startView: mockStartView,
          },
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
