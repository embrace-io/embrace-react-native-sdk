import {renderHook, waitFor} from "@testing-library/react-native";

import EmbraceOTLP from "../utils/EmbraceOTLP";
import {SDKConfig, EmbraceLoggerLevel} from "../interfaces";

import {useEmbrace} from "./useEmbrace";

jest.mock("../utils/EmbraceOTLP");
jest.spyOn(jest.requireActual("../utils/EmbraceOTLP"), "default");

type UseEmbraceHook = {
  sdkConfig: SDKConfig;
  patch: string | undefined;
  debug: EmbraceLoggerLevel | undefined;
};

const mockStartNativeEmbraceSDK = jest.fn().mockResolvedValue(true);
const mockRNEmbraceOTLPInit = jest.fn().mockResolvedValue(true);
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

const mockSetJavaScriptPatchNumber = jest.fn();
jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    startNativeEmbraceSDK: () => {
      mockStartNativeEmbraceSDK();
      return Promise.resolve(true);
    },
    isStarted: jest.fn().mockResolvedValueOnce(false),
    setReactNativeSDKVersion: jest.fn(),
    setReactNativeVersion: jest.fn(),
    setJavaScriptPatchNumber: jest.fn(patch =>
      mockSetJavaScriptPatchNumber(patch),
    ),
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(m => m);
const mockConsoleWarn = jest.spyOn(console, "warn").mockImplementation(m => m);
const mockConsoleErr = jest.spyOn(console, "error").mockImplementation(m => m);

describe("useEmbrace", () => {
  it("should start the Embrace React Native SDK", async () => {
    const {result, rerender} = renderHook(
      ({sdkConfig, patch, debug}) => useEmbrace(sdkConfig, patch, debug),
      {
        initialProps: {
          sdkConfig: {ios: {appId: "test"}},
          patch: "v1",
          // testing default value for `debug`
          debug: undefined,
        } as UseEmbraceHook,
      },
    );

    waitFor(() => {
      expect(result.current.isPending).toBeFalsy();
      expect(result.current.isStarted).toBeTruthy();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "[Embrace] native SDK was started",
      );
      expect(mockSetJavaScriptPatchNumber).toHaveBeenCalledWith("v1");
    });

    // not updating what `EmbraceManagerModule.startNativeEmbraceSDK` returns
    // as we want to test again the same with the different `debug` value
    rerender({
      sdkConfig: {ios: {appId: "test"}},
      patch: undefined,
      debug: "error",
    });

    waitFor(() => {
      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockSetJavaScriptPatchNumber).not.toHaveBeenCalledWith("v1");
    });
  });

  it("should show a warning message if for some reason Embrace React Native SKD can't initialize", () => {
    const {result} = renderHook(
      ({sdkConfig, patch, debug}) => useEmbrace(sdkConfig, patch, debug),
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
          debug: "info",
        } as UseEmbraceHook,
      },
    );

    jest.mocked(mockStartNativeEmbraceSDK).mockResolvedValue(false);

    waitFor(() => {
      expect(mockStartNativeEmbraceSDK).toHaveBeenCalledTimes(1);

      expect(result.current.isPending).toBeFalsy();
      expect(result.current.isStarted).toBeFalsy();

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] we could not initialize Embrace's native SDK, please check the Embrace integration docs at https://embrace.io/docs/react-native/integration/",
      );
    });
  });

  it("should start the Embrace React Native SDK using OTLP", async () => {
    const {result} = renderHook(
      ({sdkConfig, patch, debug}) => useEmbrace(sdkConfig, patch, debug),
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
          debug: "info",
        } as UseEmbraceHook,
      },
    );

    const mockEmbraceOTLPGetStart = jest.fn().mockReturnValue({
      initialize: mockRNEmbraceOTLPInit,
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    jest.mocked(EmbraceOTLP).mockImplementation(() => ({
      getStart: mockEmbraceOTLPGetStart,
    }));

    waitFor(() => {
      expect(mockEmbraceOTLPGetStart).toHaveBeenCalledTimes(1);
      expect(mockRNEmbraceOTLPInit).toHaveBeenCalledTimes(1);

      expect(result.current.isPending).toBeFalsy();
      expect(result.current.isStarted).toBeTruthy();
    });
  });

  it("should throw if something goes wrong with React Native OTLP Package and there was exporter configuration available", async () => {
    const mockEmbraceOTLPGetStart = jest.fn().mockImplementation(() => {
      // making it throw
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    jest.mocked(EmbraceOTLP).mockImplementation(() => ({
      getStart: mockEmbraceOTLPGetStart,
    }));

    const {result} = renderHook(
      ({sdkConfig, patch, debug}) => useEmbrace(sdkConfig, patch, debug),
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
          debug: "info",
        } as UseEmbraceHook,
      },
    );

    waitFor(() => {
      expect(mockEmbraceOTLPGetStart).toHaveBeenCalledTimes(1);
      expect(mockConsoleErr).toHaveBeenCalledWith(
        "[Embrace] an error ocurred when checking if `@embrace-io/react-native-otlp` was installed",
      );

      expect(result.current.isPending).toBeFalsy();
      expect(result.current.isStarted).toBeFalsy();
    });
  });

  it("should not initialize the React Native Embrace SDK if the initialization from the OTLP side returns false", () => {
    const mockEmbraceOTLPGetStart = jest.fn().mockResolvedValue(false);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    jest.mocked(EmbraceOTLP).mockImplementation(() => ({
      getStart: mockEmbraceOTLPGetStart,
    }));

    const {result} = renderHook(
      ({sdkConfig, patch, debug}) => useEmbrace(sdkConfig, patch, debug),
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
          debug: "info",
        } as UseEmbraceHook,
      },
    );

    waitFor(() => {
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] we could not initialize Embrace's native SDK, please check the Embrace integration docs at https://embrace.io/docs/react-native/integration/",
      );
      expect(result.current.isPending).toBeFalsy();
      expect(result.current.isStarted).toBeFalsy();
    });
  });
});
