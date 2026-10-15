import {version as REACT_NATIVE_VERSION} from "react-native/package.json";
import {waitFor} from "@testing-library/react-native";

import {version as SDK_VERSION} from "../../package.json";

const mockInitializeReactNativeSDK = jest.fn();
const mockLogUnhandledJSException = jest.fn().mockResolvedValue(true);
const mockEnableRejectionTracking = jest.fn();

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    initializeReactNativeSDK: mockInitializeReactNativeSDK,
    logUnhandledJSException: mockLogUnhandledJSException,
  },
}));

jest.mock("promise/setimmediate/rejection-tracking", () => ({
  enable: mockEnableRejectionTracking,
}));

const mockIsDev = (isDev: boolean) =>
  // @ts-expect-error __DEV__ isn't expected on `global`'s type, but it does exist here since jest adds it to
  // simulate a React Native environment
  jest.replaceProperty(global, "__DEV__", isDev);

describe("SDK initialization", () => {
  let core: typeof import("../initialize");
  let originalGlobalHandler: ReturnType<typeof ErrorUtils.getGlobalHandler>;
  let setGlobalHandler: jest.SpyInstance;

  beforeEach(() => {
    mockIsDev(false);
    mockInitializeReactNativeSDK.mockReturnValue(true);

    originalGlobalHandler = ErrorUtils.getGlobalHandler();
    setGlobalHandler = jest.spyOn(ErrorUtils, "setGlobalHandler");

    jest.resetModules();
    core = require("../initialize");
  });

  afterEach(() => {
    jest.restoreAllMocks();
    ErrorUtils.setGlobalHandler(originalGlobalHandler);
  });

  test("is not initialized before `initialize` is called", () => {
    expect(core.isInitialized()).toBe(false);
    expect(mockInitializeReactNativeSDK).not.toHaveBeenCalled();
  });

  describe("on success", () => {
    test("sends the JS metadata to native in a single call", () => {
      expect(core.initialize({patch: "v1"})).toBe(true);

      expect(mockInitializeReactNativeSDK).toHaveBeenCalledTimes(1);
      expect(mockInitializeReactNativeSDK).toHaveBeenCalledWith({
        reactNativeVersion: REACT_NATIVE_VERSION,
        sdkVersion: SDK_VERSION,
        javaScriptPatchNumber: "v1",
        resolveDefaultBundlePath: true,
      });
      expect(core.isInitialized()).toBe(true);
    });

    test("omits the patch and skips the default bundle path in dev", () => {
      mockIsDev(true);

      expect(core.initialize()).toBe(true);

      expect(mockInitializeReactNativeSDK).toHaveBeenCalledWith({
        reactNativeVersion: REACT_NATIVE_VERSION,
        sdkVersion: SDK_VERSION,
        resolveDefaultBundlePath: false,
      });
    });

    test("omits an empty patch", () => {
      expect(core.initialize({patch: ""})).toBe(true);

      expect(mockInitializeReactNativeSDK).toHaveBeenCalledWith({
        reactNativeVersion: REACT_NATIVE_VERSION,
        sdkVersion: SDK_VERSION,
        resolveDefaultBundlePath: true,
      });
    });

    test("ignores a second call and installs everything once", () => {
      expect(core.initialize()).toBe(true);
      expect(core.initialize({patch: "v2"})).toBe(true);

      expect(mockInitializeReactNativeSDK).toHaveBeenCalledTimes(1);
      expect(setGlobalHandler).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        "[Embrace] `initialize` has already been called, ignoring this call.",
      );
    });

    test("continues without a global handler when ErrorUtils is not defined", () => {
      // @ts-expect-error ErrorUtils is declared as always defined
      jest.replaceProperty(global, "ErrorUtils", undefined);

      expect(core.initialize()).toBe(true);

      expect(console.warn).toHaveBeenCalledWith(
        "[Embrace] ErrorUtils is not defined, not capturing unhandled exceptions.",
      );
      expect(core.isInitialized()).toBe(true);
    });
  });

  test("logs an error, returns false and installs nothing when the native call throws", () => {
    mockInitializeReactNativeSDK.mockImplementation(() => {
      throw new Error("native call failed");
    });

    expect(core.initialize({trackUnhandledRejections: true})).toBe(false);

    expect(console.error).toHaveBeenCalledWith(
      "[Embrace] Failed to initialize the SDK: Error: native call failed",
    );
    expect(setGlobalHandler).not.toHaveBeenCalled();
    expect(mockEnableRejectionTracking).not.toHaveBeenCalled();
    expect(core.isInitialized()).toBe(false);
  });

  describe("when the native SDK is not started", () => {
    beforeEach(() => {
      mockInitializeReactNativeSDK.mockReturnValue(false);
    });

    test("throws in dev", () => {
      mockIsDev(true);

      expect(() => core.initialize()).toThrow(
        "The Embrace native SDK has not been started",
      );
    });

    test("logs an error, returns false and installs nothing in release", () => {
      expect(core.initialize({trackUnhandledRejections: true})).toBe(false);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("The Embrace native SDK has not been started"),
      );
      expect(setGlobalHandler).not.toHaveBeenCalled();
      expect(mockEnableRejectionTracking).not.toHaveBeenCalled();
      expect(core.isInitialized()).toBe(false);
    });

    test("tries again on the next call", () => {
      expect(core.initialize()).toBe(false);

      mockInitializeReactNativeSDK.mockReturnValue(true);

      expect(core.initialize()).toBe(true);
    });
  });

  describe("global error handler", () => {
    test("logs an unhandled exception and forwards it to the previous handler", async () => {
      const mockPreviousHandler = jest.fn();
      ErrorUtils.setGlobalHandler(mockPreviousHandler);

      core.initialize();

      const err = Error("My custom error message");
      ErrorUtils.getGlobalHandler()(err, true);

      await waitFor(() => {
        expect(mockPreviousHandler).toHaveBeenCalledWith(err, true);
        expect(mockLogUnhandledJSException).toHaveBeenCalledWith(
          "Error",
          "My custom error message",
          "Error",
          expect.any(String),
        );
      });
    });
  });

  describe("unhandled promise rejection tracking", () => {
    test("is enabled when the option is set", () => {
      expect(core.initialize({trackUnhandledRejections: true})).toBe(true);

      expect(mockEnableRejectionTracking).toHaveBeenCalledTimes(1);
    });

    test("is not enabled by default", () => {
      expect(core.initialize()).toBe(true);

      expect(mockEnableRejectionTracking).not.toHaveBeenCalled();
    });
  });
});
