import {trackUnhandledRejection} from "../utils/error";
import {logHandledError} from "../api/log";
import {ComponentError, logIfComponentError} from "../api/component";

const mockLogHandledError = jest.fn().mockReturnValue(Promise.resolve(true));
const mockLogMessageWithSeverityAndProperties = jest
  .fn()
  .mockReturnValue(Promise.resolve(true));

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    logHandledError: (...args: unknown[]) => mockLogHandledError(...args),
    logMessageWithSeverityAndProperties: (...args: unknown[]) =>
      mockLogMessageWithSeverityAndProperties(...args),
  },
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
