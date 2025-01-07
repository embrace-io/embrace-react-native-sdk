import {logError, logInfo, logMessage, logWarning} from "../api/log";
import {LogSeverity, LogProperties} from "../interfaces";

const MOCK_STACKTRACE = "this is a fake stack trace";

const mockLogMessageWithSeverityAndProperties = jest.fn();
const mockLogHandledError = jest.fn();

beforeEach(() => {
  mockGenerateStackTrace.mockReturnValue(MOCK_STACKTRACE);
});

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
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
    logHandledError: (
      message: string,
      stackTrace: string,
      properties: LogProperties,
    ) => mockLogHandledError(message, stackTrace, properties),
  },
}));

const mockGenerateStackTrace = jest.fn();
jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  generateStackTrace: () => mockGenerateStackTrace(),
}));

describe("logMessage", () => {
  const testMessage = "a message";
  const testProps = {foo: "bar"};

  it("should log an `info` message", async () => {
    await logMessage(testMessage, "info", testProps, false);
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      testMessage,
      "info",
      testProps,
      "",
      false,
    );

    // even forcing to include stacktrace it shouldn't pass to the native layer
    await logMessage(testMessage, "info", testProps, true);
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      testMessage,
      "info",
      testProps,
      "",
      true,
    );
  });

  it("should log a `warning` message", async () => {
    await logMessage(testMessage, "warning", testProps, false);
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "a message",
      "warning",
      {foo: "bar"},
      "",
      false,
    );

    await logMessage(testMessage, "warning", testProps, true);
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "a message",
      "warning",
      testProps,
      MOCK_STACKTRACE,
      true,
    );
  });

  it("should log an `error` message", async () => {
    await logMessage(testMessage, "error", testProps, false);
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "a message",
      "error",
      testProps,
      "",
      false,
    );

    await logMessage(testMessage, "error", testProps, true);
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "a message",
      "error",
      testProps,
      MOCK_STACKTRACE,
      true,
    );
  });

  it("logInfo", async () => {
    await logInfo("pushed an `info` log");
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "pushed an `info` log",
      "info",
      {},
      "",
      false,
    );
  });

  it("logWarning", async () => {
    await logWarning("pushed a `warning` log", false);
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "pushed a `warning` log",
      "warning",
      {},
      "",
      false,
    );

    await logWarning("pushed a `warning` log", true);
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "pushed a `warning` log",
      "warning",
      {},
      MOCK_STACKTRACE,
      true,
    );

    // by default it should add the stacktrace
    await logWarning("pushed a `warning` log");
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "pushed a `warning` log",
      "warning",
      {},
      MOCK_STACKTRACE,
      true,
    );
  });

  it("logError", async () => {
    await logError("pushed an `error` log", false);
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "pushed an `error` log",
      "error",
      {},
      "",
      false,
    );

    await logError("pushed an `error` log", true);
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "pushed an `error` log",
      "error",
      {},
      MOCK_STACKTRACE,
      true,
    );

    // by default it should add the stacktrace
    await logError("pushed an `error` log");
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "pushed an `error` log",
      "error",
      {},
      MOCK_STACKTRACE,
      true,
    );
  });
});
