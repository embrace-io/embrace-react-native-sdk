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
      logMessageWithSeverityAndProperties:
        mockLogMessageWithSeverityAndProperties,
      isStarted: () => mockIsStarted(),
      startNativeEmbraceSDK: (appID?: string) => mockStart(appID),
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

describe("initialize", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockStart.mockReturnValue(true);
    ReactNativeMock.Platform.OS = "android";
  });

  test("sdk already started", async () => {
    mockIsStarted.mockReturnValue(true);
    const result = await initialize({patch: testValue});

    expect(result).toBe(true);
    expect(mockSetReactNativeVersion).toHaveBeenCalledWith("0.56.1");
    expect(mockSetJavaScriptPatchNumber).toHaveBeenCalledWith(testValue);
    expect(mockSetReactNativeSDKVersion).toHaveBeenCalledWith("4.2.0");
    expect(mockStart).not.toHaveBeenCalled();
  });

  test("sdk not already started", async () => {
    mockIsStarted.mockReturnValue(false);
    const result = await initialize({patch: testValue});

    expect(result).toBe(true);
    expect(mockStart).toHaveBeenCalledWith(undefined);
    expect(mockSetReactNativeVersion).toHaveBeenCalledWith("0.56.1");
    expect(mockSetJavaScriptPatchNumber).toHaveBeenCalledWith(testValue);
    expect(mockSetReactNativeSDKVersion).toHaveBeenCalledWith("4.2.0");
  });

  test("sdk not already started on iOS, missing app id", async () => {
    ReactNativeMock.Platform.OS = "ios";
    mockIsStarted.mockReturnValue(false);
    const result = await initialize({patch: testValue});
    expect(result).toBe(false);
    expect(mockStart).not.toHaveBeenCalled();
  });

  test("sdk not already started on iOS, app id supplied", async () => {
    ReactNativeMock.Platform.OS = "ios";
    mockIsStarted.mockReturnValue(false);
    const result = await initialize({patch: testValue, iosAppID: "abc12"});
    expect(result).toBe(true);
    expect(mockStart).toHaveBeenCalledWith("abc12");
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
