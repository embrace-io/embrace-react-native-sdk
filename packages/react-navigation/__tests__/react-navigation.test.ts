jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});
describe("Test Navigation Tracker", () => {
  jest.mock("react", () => ({
    useEffect: (w: () => void) => {
      w();
    },
    useState: () => [false, () => {}],
    useRef: () => {
      return {current: {}};
    },
  }));
  const mockedHistory = {
    history: [
      {key: "Home-Yii-q1BuKBL4I5_ayc5sg", type: "route"},
      {key: "OtherHome-7_-sY-E4SGWfQ44yOvqlu", type: "route"},
    ],
    index: 1,
    key: "tab-lutziKhzsg1veujnx1aHq",
    routeNames: ["Home", "OtherHome"],
    routes: [
      {key: "Home-Yii-q1BuKBL4I5_ayc5sg", name: "Home", params: undefined},
      {
        key: "OtherHome-7_-sY-E4SGWfQ44yOvqlu",
        name: "OtherHome",
      },
    ],
    stale: false,
    state: {
      index: 1,
      key: "stack-OHYP8Bw7fK21E7g-0392U",
      routeNames: ["StackHome", "StackHome2"],
      routes: [
        {
          key: "StackHome-G85tmcl5lqx1v93UnnPzS",
          name: "StackHome",
          params: undefined,
        },
        {
          key: "StackHome2-cGatj4Bzh9lG2hZcRVgxC",
          name: "StackHome2",
          params: undefined,
          path: undefined,
        },
      ],
      stale: false,
      type: "stack",
    },
    type: "tab",
  };
  const initMockedHistory = {
    history: [
      {key: "Home-Yii-q1BuKBL4I5_ayc5sg", type: "route"},
      {key: "OtherHome-7_-sY-E4SGWfQ44yOvqlu", type: "route"},
    ],
    index: 1,
    key: "tab-lutziKhzsg1veujnx1aHq",
    routeNames: ["Home", "OtherHome"],
    routes: [
      {key: "Home-Yii-q1BuKBL4I5_ayc5sg", name: "Home", params: undefined},
      {
        key: "OtherHome-7_-sY-E4SGWfQ44yOvqlu",
        name: "OtherHome",
      },
    ],
    stale: false,
    type: "tab",
  };
  test("Navigation Ref was not Provided", () => {
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
    jest.mock("react", () => ({
      useEffect: (w: () => void) => {
        w();
      },
      useState: () => [false, () => {}],
      useRef: () => {
        return {current: {}};
      },
    }));
    const mockCurrentRoute = jest.fn();
    const {useEmbraceNavigationTracker} = require("../src/index");

    useEmbraceNavigationTracker();
    expect(mockCurrentRoute).toHaveBeenCalledTimes(0);
  });
  test("None state was provided", () => {
    const {findNavigationHistory} = require("../navigation/Utils");
    expect(findNavigationHistory()).toEqual([]);
  });
  test("Init Screen", () => {
    const {findNavigationHistory} = require("../navigation/Utils");

    expect(findNavigationHistory(initMockedHistory)).toEqual([
      {name: "OtherHome"},
    ]);
  });
  test("Get Navigation History", () => {
    const {findNavigationHistory} = require("../navigation/Utils");

    expect(findNavigationHistory(mockedHistory)).toEqual([
      {name: "StackHome"},
      {name: "StackHome2"},
    ]);
  });
  test("Add Listener was called", () => {
    jest.mock("react", () => ({
      useEffect: (w: () => void) => {
        w();
      },
      useState: () => [false, () => {}],
      useRef: () => {
        return {current: {}};
      },
    }));
    const mockAddListener = jest.fn();
    const {useEmbraceNavigationTracker} = require("../src/index");
    const navigationRef = {
      current: {
        addListener: mockAddListener,
        getCurrentRoute: () => {
          return initMockedHistory;
        },
      },
    };
    useEmbraceNavigationTracker(navigationRef);
    expect(mockAddListener).toHaveBeenCalledTimes(1);
  });
  test("Track init screen", () => {
    jest.mock("react", () => ({
      useEffect: (w: () => void) => {
        w();
      },
      useState: () => [false, () => {}],
      useRef: () => {
        return {current: {}};
      },
    }));
    const mockAddListener = jest.fn();
    const {useEmbraceNavigationTracker} = require("../src/index");
    const navigationRef = {
      current: {
        addListener: mockAddListener,
        getCurrentRoute: () => {
          return mockedHistory;
        },
      },
    };
    useEmbraceNavigationTracker(navigationRef);
    expect(mockAddListener).toHaveBeenCalledTimes(1);
  });
  test("Track on nav state update", () => {
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
    jest.mock("react", () => ({
      useEffect: (w: () => void) => {
        w();
      },
      useState: () => [false, () => {}],
      useRef: () => {
        return {current: {}};
      },
    }));
    const {useEmbraceNavigationTracker} = require("../src/index");
    const navigationRef = {
      current: {
        addListener: (q: any, w: (e: any) => {}) => {
          w({data: {state: mockedHistory}});
        },
        getCurrentRoute: () => {
          return mockedHistory;
        },
      },
    };
    useEmbraceNavigationTracker(navigationRef);
    expect(mockStartView).toHaveBeenCalledTimes(1);
  });
  test("Track on Second Screen", () => {
    const mockStartView = jest.fn();
    const mockEndView = jest.fn();
    jest.mock(
      "react",
      () => ({
        useEffect: (w: () => void) => {
          w();
        },
        useState: () => [true, () => {}],
        useRef: () => {
          return {current: {name: "HomeScreen", spanId: "123123-MY-ID"}};
        },
      }),
      {virtual: true},
    );
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
    const {useEmbraceNavigationTracker} = require("../src/index");
    const navigationRef = {
      current: {
        addListener: (q: any, w: (e: any) => {}) => {
          w({data: {state: mockedHistory}});
        },
        getCurrentRoute: () => {
          return mockedHistory;
        },
      },
    };
    useEmbraceNavigationTracker(navigationRef);
    expect(mockStartView).toHaveBeenCalledTimes(1);
    expect(mockEndView).toHaveBeenCalledTimes(1);
  });
  test("End View does not exist", () => {
    jest.mock(
      "react",
      () => ({
        useEffect: (w: () => void) => {
          w();
        },
        useState: () => [true, () => {}],
        useRef: () => {
          return {current: {name: "HomeScreen", spanId: "123123-MY-ID"}};
        },
      }),
      {virtual: true},
    );
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            endView: undefined,
          },
        },
      }),
      {virtual: true},
    );

    const {useEmbraceNavigationTracker} = require("../src/index");
    const navigationRef = {
      current: {
        addListener: (q: any, w: (e: any) => {}) => {
          w({data: {state: mockedHistory}});
        },
        getCurrentRoute: () => {
          return mockedHistory;
        },
      },
    };
    useEmbraceNavigationTracker(navigationRef);
  });
});
