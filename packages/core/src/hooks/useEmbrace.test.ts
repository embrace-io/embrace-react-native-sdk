import {afterEach} from "node:test";

import {renderHook, waitFor} from "@testing-library/react-native";

import {oltpGetStart} from "../utils/otlp";
import {SDKConfig, EmbraceLoggerLevel} from "../interfaces";

import {useEmbrace} from "./useEmbrace";

jest.mock("../utils/otlp", () => ({
  oltpGetStart: jest.fn(),
}));

type EmbraceHook = {
  sdkConfig: SDKConfig;
  patch: string | undefined;
  logLevel: EmbraceLoggerLevel | undefined;
};

const mockStartNativeEmbraceSDK = jest.fn().mockResolvedValue(true);
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

const mockSetJavaScriptPatchNumber = jest.fn();
jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    startNativeEmbraceSDK: () => mockStartNativeEmbraceSDK(),
    isStarted: jest.fn().mockResolvedValueOnce(false),
    setReactNativeSDKVersion: jest.fn(),
    setReactNativeVersion: jest.fn(),
    getDefaultJavaScriptBundlePath: jest.fn(),
    setJavaScriptBundlePath: jest.fn(),
    setJavaScriptPatchNumber: jest.fn(patch =>
      mockSetJavaScriptPatchNumber(patch),
    ),
  },
}));

const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(m => m);
const mockConsoleWarn = jest.spyOn(console, "warn").mockImplementation(m => m);

afterEach(() => {
  jest.clearAllMocks();
});

describe("useEmbrace", () => {
  it("should start the Embrace React Native SDK", async () => {
    const {result, rerender} = renderHook(
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
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "[Embrace] native SDK was started",
      );
      expect(mockSetJavaScriptPatchNumber).toHaveBeenCalledWith("v1");
    });

    mockConsoleLog.mockClear();
    mockSetJavaScriptPatchNumber.mockClear();

    // not updating what `EmbraceManagerModule.startNativeEmbraceSDK` returns
    // as we want to test again the same with the different `debug` value
    rerender({
      sdkConfig: {ios: {appId: "test"}},
      patch: undefined,
      logLevel: "error",
    });

    await waitFor(() => {
      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockSetJavaScriptPatchNumber).not.toHaveBeenCalledWith("v1");
    });
  });

  it("should show a warning message if for some reason Embrace React Native SKD can't initialize", async () => {
    jest.mocked(mockStartNativeEmbraceSDK).mockResolvedValueOnce(false);

    const {result} = renderHook(
      ({sdkConfig, patch, logLevel}) => useEmbrace(sdkConfig, patch, logLevel),
      {
        initialProps: {
          sdkConfig: {
            ios: {appId: "test"},
            exporters: {
              logExporter: {
                endpoint: "http://localhost:8081",
              },
            },
          },
          patch: "v1",
          logLevel: "info",
        } as EmbraceHook,
      },
    );

    await waitFor(() => {
      expect(mockStartNativeEmbraceSDK).toHaveBeenCalledTimes(1);

      expect(result.current.isPending).toBe(false);
      expect(result.current.isStarted).toBe(false);

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] we could not initialize Embrace's native SDK, please check the Embrace integration docs at https://embrace.io/docs/react-native/integration/",
      );
    });
  });

  it("should start the Embrace React Native SDK using OTLP", async () => {
    const mockRNEmbraceOTLPInit = jest.fn().mockResolvedValue(true);
    const mockOltpGetStart = jest
      .mocked(oltpGetStart)
      .mockImplementation(() => mockRNEmbraceOTLPInit);

    const {result} = renderHook(
      ({sdkConfig, patch, logLevel}) => useEmbrace(sdkConfig, patch, logLevel),
      {
        initialProps: {
          sdkConfig: {
            ios: {appId: "test"},
            exporters: {
              logExporter: {
                endpoint: "http://localhost:8081",
              },
            },
          },
          patch: "v1",
          logLevel: "info",
        } as EmbraceHook,
      },
    );

    await waitFor(() => {
      expect(mockOltpGetStart).toHaveBeenCalledTimes(1);
      expect(mockRNEmbraceOTLPInit).toHaveBeenCalledTimes(1);

      expect(result.current.isPending).toBe(false);
      expect(result.current.isStarted).toBe(true);
    });
  });

  it("should throw if something goes wrong with React Native OTLP Package and there was exporter configuration available", async () => {
    const mockOltpGetStart = jest
      .mocked(oltpGetStart)
      .mockImplementation(() => {
        try {
          // making `@embrace-io/react-native-otlp` throw
          throw new Error();
        } catch {}
      });

    const {result} = renderHook(
      ({sdkConfig, patch, logLevel}) => useEmbrace(sdkConfig, patch, logLevel),
      {
        initialProps: {
          sdkConfig: {
            ios: {appId: "test"},
            exporters: {
              logExporter: {
                endpoint: "http://localhost:8081",
              },
            },
          },
          patch: "v1",
          logLevel: "info",
        } as EmbraceHook,
      },
    );

    await waitFor(() => {
      expect(mockOltpGetStart).toHaveBeenCalledTimes(1);
      expect(result.current.isPending).toBe(false);
      // it should still initialize the SKD using the regular `@embrace-io/react-native` package
      expect(result.current.isStarted).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "[Embrace] native SDK was started",
      );
    });
  });

  it("should not initialize the React Native Embrace SDK if the initialization from the OTLP side returns false", async () => {
    jest
      .mocked(oltpGetStart)
      .mockImplementation(jest.fn().mockResolvedValue(false));

    const {result} = renderHook(
      ({sdkConfig, patch, logLevel}) => useEmbrace(sdkConfig, patch, logLevel),
      {
        initialProps: {
          sdkConfig: {
            ios: {appId: "test"},
            exporters: {
              logExporter: {
                endpoint: "http://localhost:8081",
              },
            },
          },
          patch: "v1",
          logLevel: "info",
        } as EmbraceHook,
      },
    );

    await waitFor(() => {
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] we could not initialize Embrace's native SDK, please check the Embrace integration docs at https://embrace.io/docs/react-native/integration/",
      );
      expect(result.current.isPending).toBe(false);
      expect(result.current.isStarted).toBe(false);
    });
  });
});
