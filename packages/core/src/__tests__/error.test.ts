import {
  generateStackTrace,
  handleError,
  handleGlobalError,
  STACK_LIMIT,
} from "../utils/ErrorUtil";
import {ComponentError, logIfComponentError} from "../utils/ComponentError";

const mockErrorCallback = jest.fn();
const mockLogUnhandledJSException = jest
  .fn()
  .mockReturnValue(Promise.resolve(true));
const mockLogHandledError = jest.fn();
const mockPreviousHandler = jest.fn();

const ReactNativeMock = jest.requireMock("react-native");

jest.mock("react-native", () => ({
  Platform: {
    OS: "android",
  },
  NativeModules: {
    EmbraceManager: {
      logHandledError: (
        message: string,
        componentStack: string,
        params: object,
      ) => {
        mockLogHandledError(message, componentStack, params);
        return Promise.resolve(true);
      },
      logUnhandledJSException: (
        name: string,
        message: string,
        errorType: string,
        stack: string,
      ) => mockLogUnhandledJSException(name, message, errorType, stack),
    },
  },
}));

describe("Component Error", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Error is not a component error", async () => {
    const customError = new Error("Ups!");

    const result = await logIfComponentError(customError);
    expect(result).toBe(false);
    expect(mockLogHandledError).not.toHaveBeenCalled();
  });

  test("Error is a component error, but the component stack is empty", async () => {
    const customError = new Error("Ups!") as ComponentError;

    customError.componentStack = "";

    const result = await logIfComponentError(customError);
    expect(result).toBe(false);
    expect(mockLogHandledError).not.toHaveBeenCalled();
  });

  test("Error is a component error and the component stack is not empty", async () => {
    const customError = new Error("Ups!") as ComponentError;

    customError.componentStack = "in SomeScreen/n in SomeOtherScreen";

    const result = await logIfComponentError(customError);
    expect(result).toBe(true);
    expect(mockLogHandledError).toHaveBeenCalledWith(
      customError.message,
      customError.componentStack,
      {},
    );
  });
  test("Error handler should call Component Error Log", async () => {
    const customError = new Error("Ups!") as ComponentError;

    customError.componentStack = "in SomeScreen/n in SomeOtherScreen";
    const result = await handleError(customError, mockErrorCallback);
    expect(result).toBe(true);
    expect(mockErrorCallback).toHaveBeenCalled();

    expect(mockLogHandledError).toHaveBeenCalledWith(
      customError.message,
      customError.componentStack,
      {},
    );
  });
});

describe("Error Handler", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Error handler should call callback - Android", async () => {
    const customError = new Error("Ups!");
    const {name, message, stack} = customError;
    const result = await handleError(customError, mockErrorCallback);
    expect(result).toBe(true);
    const errorType = customError.constructor.name;
    let stTruncated = stack;
    if (stack) {
      stTruncated = stack.split("\n").slice(0, STACK_LIMIT).join("\n");
    }
    expect(mockErrorCallback).toHaveBeenCalled();
    expect(mockLogUnhandledJSException).toHaveBeenCalledWith(
      name,
      message,
      errorType,
      stTruncated,
    );
  });
  test("Error handler should not call callback", async () => {
    const customError = {
      name: "Not Eror",
      message: "Custom Message",
      stack: "in SomeScreen/n in SomeOtherScreen",
    };

    const result = await handleError(customError, mockErrorCallback);
    expect(result).toBe(false);
    expect(mockErrorCallback).not.toHaveBeenCalled();
    expect(mockLogUnhandledJSException).not.toHaveBeenCalled();
  });
  test("Error handler should call callback - iOS", async () => {
    ReactNativeMock.Platform.OS = "ios";

    const customError = new Error("Ups!");
    const {name, message, stack} = customError;
    const result = await handleError(customError, mockErrorCallback);
    expect(result).toBe(true);

    const errorType = customError.constructor.name;

    let stTruncated: string[] = [];
    if (stack) {
      stTruncated = stack.split("\n").slice(0, STACK_LIMIT);
    }

    const iosStackTrace = JSON.stringify({
      n: name,
      m: message,
      t: errorType,
      st: stTruncated.slice(1, stTruncated.length).join("\n"),
    });
    expect(mockErrorCallback).toHaveBeenCalled();
    expect(mockLogUnhandledJSException).toHaveBeenCalledWith(
      name,
      message,
      errorType,
      iosStackTrace,
    );
  });
});

describe("Error Utils functions", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Generate Stack", async () => {
    const stack = generateStackTrace();
    expect(stack.includes("ErrorUtil.ts")).toBe(true);
  });
  test("Generate Stack", async () => {
    jest.useFakeTimers();

    const customError = new Error("Ups!");
    const customHandleError = (_: Error, callback: () => void) => {
      callback();

      return Promise.resolve(true);
    };
    handleGlobalError(mockPreviousHandler, customHandleError)(
      customError,
      true,
    );
    jest.runAllTimers();
    expect(mockPreviousHandler).toHaveBeenCalledWith(customError, true);
  });
  test("Generate Stack", async () => {
    jest.useFakeTimers();

    const customError = new Error("Ups!");
    const customHandleError = (_: Error, callback: () => void) => {
      callback();

      return Promise.resolve(true);
    };
    handleGlobalError(mockPreviousHandler, customHandleError)(
      customError,
      true,
    );
    jest.runAllTimers();
    expect(mockPreviousHandler).toHaveBeenCalledWith(customError, true);
  });
});
