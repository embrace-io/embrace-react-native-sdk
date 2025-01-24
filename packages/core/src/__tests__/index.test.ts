import {waitFor} from "@testing-library/react-native";

import {oltpGetStart} from "../utils/otlp";
import {trackUnhandledRejection} from "../utils/error";
import {AndroidConfig, initialize, IOSConfig} from "../index";
import {handleError, handleGlobalError} from "../api/error";
import {ComponentError} from "../api/component";

const rejectionTracking = require("promise/setimmediate/rejection-tracking");

const INIT_SDK_CONFIG = {
  patch: "v1",
  sdkConfig: {ios: {appId: "abc12"}},
};

const mockSetReactNativeVersion = jest.fn();
const mockSetJavaScriptPatchNumber = jest.fn();
const mockIsStarted = jest.fn();
const mockStart = jest.fn().mockResolvedValue(true);
const mockSetReactNativeSDKVersion = jest.fn();
const mockLogMessageWithSeverityAndProperties = jest.fn();
const mockLogHandledError = jest.fn();
const mockLogUnhandledJSException = jest.fn().mockResolvedValue(true);
const mockSetJavaScriptBundlePath = jest.fn();
const mockGetDefaultJavaScriptBundlePath = jest
  .fn()
  .mockResolvedValue("some/path");
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
      errorType: string,
      stacktrace: string,
    ) => mockLogUnhandledJSException(name, message, errorType, stacktrace),
    isStarted: () => mockIsStarted(),
    startNativeEmbraceSDK: (sdkConfig: IOSConfig | AndroidConfig) =>
      mockStart(sdkConfig),
    logHandledError: (
      message: string,
      componentStack: string,
      params: object,
    ) => {
      mockLogHandledError(message, componentStack, params);
      return Promise.resolve(true);
    },
    getDefaultJavaScriptBundlePath: () => mockGetDefaultJavaScriptBundlePath(),
    setJavaScriptBundlePath: (path: string) =>
      mockSetJavaScriptBundlePath(path),
  },
}));

jest.mock("react-native", () => ({
  Platform: {OS: "android"},
}));
const mockReactNative = jest.requireMock("react-native");

jest.mock("../utils/otlp", () => ({
  oltpGetStart: jest.fn(),
}));

describe("SDK initialization", () => {
  let mockConsoleWarn: jest.SpyInstance;
  let mockConsoleInfo: jest.SpyInstance;

  const mockIsDev = (isDev: boolean) =>
    // @ts-expect-error __DEV__ isn't expected on `global`'s type, but it does exist here since jest adds it to
    // simulate a React Native environment
    jest.replaceProperty(global, "__DEV__", isDev);

  beforeEach(() => {
    mockConsoleWarn = jest.spyOn(console, "warn").mockImplementation(m => m);
    mockConsoleInfo = jest.spyOn(console, "log").mockImplementation(m => m);
    mockIsDev(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // @ts-expect-error HermesInternal isn't part of `global`'s type
    global.HermesInternal = undefined;
  });

  describe("Both platforms", () => {
    test("`initialize` applies global error handler", async () => {
      const mockPreviousHandler = jest.fn();
      // setting error handler that should be used in the global error handler
      ErrorUtils.setGlobalHandler(mockPreviousHandler);

      const isStarted = await initialize(INIT_SDK_CONFIG);
      await waitFor(() => {
        expect(isStarted).toBe(true);
      });

      const updatedHandler = ErrorUtils.getGlobalHandler();
      const err = Error("My custom error message");

      updatedHandler(err, true);

      await waitFor(() => {
        expect(mockPreviousHandler).toHaveBeenCalledWith(err, true);
        expect(mockLogUnhandledJSException).toHaveBeenCalledWith(
          "Error",
          "My custom error message",
          err.constructor.name,
          err.stack,
        );
      });
    });

    test("`ErrorUtils.getGlobalHandler` handles the reject of `EmbraceManagerModule.logUnhandledJSException` method", async () => {
      const mockPreviousHandler = jest.fn();
      ErrorUtils.setGlobalHandler(mockPreviousHandler);
      mockLogUnhandledJSException.mockRejectedValueOnce("Some rejected value");

      const isStarted = await initialize(INIT_SDK_CONFIG);

      await waitFor(() => {
        expect(isStarted).toBe(true);
      });

      const updatedHandler = ErrorUtils.getGlobalHandler();
      const err = Error("Test");

      updatedHandler(err, true);

      await waitFor(() => {
        expect(mockPreviousHandler).toHaveBeenCalledWith(err, true);
        expect(mockLogUnhandledJSException).toHaveBeenCalled();
        expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          "[Embrace] Failed to log exception",
        );
      });
    });

    test("setting global handler", async () => {
      const mockSetGlobalHandler = jest.fn();
      ErrorUtils.setGlobalHandler = mockSetGlobalHandler;

      const isStarted = await initialize(INIT_SDK_CONFIG);
      await waitFor(() => {
        expect(isStarted).toBe(true);
        expect(mockSetGlobalHandler).toHaveBeenCalled();
      });
    });

    test("applying previousHandler and throwing a component error", async () => {
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

    test("`initialize` should set the listener for unhandled promise rejections when the flag is set", async () => {
      const mockRejectionTrackingEnable = jest.spyOn(
        rejectionTracking,
        "enable",
      );

      const isStarted = await initialize({
        patch: "v1",
        sdkConfig: {ios: {appId: "abc12"}, trackUnhandledRejections: true},
      });
      await waitFor(() => {
        expect(isStarted).toBe(true);
        expect(mockRejectionTrackingEnable).toHaveBeenCalledWith({
          allRejections: true,
          onUnhandled: trackUnhandledRejection,
          onHandled: expect.any(Function),
        });
      });
    });

    test("`initialize` should not set the listener for unhandled promise rejections when the flag is not set", async () => {
      const mockRejectionTrackingEnable = jest.spyOn(
        rejectionTracking,
        "enable",
      );

      const isStarted = await initialize(INIT_SDK_CONFIG);
      await waitFor(() => {
        expect(isStarted).toBe(true);
        expect(mockRejectionTrackingEnable).not.toHaveBeenCalled();
      });
    });

    test("should use Hermes unhandled promise rejection tracking when available", async () => {
      const hermesInternal = {
        hasPromise: () => true,
        enablePromiseRejectionTracker: jest.fn(),
      };

      // @ts-expect-error HermesInternal isn't part of `global`'s type
      global.HermesInternal = hermesInternal;

      const isStarted = await initialize({
        patch: "v1",
        sdkConfig: {ios: {appId: "abc12"}, trackUnhandledRejections: true},
      });
      await waitFor(() => {
        expect(isStarted).toBe(true);
        expect(
          hermesInternal.enablePromiseRejectionTracker,
        ).toHaveBeenCalledWith({
          allRejections: true,
          onUnhandled: trackUnhandledRejection,
          onHandled: expect.any(Function),
        });
      });
    });
  });

  describe("Android: initialize", () => {
    test("SDK should start (in Js side)", async () => {
      const isStarted = await initialize(INIT_SDK_CONFIG);

      await waitFor(() => {
        expect(isStarted).toBe(true);

        // because it's android it should not pass any config to the native layer
        expect(mockStart).toHaveBeenCalledWith({});

        // should only be called for iOS
        expect(mockGetDefaultJavaScriptBundlePath).not.toHaveBeenCalled();

        expect(mockSetReactNativeVersion).toHaveBeenCalledWith("0.76.6");
        expect(mockSetJavaScriptPatchNumber).toHaveBeenCalledWith("v1");
        expect(mockSetReactNativeSDKVersion).toHaveBeenCalledWith(
          expect.any(String),
        );
        expect(mockConsoleInfo).toHaveBeenCalledTimes(1);
        expect(mockConsoleInfo).toHaveBeenCalledWith(
          "[Embrace] native SDK was started",
        );
      });
    });

    test("SDK already started (from Native side)", async () => {
      mockIsStarted.mockReturnValueOnce(true);
      const isStarted = await initialize(INIT_SDK_CONFIG);

      await waitFor(() => {
        expect(isStarted).toBe(true);

        expect(mockSetReactNativeVersion).toHaveBeenCalledWith("0.76.6");
        expect(mockSetJavaScriptPatchNumber).toHaveBeenCalledWith("v1");
        expect(mockSetReactNativeSDKVersion).toHaveBeenCalledWith(
          expect.any(String),
        );
        expect(mockStart).not.toHaveBeenCalled();
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      });
    });
  });

  describe("iOS: initialize", () => {
    beforeAll(() => {
      mockReactNative.Platform.OS = "ios";
    });

    it("should not call regular `startNativeEmbraceSDK` if `exporters` are available", async () => {
      const mockRNEmbraceOTLPInit = jest.fn().mockResolvedValue(true);
      const mockOltpGetStart = jest
        .mocked(oltpGetStart)
        .mockImplementation(() => mockRNEmbraceOTLPInit);

      const isStarted = await initialize({
        sdkConfig: {
          ios: {appId: "abc12"},
          exporters: {
            logExporter: {endpoint: "http://localhost:8081/mock/log"},
          },
        },
      });

      await waitFor(() => {
        expect(mockOltpGetStart).toHaveBeenCalledTimes(1);
        expect(mockStart).not.toHaveBeenCalled();
        expect(isStarted).toBe(true);
      });
    });

    test("SDK should not start because `appId` is missing and there is not configured custom exporters", async () => {
      const isStarted = await initialize({patch: "v1", sdkConfig: {ios: {}}});

      await waitFor(() => {
        expect(isStarted).toBe(false);
        expect(mockStart).not.toHaveBeenCalled();
        expect(mockSetReactNativeVersion).not.toHaveBeenCalled();
        expect(mockSetJavaScriptPatchNumber).not.toHaveBeenCalled();
        expect(mockSetReactNativeSDKVersion).not.toHaveBeenCalled();
        expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          "[Embrace] 'sdkConfig.ios.appId' is required to initialize Embrace's native SDK if there is no configuration for custom exporters. Please check the Embrace integration docs at https://embrace.io/docs/react-native/integration/",
        );
      });
    });

    test("SDK should start (in Js side)", async () => {
      const isStarted = await initialize(INIT_SDK_CONFIG);

      await waitFor(() => {
        expect(isStarted).toBe(true);
        expect(mockStart).toHaveBeenCalledWith({appId: "abc12"});
        expect(mockConsoleInfo).toHaveBeenCalledTimes(1);
        expect(mockConsoleInfo).toHaveBeenCalledWith(
          "[Embrace] native SDK was started",
        );
      });
    });

    test("SDK start call rejects in the Native side", async () => {
      mockStart.mockRejectedValueOnce(
        "something went wrong in the native side (fake error message)",
      );

      const isStarted = await initialize(INIT_SDK_CONFIG);

      await waitFor(() => {
        expect(isStarted).toBe(false);
        expect(mockConsoleWarn).toHaveBeenCalledTimes(2);
        expect(mockConsoleWarn.mock.calls[0][0]).toBe(
          "[Embrace] something went wrong in the native side (fake error message)",
        );
        expect(mockConsoleWarn.mock.calls[1][0]).toBe(
          "[Embrace] we could not initialize Embrace's native SDK, please check the Embrace integration docs at https://embrace.io/docs/react-native/integration/",
        );
      });
    });

    test("do not look for the default bundle path on dev builds", async () => {
      mockIsDev(true);
      const isStarted = await initialize(INIT_SDK_CONFIG);
      await waitFor(() => {
        expect(isStarted).toBe(true);
        expect(mockGetDefaultJavaScriptBundlePath).not.toHaveBeenCalled();
      });
    });

    test("set the bundle path when the default one is found", async () => {
      mockGetDefaultJavaScriptBundlePath.mockResolvedValue("found");
      const isStarted = await initialize(INIT_SDK_CONFIG);
      await waitFor(() => {
        expect(isStarted).toBe(true);
        expect(mockSetJavaScriptBundlePath).toHaveBeenCalledWith("found");
        expect(mockConsoleWarn).not.toHaveBeenCalled();
      });
    });

    test("handle when the default bundle path is empty", async () => {
      mockGetDefaultJavaScriptBundlePath.mockResolvedValue("");
      const isStarted = await initialize(INIT_SDK_CONFIG);
      await waitFor(() => {
        expect(isStarted).toBe(true);
        expect(mockSetJavaScriptBundlePath).not.toHaveBeenCalled();
        expect(mockConsoleWarn).not.toHaveBeenCalled();
      });
    });

    test("handle when the default bundle path can't be found", async () => {
      mockGetDefaultJavaScriptBundlePath.mockRejectedValue("failed");
      const isStarted = await initialize(INIT_SDK_CONFIG);
      await waitFor(() => {
        expect(isStarted).toBe(true);
        expect(mockSetJavaScriptBundlePath).not.toHaveBeenCalled();
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          "[Embrace] we were unable to set the JSBundle path automatically. Please configure this manually to enable crash symbolication. For more information see https://embrace.io/docs/react-native/integration/upload-symbol-files/#pointing-the-embrace-sdk-to-the-javascript-bundle.",
        );
      });
    });
  });
});
