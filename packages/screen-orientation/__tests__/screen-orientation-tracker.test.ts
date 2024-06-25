jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

describe("Test Orientation Tracker", () => {
  test("Project without React Native Embrace", () => {
    const mockDimensionGet = jest.fn();
    jest.mock("react", () => ({
      useEffect: (w: () => void) => {
        w();
      },
      useRef: () => {
        return {current: undefined};
      },
    }));
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: undefined,
      },
      Dimensions: {
        get: mockDimensionGet,
      },
    }));

    const {useEmbraceOrientationLogger} = require("../src/index");

    useEmbraceOrientationLogger();
    expect(mockDimensionGet).toHaveBeenCalledTimes(0);
  });
  test("Init successfully - Landscape", () => {
    const mockBreadcrumb = jest.fn();

    jest.mock("react", () => ({
      useEffect: (w: () => void) => {
        w();
      },
      useRef: () => {
        return {current: undefined};
      },
    }));
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          logBreadcrumb: (message: string) => {
            if (message.includes("landscape")) {
              mockBreadcrumb();
            }
          },
        },
      },
      Dimensions: {
        addEventListener: () => {},
        get: () => {
          return {
            width: 300,
            height: 200,
          };
        },
      },
    }));

    const {useEmbraceOrientationLogger} = require("../src/index");

    useEmbraceOrientationLogger();
    expect(mockBreadcrumb).toHaveBeenCalledTimes(1);
  });
  test("Init successfully - Portrait", () => {
    const mockBreadcrumb = jest.fn();

    jest.mock("react", () => ({
      useEffect: (w: () => void) => {
        w();
      },
      useRef: () => {
        return {current: undefined};
      },
    }));
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          logBreadcrumb: (message: string) => {
            if (message.includes("portrait")) {
              mockBreadcrumb();
            }
          },
        },
      },
      Dimensions: {
        addEventListener: () => {},
        get: () => {
          return {
            width: 100,
            height: 200,
          };
        },
      },
    }));

    const {useEmbraceOrientationLogger} = require("../src/index");

    useEmbraceOrientationLogger();
    expect(mockBreadcrumb).toHaveBeenCalledTimes(1);
  });
  test("Init successfully - Portrait", () => {
    const mockBreadcrumb = jest.fn();

    jest.mock("react", () => ({
      useEffect: (w: () => void) => {
        w();
      },
      useRef: () => {
        return {current: undefined};
      },
    }));
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          logBreadcrumb: (message: string) => {
            if (message.includes("portrait")) {
              mockBreadcrumb();
            }
          },
        },
      },
      Dimensions: {
        addEventListener: () => {},
        get: () => {
          return {
            width: 100,
            height: 200,
          };
        },
      },
    }));

    const {useEmbraceOrientationLogger} = require("../src/index");

    useEmbraceOrientationLogger();
    expect(mockBreadcrumb).toHaveBeenCalledTimes(1);
  });

  test("Init successfully - Portrait", () => {
    const mockBreadcrumb = jest.fn();

    jest.mock("react", () => ({
      useEffect: (w: () => void) => {
        w();
      },
      useRef: () => {
        return {current: undefined};
      },
    }));
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          logBreadcrumb: (message: string) => {
            if (message.includes("portrait")) {
              mockBreadcrumb();
            }
          },
        },
      },
      Dimensions: {
        addEventListener: () => {},
        get: () => {
          return {
            width: 100,
            height: 200,
          };
        },
      },
    }));

    const {useEmbraceOrientationLogger} = require("../src/index");

    useEmbraceOrientationLogger();
    expect(mockBreadcrumb).toHaveBeenCalledTimes(1);
  });
  test("Init successfully - Portrait - With Change", () => {
    const mockBreadcrumb = jest.fn();

    jest.mock("react", () => ({
      useEffect: (w: () => void) => {
        w();
      },
      useRef: () => {
        return {current: undefined};
      },
    }));
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          logBreadcrumb: (message: string) => {
            if (message.includes("portrait")) {
              mockBreadcrumb();
            }
          },
        },
      },
      Dimensions: {
        addEventListener: (q: string, w: () => {}) => {
          if (q) {
            w();
          }
        },
        get: jest
          .fn()
          .mockReturnValueOnce({
            width: 100,
            height: 200,
          })
          .mockReturnValueOnce({
            width: 200,
            height: 100,
          }),
      },
    }));

    const {useEmbraceOrientationLogger} = require("../src/index");

    useEmbraceOrientationLogger();
    expect(mockBreadcrumb).toHaveBeenCalledTimes(2);
  });
  test("Init successfully - Portrait - With Change, but same orientation", () => {
    const mockBreadcrumb = jest.fn();

    jest.mock("react", () => ({
      useEffect: (w: () => void) => {
        w();
      },
      useRef: () => {
        return {current: undefined};
      },
    }));
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          logBreadcrumb: (message: string) => {
            if (message.includes("portrait")) {
              mockBreadcrumb();
            }
          },
        },
      },
      Dimensions: {
        addEventListener: (q: string, w: () => {}) => {
          if (q) {
            w();
          }
        },
        get: jest
          .fn()
          .mockReturnValueOnce({
            width: 100,
            height: 200,
          })
          .mockReturnValueOnce({
            width: 100,
            height: 200,
          }),
      },
    }));

    const {useEmbraceOrientationLogger} = require("../src/index");

    useEmbraceOrientationLogger();
    expect(mockBreadcrumb).toHaveBeenCalledTimes(1);
  });
});
