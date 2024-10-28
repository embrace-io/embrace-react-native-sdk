import {handleGlobalError} from "../utils/ErrorUtil";
import {initialize} from "../index";

const testValue = "Value";

const mockSetReactNativeVersion = jest.fn();
const mockSetJavaScriptPatchNumber = jest.fn();
const mockIsStarted = jest.fn();
const mockStart = jest.fn();
const mockSetReactNativeSDKVersion = jest.fn();
const mockLogMessageWithSeverityAndProperties = jest.fn();

const ReactNativeMock = jest.requireMock("react-native");

jest.mock("react-native", () => ({
  NativeModules: {
    EmbraceManager: {
      setReactNativeVersion: (version: string) =>
        mockSetReactNativeVersion(version),
      setJavaScriptPatchNumber: (patch: string) =>
        mockSetJavaScriptPatchNumber(patch),
      setReactNativeSDKVersion: (version: string) =>
        mockSetReactNativeSDKVersion(version),
      logMessageWithSeverityAndProperties: (
        message: string,
        severity: string,
        properties: object,
        stacktrace: string,
      ) =>
        mockLogMessageWithSeverityAndProperties(
          message,
          severity,
          properties,
          stacktrace,
        ),
      isStarted: () => mockIsStarted(),
      startNativeEmbraceSDK: (appId?: string) => mockStart(appId),
    },
  },
  Platform: {OS: "android"},
}));

interface ITracking {
  onUnhandled: (_: any, error: Error) => {};
}

jest.mock("promise/setimmediate/rejection-tracking", () => ({
  enable: (c: ITracking) => {
    const {onUnhandled} = c;
    onUnhandled("e", new Error());
  },
}));

describe("Android: initialize", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockStart.mockReturnValue(true);
    ReactNativeMock.Platform.OS = "android";
  });

  test("sdk already started", async () => {
    mockIsStarted.mockReturnValue(true);
    const result = await initialize({patch: testValue});

    expect(result).toBe(true);
    expect(mockSetReactNativeVersion).toHaveBeenCalledWith("0.75.4");
    expect(mockSetJavaScriptPatchNumber).toHaveBeenCalledWith(testValue);
    expect(mockSetReactNativeSDKVersion).toHaveBeenCalledWith(
      expect.any(String),
    );
    expect(mockStart).not.toHaveBeenCalled();
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalled();
    expect(mockLogMessageWithSeverityAndProperties.mock.calls[0][0]).toBe(
      "Unhandled promise rejection: ",
    );
  });

  test("sdk not already started", async () => {
    mockIsStarted.mockReturnValue(false);
    const result = await initialize({patch: testValue});

    expect(result).toBe(true);
    expect(mockStart).toHaveBeenCalledWith({});
    expect(mockSetReactNativeVersion).toHaveBeenCalledWith("0.75.4");
    expect(mockSetJavaScriptPatchNumber).toHaveBeenCalledWith(testValue);
    expect(mockSetReactNativeSDKVersion).toHaveBeenCalledWith(
      expect.any(String),
    );
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalled();
    expect(mockLogMessageWithSeverityAndProperties.mock.calls[0][0]).toBe(
      "Unhandled promise rejection: ",
    );
  });

  test("sdk not already started on iOS, missing app id", async () => {
    ReactNativeMock.Platform.OS = "ios";
    mockIsStarted.mockReturnValue(false);
    const result = await initialize({patch: testValue});
    expect(result).toBe(false);
    expect(mockStart).not.toHaveBeenCalled();
    expect(mockSetReactNativeVersion).not.toHaveBeenCalled();
    expect(mockSetJavaScriptPatchNumber).not.toHaveBeenCalled();
    expect(mockSetReactNativeSDKVersion).not.toHaveBeenCalled();
    expect(mockLogMessageWithSeverityAndProperties).not.toHaveBeenCalled();
  });

  test("sdk not already started on iOS, app id supplied", async () => {
    ReactNativeMock.Platform.OS = "ios";
    mockIsStarted.mockReturnValue(false);
    const result = await initialize({
      patch: testValue,
      sdkConfig: {ios: {appId: "abc12"}},
    });
    expect(result).toBe(true);
    expect(mockStart).toHaveBeenCalledWith({appId: "abc12"});
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalled();
    expect(mockLogMessageWithSeverityAndProperties.mock.calls[0][0]).toBe(
      "Unhandled promise rejection: ",
    );
  });

  test("applying previousHandler", async () => {
    const previousHandler = jest.fn();
    ErrorUtils.getGlobalHandler = previousHandler;
    const result = await initialize({patch: testValue});
    expect(result).toBe(true);

    const handleError = () => {};
    const generatedGlobalErrorFunc = handleGlobalError(
      previousHandler,
      handleError,
    );
    generatedGlobalErrorFunc(Error("Test"));
    expect(previousHandler).toHaveBeenCalled();
  });
});

describe("iOS: initialize", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockStart.mockReturnValue(true);
    ReactNativeMock.Platform.OS = "ios";
  });

  it("should not call regular `startNativeEmbraceSDK` if `startCustomExport` handler receives a proper callback", async () => {
    const mockstartCustomExport = jest.fn(() => Promise.resolve(true));
    const isStarted = await initialize({
      sdkConfig: {
        ios: {appId: "abc12"},
        startCustomExport: mockstartCustomExport,
      },
    });

    expect(mockstartCustomExport).toHaveBeenCalledTimes(1);
    expect(mockstartCustomExport).toHaveBeenCalledWith({appId: "abc12"});
    expect(mockStart).not.toHaveBeenCalled();
    expect(isStarted).toBe(true);
  });
});
