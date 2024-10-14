import {IAnyAction} from "../interfaces/MiddlewareInterfaces";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

describe("Test State Managment", () => {
  test("Applying middleware - With Name", async () => {
    const mockStartSpan = jest.fn();
    const mockStopSpan = jest.fn();
    const mockAddSpanAttributeToSpan = jest.fn();
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockStartSpan,
          stopSpan: mockStopSpan,
          addSpanAttributeToSpan: mockAddSpanAttributeToSpan,
        },
      },
    }));
    const {buildEmbraceMiddleware} = require("../src/index");

    const buildedEmbraceMiddleware = buildEmbraceMiddleware();
    const store = buildedEmbraceMiddleware({});
    const dispatch = (d: IAnyAction) => {
      return d;
    };
    const action = {type: "CREATE_USER"};
    const response = await store(dispatch)(action);
    expect(response).toEqual(action);
    expect(mockStartSpan).toHaveBeenCalled();
    expect(mockStopSpan).toHaveBeenCalled();
    expect(mockAddSpanAttributeToSpan).toHaveBeenCalled();
  });
  test("Applying middleware - Without Name", async () => {
    const mockStartSpan = jest.fn();
    const mockStopSpan = jest.fn();
    const mockAddSpanAttributeToSpan = jest.fn();
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockStartSpan,
          stopSpan: mockStopSpan,
          addSpanAttributeToSpan: mockAddSpanAttributeToSpan,
        },
      },
    }));
    const {buildEmbraceMiddleware} = require("../src/index");

    const buildedEmbraceMiddleware = buildEmbraceMiddleware();
    const store = buildedEmbraceMiddleware({});
    const dispatch = (d: IAnyAction) => {
      return d;
    };
    const action = {type: undefined};

    const response = await store(dispatch)(action);
    expect(response).toEqual(0);
    expect(mockStartSpan).toHaveBeenCalledTimes(0);
    expect(mockStopSpan).toHaveBeenCalledTimes(0);
    expect(mockAddSpanAttributeToSpan).toHaveBeenCalledTimes(0);
  });
  test("Dispatch not provided", async () => {
    const mockStartSpan = jest.fn();
    const mockStopSpan = jest.fn();
    const mockAddSpanAttributeToSpan = jest.fn();
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockStartSpan,
          stopSpan: mockStopSpan,
          addSpanAttributeToSpan: mockAddSpanAttributeToSpan,
        },
      },
    }));
    const {buildEmbraceMiddleware} = require("../src/index");

    const buildedEmbraceMiddleware = buildEmbraceMiddleware();
    const store = buildedEmbraceMiddleware({});

    const action = {type: "CREATE_USER"};

    const response = await store()(action);
    expect(response).toEqual(0);
    expect(mockStartSpan).toHaveBeenCalledTimes(0);
    expect(mockStopSpan).toHaveBeenCalledTimes(0);
    expect(mockAddSpanAttributeToSpan).toHaveBeenCalledTimes(0);
  });
  test("Dispatch is not a function", async () => {
    const mockStartSpan = jest.fn();
    const mockStopSpan = jest.fn();
    const mockAddSpanAttributeToSpan = jest.fn();
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockStartSpan,
          stopSpan: mockStopSpan,
          addSpanAttributeToSpan: mockAddSpanAttributeToSpan,
        },
      },
    }));
    const {buildEmbraceMiddleware} = require("../src/index");

    const buildedEmbraceMiddleware = buildEmbraceMiddleware();
    const store = buildedEmbraceMiddleware({});

    const action = {type: "CREATE_USER"};

    const response = await store({})(action);
    expect(response).toEqual(0);
    expect(mockStartSpan).toHaveBeenCalledTimes(0);
    expect(mockStopSpan).toHaveBeenCalledTimes(0);
    expect(mockAddSpanAttributeToSpan).toHaveBeenCalledTimes(0);
  });
  test("Action not provided", async () => {
    const mockStartSpan = jest.fn();
    const mockStopSpan = jest.fn();
    const mockAddSpanAttributeToSpan = jest.fn();
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockStartSpan,
          stopSpan: mockStopSpan,
          addSpanAttributeToSpan: mockAddSpanAttributeToSpan,
        },
      },
    }));
    const {buildEmbraceMiddleware} = require("../src/index");

    const buildedEmbraceMiddleware = buildEmbraceMiddleware();
    const store = buildedEmbraceMiddleware({});

    const dispatch = (d: IAnyAction) => {
      return d;
    };

    const response = await store(dispatch)();
    expect(response).toEqual(0);
    expect(mockStartSpan).toHaveBeenCalledTimes(0);
    expect(mockStopSpan).toHaveBeenCalledTimes(0);
    expect(mockAddSpanAttributeToSpan).toHaveBeenCalledTimes(0);
  });
  test("Action provided is not a String", async () => {
    const mockStartSpan = jest.fn();
    const mockStopSpan = jest.fn();
    const mockAddSpanAttributeToSpan = jest.fn();
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockStartSpan,
          stopSpan: mockStopSpan,
          addSpanAttributeToSpan: mockAddSpanAttributeToSpan,
        },
      },
    }));
    const {buildEmbraceMiddleware} = require("../src/index");

    const buildedEmbraceMiddleware = buildEmbraceMiddleware();
    const store = buildedEmbraceMiddleware({});
    const dispatch = (d: IAnyAction) => {
      return d;
    };
    const action = {type: 1};

    const response = await store(dispatch)(action);
    expect(response).toEqual(action);
    expect(mockStartSpan).toHaveBeenCalled();
    expect(mockStopSpan).toHaveBeenCalled();
    expect(mockAddSpanAttributeToSpan).toHaveBeenCalled();
  });

  test("Error occurred", () => {
    const mockStartSpan = jest.fn();
    const mockStopSpan = jest.fn();
    const mockAddSpanAttributeToSpan = jest.fn();
    const mockLogBreadcrumb = jest.fn();

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockStartSpan,
          stopSpan: mockStopSpan,
          addSpanAttributeToSpan: mockAddSpanAttributeToSpan,
          logRNAction: (
            n: string,
            st: string,
            et: string,
            p: string,
            pd: number,
            output: string,
          ) => {
            if (output === "FAIL") {
              mockLogBreadcrumb();
              return;
            }
            throw new Error("Just crash it");
          },
        },
      },
    }));
    const {buildEmbraceMiddleware} = require("../src/index");

    const buildedEmbraceMiddleware = buildEmbraceMiddleware();
    const store = buildedEmbraceMiddleware({});
    const dispatch = (d: IAnyAction) => {
      return d;
    };
    const action = {type: "CREATE_USER"};
    try {
      store(dispatch)(action);
    } catch (e) {
      if (e instanceof Error) {
        expect(e.message).toBe("Just crash it");
      }
      expect(mockLogBreadcrumb).toHaveBeenCalled();
    }
  });
});
