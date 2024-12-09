import {LogSeverity, MethodType, LogProperties} from "../interfaces/common";
import {
  addBreadcrumb,
  addSessionProperty,
  addUserPersona,
  clearAllUserPersonas,
  clearUserAsPayer,
  clearUserEmail,
  clearUserIdentifier,
  clearUsername,
  clearUserPersona,
  endView,
  getCurrentSessionId,
  getDeviceId,
  getLastRunEndState,
  logError,
  logHandledError,
  logInfo,
  logMessage,
  logNetworkClientError,
  logScreen,
  logWarning,
  recordNetworkRequest,
  removeSessionProperty,
  setJavaScriptBundlePath,
  setUserAsPayer,
  setUserEmail,
  setUserIdentifier,
  setUsername,
  startView,
} from "../index";

const mockSetUserIdentifier = jest.fn();
const mockClearUserIdentifier = jest.fn();
const mockSetUsername = jest.fn();
const mockClearUsername = jest.fn();
const mockSetUserEmail = jest.fn();
const mockClearUserEmail = jest.fn();
const mockAddBreadcrumb = jest.fn();
const mockLogMessageWithSeverityAndProperties = jest.fn();
const mockLogHandledError = jest.fn();
const mockAddUserPersona = jest.fn();
const mockClearUserPersona = jest.fn();
const mockClearAllUserPersonas = jest.fn();
const mockStartView = jest.fn();
const mockEndView = jest.fn();
const mockAddSessionProperty = jest.fn();
const mockRemoveSessionProperty = jest.fn();
const mockSetUserAsPayer = jest.fn();
const mockClearUserAsPayer = jest.fn();
const mockSetJavaScriptBundlePath = jest.fn();
const mockLogNetworkRequest = jest.fn();
const mockLogNetworkClientError = jest.fn();
const mockGetLastRunEndState = jest.fn();
const mockGetDeviceId = jest.fn();
const mockGetCurrentSessionId = jest.fn();

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    setUserIdentifier: (userIdentifier: string) =>
      mockSetUserIdentifier(userIdentifier),
    clearUserIdentifier: () => mockClearUserIdentifier(),
    setUsername: (username: string) => mockSetUsername(username),
    clearUsername: () => mockClearUsername(),
    setUserEmail: (userEmail: string) => mockSetUserEmail(userEmail),
    clearUserEmail: () => mockClearUserEmail(),
    addBreadcrumb: (message: string) => mockAddBreadcrumb(message),
    logMessageWithSeverityAndProperties: (
      message: string,
      severity: LogSeverity,
      properties: LogProperties,
      stacktrace: string,
    ) =>
      mockLogMessageWithSeverityAndProperties(
        message,
        severity,
        properties,
        stacktrace,
      ),
    logHandledError: (
      message: string,
      stackTrace: string,
      properties?: LogProperties,
    ) => mockLogHandledError(message, stackTrace, properties),
    addUserPersona: (persona: string) => mockAddUserPersona(persona),
    clearUserPersona: (persona: string) => mockClearUserPersona(persona),
    clearAllUserPersonas: () => mockClearAllUserPersonas(),
    startView: (view: string) => mockStartView(view),
    endView: (view: string) => mockEndView(view),
    addSessionProperty: (key: string, value: string, permanent: boolean) =>
      mockAddSessionProperty(key, value, permanent),
    removeSessionProperty: (key: string) => mockRemoveSessionProperty(key),
    setUserAsPayer: () => {
      mockSetUserAsPayer();
      return false;
    },
    clearUserAsPayer: () => {
      mockClearUserAsPayer();
      return false;
    },
    setJavaScriptBundlePath: (path: string) =>
      mockSetJavaScriptBundlePath(path),
    logNetworkRequest: (
      url: string,
      httpMethod: MethodType,
      startInMillis: number,
      endInMillis: number,
      bytesSent: number,
      bytesReceived: number,
      statusCode: number,
    ) =>
      mockLogNetworkRequest(
        url,
        httpMethod,
        startInMillis,
        endInMillis,
        bytesSent,
        bytesReceived,
        statusCode,
      ),
    logNetworkClientError: (
      url: string,
      httpMethod: MethodType,
      startInMillis: number,
      endInMillis: number,
      errorType: string,
      errorMessage: string,
    ) =>
      mockLogNetworkClientError(
        url,
        httpMethod,
        startInMillis,
        endInMillis,
        errorType,
        errorMessage,
      ),
    getLastRunEndState: () => mockGetLastRunEndState(),
    getDeviceId: () => mockGetDeviceId(),
    getCurrentSessionId: () => mockGetCurrentSessionId(),
  },
}));

const mockGenerateStackTrace = jest.fn();
jest.mock("../utils/ErrorUtil", () => ({
  ...jest.requireActual("../utils/ErrorUtil"),
  generateStackTrace: () => mockGenerateStackTrace(),
}));

const MOCK_STACKTRACE = "this is a fake stack trace";
const MOCK_VIEW = "View";

describe("User Identifier Tests", () => {
  const testUserId = "testUser";
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("setUserIdentifier", async () => {
    await setUserIdentifier(testUserId);
    expect(mockSetUserIdentifier).toHaveBeenCalledWith(testUserId);
  });

  test("clearUserIdentifier", async () => {
    await clearUserIdentifier();
    expect(mockClearUserIdentifier).toHaveBeenCalled();
  });
});

describe("User Data Tests", () => {
  const testUserId = "testUser";
  const testEmail = "test@test.com";

  test("setUsername", async () => {
    await setUsername(testUserId);
    expect(mockSetUsername).toHaveBeenCalledWith(testUserId);
  });

  test("clearUsername", async () => {
    await clearUsername();
    expect(mockClearUsername).toHaveBeenCalled();
  });

  test("setUserEmail", async () => {
    await setUserEmail(testEmail);
    expect(mockSetUserEmail).toHaveBeenCalledWith(testEmail);
  });

  test("clearUserEmail", async () => {
    await clearUserEmail();
    expect(mockClearUserEmail).toHaveBeenCalled();
  });
});

describe("Info/Warning/Error Logs", () => {
  beforeEach(() => {
    mockGenerateStackTrace.mockReturnValue(MOCK_STACKTRACE);
  });

  test("addBreadcrumb", async () => {
    await addBreadcrumb(MOCK_VIEW);
    expect(mockAddBreadcrumb).toHaveBeenCalledWith(MOCK_VIEW);
  });

  test("logScreen", async () => {
    await logScreen(MOCK_VIEW);
    expect(mockAddBreadcrumb).toHaveBeenCalledWith(
      `Opening screen [${MOCK_VIEW}]`,
    );
  });

  describe("logMessage", () => {
    const testMessage = "a message";
    const testProps = {foo: "bar"};

    it("should log an `info` message", async () => {
      await logMessage(testMessage, LogSeverity.INFO, testProps, false);
      expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        testMessage,
        LogSeverity.INFO,
        testProps,
        "",
      );

      // even forcing to include stacktrace it shouldn't pass to the native layer
      await logMessage(testMessage, LogSeverity.INFO, testProps, true);
      expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        testMessage,
        LogSeverity.INFO,
        testProps,
        "",
      );
    });

    it("should log an `warning` message", async () => {
      await logMessage(testMessage, LogSeverity.WARNING, testProps, false);
      expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        testMessage,
        LogSeverity.WARNING,
        testProps,
        "",
      );

      await logMessage(testMessage, LogSeverity.WARNING, testProps, true);
      expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        testMessage,
        LogSeverity.WARNING,
        testProps,
        MOCK_STACKTRACE,
      );
    });

    it("should log an `error` message", async () => {
      await logMessage(testMessage, LogSeverity.ERROR, testProps, false);
      expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        testMessage,
        LogSeverity.ERROR,
        testProps,
        "",
      );

      await logMessage(testMessage, LogSeverity.ERROR, testProps, true);
      expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        testMessage,
        LogSeverity.ERROR,
        testProps,
        MOCK_STACKTRACE,
      );
    });
  });

  test("logInfo", async () => {
    await logInfo("pushed an `info` log");
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "pushed an `info` log",
      LogSeverity.INFO,
      {},
      "",
    );
  });

  test("logWarning", async () => {
    await logWarning("pushed a `warning` log", false);
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "pushed a `warning` log",
      LogSeverity.WARNING,
      {},
      "",
    );

    await logWarning("pushed a `warning` log", true);
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "pushed a `warning` log",
      LogSeverity.WARNING,
      {},
      MOCK_STACKTRACE,
    );

    // by default it should add the stacktrace
    await logWarning("pushed a `warning` log");
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "pushed a `warning` log",
      LogSeverity.WARNING,
      {},
      MOCK_STACKTRACE,
    );
  });

  test("logError", async () => {
    await logError("pushed an `error` log", false);
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "pushed an `error` log",
      LogSeverity.ERROR,
      {},
      "",
    );

    await logError("pushed an `error` log", true);
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "pushed an `error` log",
      LogSeverity.ERROR,
      {},
      MOCK_STACKTRACE,
    );

    // by default it should add the stacktrace
    await logError("pushed an `error` log");
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "pushed an `error` log",
      LogSeverity.ERROR,
      {},
      MOCK_STACKTRACE,
    );
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

describe("Personas Tests", () => {
  const testPersona = "Persona";

  test("addUserPersona", async () => {
    await addUserPersona(testPersona);
    expect(mockAddUserPersona).toHaveBeenCalledWith(testPersona);
  });

  test("clearUserPersona", async () => {
    await clearUserPersona(testPersona);
    expect(mockClearUserPersona).toHaveBeenCalledWith(testPersona);
  });

  test("clearAllUserPersonas", async () => {
    await clearAllUserPersonas();
    expect(mockClearAllUserPersonas).toHaveBeenCalled();
  });
});

describe("Custom Views Tests", () => {
  test("startView", async () => {
    const promiseToResolve = startView(MOCK_VIEW);

    await promiseToResolve;
    expect(mockStartView).toHaveBeenCalledWith(MOCK_VIEW);
  });

  test("endView", async () => {
    jest.useFakeTimers();

    const promiseToResolve = endView(MOCK_VIEW);
    jest.runAllTimers();
    await promiseToResolve;
    expect(mockEndView).toHaveBeenCalledWith(MOCK_VIEW);
  });
});

describe("Session Properties Tests", () => {
  test("should call addSessionProperty with values", async () => {
    await addSessionProperty("foo", "bar", true);
    expect(mockAddSessionProperty).toHaveBeenCalledWith("foo", "bar", true);
  });

  test("removeSessionProperty", async () => {
    await removeSessionProperty("foo");
    expect(mockRemoveSessionProperty).toHaveBeenCalledWith("foo");
  });
});

describe("Payers Test", () => {
  test("setUserAsPayer", async () => {
    const promiseToResolve = setUserAsPayer();
    jest.runAllTimers();
    const result = await promiseToResolve;

    expect(mockSetUserAsPayer).toHaveBeenCalled();
    expect(result).toBe(false);
  });
  test("clearUserAsPayer", async () => {
    const promiseToResolve = clearUserAsPayer();

    jest.runAllTimers();
    const result = await promiseToResolve;

    expect(mockClearUserAsPayer).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});

describe("JavaScript bundle", () => {
  test("setJavaScriptBundlePath", async () => {
    await setJavaScriptBundlePath("path");
    expect(mockSetJavaScriptBundlePath).toHaveBeenCalledWith("path");
  });
});

describe("Record network call", () => {
  const url = "https://httpbin.org/v1/random/api";
  const method = "get";
  const nowdate = new Date();
  const st = nowdate.getTime();
  const et = nowdate.setUTCSeconds(30);
  const bytesIn = 111;
  const bytesOut = 222;
  const networkStatus = 200;

  it("record a Completed network request", async () => {
    await recordNetworkRequest(
      url,
      method,
      st,
      et,
      bytesIn,
      bytesOut,
      networkStatus,
    );

    expect(mockLogNetworkRequest).toHaveBeenCalledWith(
      url,
      method,
      st,
      et,
      bytesIn,
      bytesOut,
      networkStatus,
    );
  });

  it("record an Incomplete network request", async () => {
    await recordNetworkRequest(url, method, st, et);

    expect(mockLogNetworkRequest).toHaveBeenCalledWith(
      url,
      method,
      st,
      et,
      -1,
      -1,
      -1,
    );
  });

  it("record a network client error", async () => {
    await logNetworkClientError(
      url,
      method,
      st,
      et,
      "error-type",
      "error-message",
    );

    expect(mockLogNetworkClientError).toHaveBeenCalledWith(
      url,
      method,
      st,
      et,
      "error-type",
      "error-message",
    );
  });
});

describe("Test Device Stuffs", () => {
  test("device Id", async () => {
    await getDeviceId();
    expect(mockGetDeviceId).toHaveBeenCalled();
  });

  test("session Id", async () => {
    await getCurrentSessionId();
    expect(mockGetCurrentSessionId).toHaveBeenCalled();
  });
});

describe("Last Session Info", () => {
  test("last run status", async () => {
    await getLastRunEndState();
    expect(mockGetLastRunEndState).toHaveBeenCalled();
  });
});
