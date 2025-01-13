import {waitFor} from "@testing-library/react-native";

import {initialize} from "../index";
import {handleGlobalError} from "../api/error";
import {ComponentError, logIfComponentError} from "../api/component";

const testValue = "Value";

const mockSetReactNativeVersion = jest.fn();
const mockSetJavaScriptPatchNumber = jest.fn();
const mockIsStarted = jest.fn();
const mockStart = jest.fn();
const mockSetReactNativeSDKVersion = jest.fn();
const mockLogMessageWithSeverityAndProperties = jest.fn();
const mockLogHandledError = jest.fn();
const mockLogUnhandledJSException = jest.fn();

const ReactNativeMock = jest.requireMock("react-native");

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
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
    logUnhandledJSException: (
      name: string,
      message: string,
      errorType: string,
      stacktrace: string,
    ) => mockLogUnhandledJSException(name, message, errorType, stacktrace),
    isStarted: () => mockIsStarted(),
    startNativeEmbraceSDK: (appId?: string) => mockStart(appId),
    logHandledError: (
      message: string,
      componentStack: string,
      params: object,
    ) => {
      mockLogHandledError(message, componentStack, params);
      return Promise.resolve(true);
    },
  },
}));

jest.mock("react-native", () => ({
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

  test("applies global error handler", async () => {
    const previousHandler = jest.fn();
    ErrorUtils.setGlobalHandler(previousHandler);
    mockLogUnhandledJSException.mockReturnValue(Promise.resolve(true));

    const result = await initialize({patch: testValue});
    expect(result).toBe(true);
    const updatedHandler = ErrorUtils.getGlobalHandler();
    const err = Error("Test");

    updatedHandler(err, true);

    await waitFor(() => {
      expect(previousHandler).toHaveBeenCalledWith(err, true);
      expect(mockLogUnhandledJSException).toHaveBeenCalled();
    });
  });

  test("global error handler handles logUnhandledJSException rejecting", async () => {
    const previousHandler = jest.fn();
    ErrorUtils.setGlobalHandler(previousHandler);
    mockLogUnhandledJSException.mockRejectedValue("failed");

    const result = await initialize({patch: testValue});
    expect(result).toBe(true);
    const updatedHandler = ErrorUtils.getGlobalHandler();
    const err = Error("Test");

    updatedHandler(err, true);

    await waitFor(() => {
      expect(previousHandler).toHaveBeenCalledWith(err, true);
      expect(mockLogUnhandledJSException).toHaveBeenCalled();
    });
  });

  test("applying previousHandler and throwing a component error", async () => {
    const previousHandler = jest.fn();
    ErrorUtils.getGlobalHandler = previousHandler;

    const result = await initialize({patch: testValue});
    expect(result).toBe(true);

    const generatedGlobalErrorFunc = handleGlobalError(
      previousHandler,
      logIfComponentError,
    );

    const componentError = new Error("Test") as ComponentError;
    componentError.componentStack = "in SomeScreen\n in SomeOtherScreen";

    generatedGlobalErrorFunc(componentError);
    expect(previousHandler).toHaveBeenCalled();
    waitFor(() => {
      expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        "Test",
        "error",
        {},
        "in SomeScreen\nin SomeOtherScreen",
      );
    });
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

  test("sdk not already started, missing app id", async () => {
    mockIsStarted.mockReturnValue(false);
    const result = await initialize({patch: testValue});
    expect(result).toBe(false);
    expect(mockStart).not.toHaveBeenCalled();
    expect(mockSetReactNativeVersion).not.toHaveBeenCalled();
    expect(mockSetJavaScriptPatchNumber).not.toHaveBeenCalled();
    expect(mockSetReactNativeSDKVersion).not.toHaveBeenCalled();
    expect(mockLogMessageWithSeverityAndProperties).not.toHaveBeenCalled();
  });

  test("sdk not already started, app id supplied", async () => {
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

  test("sdk start call is rejected", async () => {
    mockStart.mockRejectedValue("failed");
    mockIsStarted.mockReturnValue(false);
    const result = await initialize({
      patch: testValue,
      sdkConfig: {ios: {appId: "abc12"}},
    });
    expect(result).toBe(false);
  });
});
