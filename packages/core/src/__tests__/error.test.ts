import {logHandledError} from "../utils/log";
import {ComponentError, logIfComponentError} from "../utils/component";
import {LogProperties} from "../../src/interfaces";

const mockLogHandledError = jest.fn();
const mockLogMessageWithSeverityAndProperties = jest.fn();

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    logHandledError: (
      message: string,
      stackTrace: string,
      properties: LogProperties,
    ) => mockLogHandledError(message, stackTrace, properties),
    logMessageWithSeverityAndProperties: (
      message: string,
      errorType: string,
      properties: LogProperties,
      componentStack: string,
    ) => {
      mockLogMessageWithSeverityAndProperties(
        message,
        errorType,
        properties,
        componentStack,
      );
      return Promise.resolve(true);
    },
  },
}));

const mockGenerateStackTrace = jest.fn();
jest.mock("../utils/error", () => ({
  ...jest.requireActual("../utils/error"),
  generateStackTrace: () => mockGenerateStackTrace(),
}));

beforeEach(() => {
  jest.resetAllMocks();
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
