import {MethodType} from "../interfaces/HTTP";
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

jest.mock("react-native", () => ({
  NativeModules: {
    EmbraceManager: {
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
        severity: string,
        properties: Record<string, any>,
        stacktrace: string,
      ) =>
        mockLogMessageWithSeverityAndProperties(
          message,
          severity,
          properties,
          stacktrace,
        ),
      logHandledError: (message: string, properties?: Record<string, any>) =>
        mockLogHandledError(message, properties),
      addUserPersona: (persona: string) => mockAddUserPersona(persona),
      clearUserPersona: (persona: string) => mockClearUserPersona(persona),
      clearAllUserPersonas: () => mockClearAllUserPersonas(),
      startView: (view: string) => mockStartView(view),
      endView: (view: string) => mockEndView(view),
      addSessionProperty: (key: string, value: string, permanent: boolean) =>
        mockAddSessionProperty(key, value, permanent),
      removeSessionProperty: (key: string) => mockRemoveSessionProperty(key),
      setUserAsPayer: () => mockSetUserAsPayer(),
      clearUserAsPayer: () => mockClearUserAsPayer(),
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
        error: string,
      ) =>
        mockLogNetworkRequest(
          url,
          httpMethod,
          startInMillis,
          endInMillis,
          bytesSent,
          bytesReceived,
          statusCode,
          error,
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
  },
}));

const mockSt = "this is a fake stack trace";
const mockGenerateStackTrace = jest.fn();
jest.mock("../utils/ErrorUtil", () => ({
  ...jest.requireActual("../utils/ErrorUtil"),
  generateStackTrace: () => mockGenerateStackTrace(),
}));

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

describe("Logs Test", () => {
  const WARNING = "warning";
  const INFO = "info";
  const ERROR = "error";
  const testView = "View";

  beforeEach(() => {
    mockGenerateStackTrace.mockReturnValue(mockSt);
  });

  test("addBreadcrumb", async () => {
    await addBreadcrumb(testView);
    expect(mockAddBreadcrumb).toHaveBeenCalledWith(testView);
  });

  test("logScreen", async () => {
    await logScreen(testView);
    expect(mockAddBreadcrumb).toHaveBeenCalledWith(
      `Opening screen [${testView}]`,
    );
  });

  describe("logMessage", () => {
    const testMessage = "message";
    const testProps = {foo: "bar"};

    test.each`
      message        | severity   | properties   | stackTrace
      ${testMessage} | ${INFO}    | ${testProps} | ${""}
      ${testMessage} | ${INFO}    | ${testProps} | ${""}
      ${testMessage} | ${WARNING} | ${testProps} | ${mockSt}
      ${testMessage} | ${WARNING} | ${testProps} | ${mockSt}
      ${testMessage} | ${ERROR}   | ${testProps} | ${mockSt}
      ${testMessage} | ${ERROR}   | ${testProps} | ${mockSt}
    `(
      "should run $severity log",
      async ({message, severity, properties, stackTrace}) => {
        await logMessage(message, severity, properties);
        expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
          message,
          severity,
          properties,
          stackTrace,
        );
      },
    );
  });

  test("logInfo", async () => {
    await logInfo("test message");
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      `test message`,
      INFO,
      undefined,
      "",
    );
  });

  test("logWarning", async () => {
    await logWarning("test message");
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      `test message`,
      WARNING,
      undefined,
      mockSt,
    );
  });

  test("logError", async () => {
    await logError("test message");
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      `test message`,
      ERROR,
      undefined,
      mockSt,
    );
  });
});

describe("Log handled Error Tests", () => {
  const testError = new Error();
  const testProps = {foo: "bar"};

  test.each`
    message           | properties   | out
    ${"not an error"} | ${undefined} | ${{}}
    ${testError}      | ${undefined} | ${{message: testError.message, stack: testError.stack}}
    ${testError}      | ${testProps} | ${{message: testError.message, stack: testError.stack, properties: testProps}}
  `("logHandledError", async ({message, out, properties}) => {
    await logHandledError(message, properties);
    // TODO uncomment the expect once the method is imeplemented
    // if (message instanceof Error) {
    //   expect(mockLogHandledError).toHaveBeenCalledWith(out.message, out.stack, out.properties);
    // } else {
    //   expect(mockLogHandledError).not.toHaveBeenCalled();
    // }
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
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            startView: () => {
              mock();
              return false;
            },
          },
        },
      }),
      {virtual: true},
    );
    const {startView} = require("../index");
    const promiseToResolve = startView(testView);

    jest.runAllTimers();
    const result = await promiseToResolve;
    expect(mock).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  test("endView", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            endView: () => {
              mock();
              return false;
            },
          },
        },
      }),
      {virtual: true},
    );
    const {endView} = require("../index");
    const promiseToResolve = endView(testView);
    jest.runAllTimers();
    const result = await promiseToResolve;
    expect(mock).toHaveBeenCalled();
    expect(result).toBe(false);
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
    await setUserAsPayer();
    // TODO uncomment the expect once the method is implemented
    // expect(mockSetUserAsPayer).toHaveBeenCalled();
  });
  test("clearUserAsPayer", async () => {
    await clearUserAsPayer();
    // TODO uncomment the expect once the method is implemented
    // expect(mockClearUserAsPayer).toHaveBeenCalled();
  });
});

describe("JavaScript bundle", () => {
  test("setJavaScriptBundlePath", async () => {
    await setJavaScriptBundlePath("path");
    expect(mockSetJavaScriptBundlePath).toHaveBeenCalledWith("path");
  });
});

describe("Record network call", () => {
  const url = "https://httpbin.org/get";
  const method = "get";
  const nowdate = new Date();
  const st = nowdate.getTime();
  const et = nowdate.setUTCSeconds(30);
  const bytesIn = Number(111);
  const bytesOut = Number(222);
  const networkStatus = Number(200);
  const error = "error";

  test("record completed network request", async () => {
    await recordNetworkRequest(
      url,
      method,
      st,
      et,
      bytesIn,
      bytesOut,
      networkStatus,
    );

    // TODO uncomment the expect once the method is implemented
    // expect(mockLogNetworkRequest).toHaveBeenCalledWith(
    //   url,
    //   method,
    //   st,
    //   et,
    //   bytesIn,
    //   bytesOut,
    //   networkStatus,
    //   undefined,
    // );
  });

  test("record incomplete network request", async () => {
    await recordNetworkRequest(
      url,
      method,
      st,
      et,
      undefined,
      undefined,
      undefined,
      error,
    );

    // TODO uncomment the expect once the method is implemented
    // expect(mockLogNetworkRequest).toHaveBeenCalledWith(
    //   url,
    //   method,
    //   st,
    //   et,
    //   -1,
    //   -1,
    //   -1,
    //   error,
    // );
  });

  test("record network client error", async () => {
    await logNetworkClientError(
      url,
      method,
      st,
      et,
      "error-type",
      "error-message",
    );

    // TODO uncomment the expect once the method is implemented
    // expect(mockLogNetworkClientError).toHaveBeenCalledWith(
    //   url,
    //   method,
    //   st,
    //   et,
    //   "error-type",
    //   "error-message",
    // );
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
