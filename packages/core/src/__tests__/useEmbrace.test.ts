import {renderHook, waitFor} from "@testing-library/react-native";

import {SDKConfig, EmbraceLoggerLevel} from "../interfaces";
import {useEmbrace} from "../hooks/useEmbrace";

type EmbraceHook = {
  sdkConfig: SDKConfig;
  patch: string | undefined;
  logLevel: EmbraceLoggerLevel | undefined;
};

type EmbraceHookResult = {
  isPending: boolean;
  isStarted: boolean;
};

const mockStartNativeEmbraceSDK = jest.fn().mockResolvedValue(true);
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

const mockSetJavaScriptPatchNumber = jest
  .fn()
  .mockReturnValue(Promise.resolve(true));
jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    startNativeEmbraceSDK: () => mockStartNativeEmbraceSDK(),
    isStarted: jest.fn().mockResolvedValueOnce(false),
    setReactNativeSDKVersion: jest.fn().mockReturnValue(Promise.resolve(true)),
    setReactNativeVersion: jest.fn().mockReturnValue(Promise.resolve(true)),
    logMessageWithSeverityAndProperties: jest
      .fn()
      .mockReturnValue(Promise.resolve(true)),
    getDefaultJavaScriptBundlePath: jest.fn().mockResolvedValue(null),
    setJavaScriptBundlePath: jest.fn().mockReturnValue(Promise.resolve(true)),
    setJavaScriptPatchNumber: (patch: string) =>
      mockSetJavaScriptPatchNumber(patch),
  },
}));

describe("useEmbrace", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should start the Embrace React Native SDK", async () => {
    const {result, rerender} = renderHook<EmbraceHookResult, EmbraceHook>(
      ({sdkConfig, patch, logLevel}) => useEmbrace(sdkConfig, patch, logLevel),
      {
        initialProps: {
          sdkConfig: {ios: {appId: "test"}},
          patch: "v1",
          // testing default value for `logLevel`
          logLevel: undefined,
        } as EmbraceHook,
      },
    );

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
      expect(result.current.isStarted).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        "[Embrace] native SDK was started",
      );
      expect(mockSetJavaScriptPatchNumber).toHaveBeenCalledWith("v1");
    });

    jest.mocked(console.log).mockClear();
    mockSetJavaScriptPatchNumber.mockClear();

    // not updating what `EmbraceManagerModule.startNativeEmbraceSDK` returns
    // as we want to test again the same with the different `debug` value
    rerender({
      sdkConfig: {ios: {appId: "test"}},
      patch: undefined,
      logLevel: "error",
    });

    await waitFor(() => {
      expect(console.log).not.toHaveBeenCalled();
      expect(mockSetJavaScriptPatchNumber).not.toHaveBeenCalledWith("v1");
    });
  });

  it("should show a warning message if for some reason Embrace React Native SKD can't initialize", async () => {
    jest.mocked(mockStartNativeEmbraceSDK).mockResolvedValueOnce(false);

    const {result} = renderHook<EmbraceHookResult, EmbraceHook>(
      ({sdkConfig, patch, logLevel}) => useEmbrace(sdkConfig, patch, logLevel),
      {
        initialProps: {
          sdkConfig: {ios: {appId: "test"}},
          patch: "v1",
          logLevel: "info",
        } as EmbraceHook,
      },
    );

    await waitFor(() => {
      expect(mockStartNativeEmbraceSDK).toHaveBeenCalledTimes(1);

      expect(result.current.isPending).toBe(false);
      expect(result.current.isStarted).toBe(false);

      expect(console.warn).toHaveBeenCalledWith(
        "[Embrace] we could not initialize Embrace's native SDK, please check the Embrace integration docs at https://embrace.io/docs/react-native/integration/",
      );
    });
  });
});
