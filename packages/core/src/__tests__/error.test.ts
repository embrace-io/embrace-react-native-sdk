import {Platform} from "react-native";
import {waitFor} from "@testing-library/react-native";

import {
  enableUnhandledRejectionTracking,
  trackUnhandledRejection,
} from "../utils/error";
import EmbraceLogger from "../utils/EmbraceLogger";
import {LogProperties, LogSeverity} from "../interfaces";
import {logHandledError} from "../api/log";
import {handleError, handleGlobalError} from "../api/error";
import {ComponentError, logIfComponentError} from "../api/component";

const mockLogHandledError = jest.fn().mockReturnValue(Promise.resolve(true));
const mockLogMessageWithSeverityAndProperties = jest
  .fn()
  .mockReturnValue(Promise.resolve(true));
const mockLogUnhandledJSException = jest
  .fn()
  .mockReturnValue(Promise.resolve(true));
const mockEnableRejectionTracking = jest.fn();

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    logHandledError: (
      message: string,
      stackTrace: string,
      properties: LogProperties,
    ) => mockLogHandledError(message, stackTrace, properties),
    logMessageWithSeverityAndProperties: (
      message: string,
      severity: LogSeverity,
      properties: LogProperties,
      stacktrace: string,
      includeStacktrace: boolean,
    ) =>
      mockLogMessageWithSeverityAndProperties(
        message,
        severity,
        properties,
        stacktrace,
        includeStacktrace,
      ),
    logUnhandledJSException: (
      name: string,
      message: string,
      type: string,
      stackTrace: string,
    ) => mockLogUnhandledJSException(name, message, type, stackTrace),
  },
}));

jest.mock("promise/setimmediate/rejection-tracking", () => ({
  enable: (config: unknown) => mockEnableRejectionTracking(config),
}));

jest.mock("../utils/log", () => ({
  ...jest.requireActual("../utils/log"),
  generateStackTrace: () => jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Component Error", () => {
  describe("error is not a `ComponentError", () => {
    it("and it should not log an extra unhandled exception", async () => {
      const customError = new Error("Ups!");

      const result = await logIfComponentError(customError);
      expect(result).toBe(false);
      expect(mockLogMessageWithSeverityAndProperties).not.toHaveBeenCalled();
    });
  });

  describe("error is a `ComponentError`", () => {
    it("but the stack is empty", async () => {
      const customError = new Error("Ups!") as ComponentError;
      customError.componentStack = "";

      const result = await logIfComponentError(customError);
      expect(result).toBe(false);
      expect(mockLogMessageWithSeverityAndProperties).not.toHaveBeenCalled();
    });

    test("but the stack is not empty", async () => {
      const componentError = new Error("Ups!") as ComponentError;
      componentError.componentStack = "in SomeScreen/n in SomeOtherScreen";

      const result = await logIfComponentError(componentError);
      expect(result).toBe(true);
      expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        "Ups!",
        "error",
        {},
        "in SomeScreen/n in SomeOtherScreen",
        true,
      );
    });
  });
});

describe("`handleGlobalError()`", () => {
  it("logs a component error before forwarding it", async () => {
    const mockPreviousHandler = jest.fn().mockReturnValue(jest.fn());

    const generatedGlobalErrorFunc = handleGlobalError(
      mockPreviousHandler,
      handleError,
    );

    const componentError = new Error("Test") as ComponentError;
    componentError.componentStack = "in SomeScreen\n in SomeOtherScreen";

    generatedGlobalErrorFunc(componentError, false);

    await waitFor(() => {
      expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        "Test",
        "error",
        {},
        "in SomeScreen\n in SomeOtherScreen",
        true,
      );
      expect(mockPreviousHandler).toHaveBeenCalledWith(componentError, false);
    });
  });

  it("forwards the error even when logging it is rejected", async () => {
    const mockPreviousHandler = jest.fn();
    mockLogUnhandledJSException.mockRejectedValueOnce("Some rejected value");

    const generatedGlobalErrorFunc = handleGlobalError(
      mockPreviousHandler,
      handleError,
    );

    const error = new Error("Test");
    generatedGlobalErrorFunc(error, true);

    await waitFor(() => {
      expect(mockPreviousHandler).toHaveBeenCalledWith(error, true);
      expect(console.warn).toHaveBeenCalledWith(
        "[Embrace] Failed to log exception",
      );
    });
  });
});

describe("Handled JS Exceptions", () => {
  const testError = new Error("This is a test error");

  it("error (instance of Error) with properties", async () => {
    const testProps = {foo: "bar"};
    await logHandledError(testError, testProps);

    expect(mockLogHandledError).toHaveBeenCalledWith(
      testError.message,
      testError.stack,
      testProps,
    );
  });

  it("error (instance of Error) without properties", async () => {
    await logHandledError(testError, undefined);

    expect(mockLogHandledError).toHaveBeenCalledWith(
      testError.message,
      testError.stack,
      {},
    );
  });

  it("not an instance of error", async () => {
    // even when ts complains about the type, we want to test this scenario
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await logHandledError("not an error", undefined);

    expect(mockLogHandledError).not.toHaveBeenCalled();
  });
});

describe("`trackUnhandledRejection()`", () => {
  it("'Error' instance", async () => {
    const error = new Error("`trackUnhandledRejection` test message");
    trackUnhandledRejection("any value", error);

    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "Unhandled promise rejection: `trackUnhandledRejection` test message",
      "error",
      {},
      error.stack,
      true,
    );
  });

  it("not an instance of 'Error'", async () => {
    const error = "not an Error instance";
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    trackUnhandledRejection("any value", error);

    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "Unhandled promise rejection: not an Error instance",
      "error",
      {},
      "",
      false,
    );
  });
});

describe("`enableUnhandledRejectionTracking()`", () => {
  const logger = new EmbraceLogger(console);

  afterEach(() => {
    // @ts-expect-error HermesInternal isn't part of `global`'s type
    global.HermesInternal = undefined;
  });

  it("uses Hermes when it provides promises", () => {
    const hermesInternal = {
      hasPromise: () => true,
      enablePromiseRejectionTracker: jest.fn(),
    };
    // @ts-expect-error HermesInternal isn't part of `global`'s type
    global.HermesInternal = hermesInternal;

    enableUnhandledRejectionTracking(logger);

    expect(hermesInternal.enablePromiseRejectionTracker).toHaveBeenCalledWith({
      allRejections: true,
      onUnhandled: trackUnhandledRejection,
      onHandled: expect.any(Function),
    });
    expect(mockEnableRejectionTracking).not.toHaveBeenCalled();
  });

  it("warns and logs when the setup fails", () => {
    mockEnableRejectionTracking.mockImplementationOnce(() => {
      throw new Error("tracking setup failed");
    });

    enableUnhandledRejectionTracking(logger);

    expect(console.warn).toHaveBeenCalledWith(
      "[Embrace] we were unable to setup tracking of unhandled promise rejections.",
    );
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "we were unable to setup tracking of unhandled promise rejections. | Error: tracking setup failed",
      "warning",
      {},
      expect.anything(),
      true,
    );
  });
});

describe("`handleError()`", () => {
  const error = new Error("Test");
  error.stack = "Error: Test\n    at foo (app.js:1:1)\n    at bar (app.js:2:2)";

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("sends the stack trace as plain text on Android", async () => {
    jest.replaceProperty(Platform, "OS", "android");

    await handleError(error, jest.fn());

    expect(mockLogUnhandledJSException).toHaveBeenCalledWith(
      "Error",
      "Test",
      "Error",
      "Error: Test\n    at foo (app.js:1:1)\n    at bar (app.js:2:2)",
    );
  });

  it("sends the stack trace as JSON without its first line on iOS", async () => {
    jest.replaceProperty(Platform, "OS", "ios");

    await handleError(error, jest.fn());

    expect(mockLogUnhandledJSException).toHaveBeenCalledWith(
      "Error",
      "Test",
      "Error",
      JSON.stringify({
        n: "Error",
        m: "Test",
        t: "Error",
        st: "    at foo (app.js:1:1)\n    at bar (app.js:2:2)",
      }),
    );
  });
});
