import {initialize, type OTLPExporterConfig} from "../index";
import {SDKConfig} from "../../../core/src/interfaces/Config";

const IOS_SDK_BASE_CONFIG = {
  ios: {
    appId: "abcde",
  },
};

const mockStartNativeEmbraceSDK = jest.fn();
jest.mock("react-native", () => ({
  NativeModules: {
    RNEmbraceOTLP: {
      startNativeEmbraceSDK: (
        sdkConfig: SDKConfig["ios"] | NonNullable<object>,
        otlpConfig: OTLPExporterConfig,
      ) => mockStartNativeEmbraceSDK(sdkConfig, otlpConfig),
    },
  },
  Platform: {OS: "ios"},
}));

describe("React Native OTLP", () => {
  describe("should call `startNativeEmbraceSDK`", () => {
    it("if it receives the proper configuration (happy path)", async () => {
      const otlpExporterConfig = {
        logExporter: {
          endpoint: "https://example.com/logs/v1",
          headers: [
            {key: "Authorization", token: "Bearer token"},
            {key: "Authorization", token: "Bearer token:v2"},
          ],
          timeout: 10000,
        },
        traceExporter: {
          endpoint: "https://example.com/traces/v1",
          headers: [{key: "Authorization", token: "Bearer token"}],
          timeout: 10000,
        },
      };

      const customInitCallback = initialize(otlpExporterConfig);
      await customInitCallback(IOS_SDK_BASE_CONFIG);

      expect(mockStartNativeEmbraceSDK).toHaveBeenCalledWith(
        IOS_SDK_BASE_CONFIG,
        otlpExporterConfig,
      );
    });

    it("if it receives an empty configuration (but valid)", async () => {
      // empty object will be treated as valid configuration, it's caught by the iOS Native layer
      const customInitCallback = initialize({});
      await customInitCallback(IOS_SDK_BASE_CONFIG);

      expect(mockStartNativeEmbraceSDK).toHaveBeenCalled();
      expect(mockStartNativeEmbraceSDK).toHaveBeenCalledWith(
        IOS_SDK_BASE_CONFIG,
        {},
      );
    });

    it("if it receives configuration only for traces custom export", async () => {
      const otlpExporterConfig = {
        traceExporter: {
          endpoint: "https://example.com/traces/v1",
          headers: [{key: "Authorization", token: "Bearer token"}],
          timeout: 10000,
        },
      };

      const customInitCallback = initialize(otlpExporterConfig);
      await customInitCallback(IOS_SDK_BASE_CONFIG);

      expect(mockStartNativeEmbraceSDK).toHaveBeenCalledWith(
        IOS_SDK_BASE_CONFIG,
        otlpExporterConfig,
      );
    });

    it("if it receives configuration only for logs custom export", async () => {
      const otlpExporterConfig = {
        logExporter: {
          endpoint: "https://example.com/logs/v1",
          headers: [
            {key: "Authorization", token: "Bearer token"},
            {key: "Authorization", token: "Bearer token:v2"},
          ],
          timeout: 10000,
        },
      };

      const customInitCallback = initialize(otlpExporterConfig);
      await customInitCallback(IOS_SDK_BASE_CONFIG);

      expect(mockStartNativeEmbraceSDK).toHaveBeenCalledWith(
        IOS_SDK_BASE_CONFIG,
        otlpExporterConfig,
      );
    });
  });

  describe("should not call `startNativeEmbraceSDK`", () => {
    const mockConsoleWarn = jest
      .spyOn(console, "warn")
      .mockImplementation(a => a);

    it("if configuration is missing", async () => {
      // @ts-expect-error (testing invalid configuration)
      const customInitCallback = initialize(undefined);
      await customInitCallback(IOS_SDK_BASE_CONFIG);

      expect(mockStartNativeEmbraceSDK).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] Invalid configuration for Custom Exporter",
      );
    });

    it("if it doesn't receive proper configuration", async () => {
      // passing string
      const customInitWithStringArgCallback = initialize(
        // @ts-expect-error (testing invalid configuration)
        "string instead of proper configuration",
      );
      await customInitWithStringArgCallback(IOS_SDK_BASE_CONFIG);
      expect(mockStartNativeEmbraceSDK).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] Invalid configuration for Custom Exporter",
      );

      // passing a number
      // @ts-expect-error (testing invalid configuration)
      const customInitWithNumberArgCallback = initialize(12345678);
      await customInitWithNumberArgCallback(IOS_SDK_BASE_CONFIG);
      expect(mockStartNativeEmbraceSDK).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] Invalid configuration for Custom Exporter",
      );

      // passing an array
      // @ts-expect-error (testing invalid configuration)
      const customInitWithArrayArgCallback = initialize([]);
      await customInitWithArrayArgCallback(IOS_SDK_BASE_CONFIG);
      expect(mockStartNativeEmbraceSDK).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] Invalid configuration for Custom Exporter",
      );
    });

    it("if it receives a trace or log invalid configuration", async () => {
      const customInitTraceInvalidCallback = initialize({
        // @ts-expect-error (testing invalid configuration)
        traceExporter:
          "passing an string instead of a valid config for trace exporter",
      });

      await customInitTraceInvalidCallback(IOS_SDK_BASE_CONFIG);
      expect(mockStartNativeEmbraceSDK).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] Invalid configuration for Trace Custom Exporter",
      );

      const customInitLogInvalidCallback = initialize({
        // @ts-expect-error (testing invalid configuration)
        logExporter:
          "passing an string instead of a valid config for log exporter",
      });

      await customInitLogInvalidCallback(IOS_SDK_BASE_CONFIG);
      expect(mockStartNativeEmbraceSDK).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] Invalid configuration for Trace Custom Exporter",
      );
    });

    it("if it receives a trace exporter configuration with invalid endpoint", async () => {
      const customInitEndpointAsNumberCallback = initialize({
        traceExporter: {
          // @ts-expect-error (testing invalid configuration)
          endpoint: 12345665,
        },
      });

      await customInitEndpointAsNumberCallback(IOS_SDK_BASE_CONFIG);
      expect(mockStartNativeEmbraceSDK).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] Invalid endpoint for Custom Exporter",
      );

      const customInitEndpointAsArrayCallback = initialize({
        traceExporter: {
          // @ts-expect-error (testing invalid configuration)
          endpoint: [],
        },
      });

      await customInitEndpointAsArrayCallback(IOS_SDK_BASE_CONFIG);
      expect(mockStartNativeEmbraceSDK).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] Invalid endpoint for Custom Exporter",
      );

      const customInitEmptyEndpointCallback = initialize({
        traceExporter: {
          // @ts-expect-error (testing invalid configuration)
          endpoint: [],
        },
      });

      await customInitEmptyEndpointCallback(IOS_SDK_BASE_CONFIG);
      expect(mockStartNativeEmbraceSDK).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] Invalid endpoint for Custom Exporter",
      );

      const customInitEndpointAsObjectCallback = initialize({
        traceExporter: {
          // @ts-expect-error (testing invalid configuration)
          endpoint: {},
        },
      });

      await customInitEndpointAsObjectCallback(IOS_SDK_BASE_CONFIG);
      expect(mockStartNativeEmbraceSDK).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] Invalid endpoint for Custom Exporter",
      );
    });

    it("if it receives a log exporter configuration with invalid endpoint", async () => {
      const customInitEndpointAsNumberCallback = initialize({
        logExporter: {
          // @ts-expect-error (testing invalid configuration)
          endpoint: 12345665,
        },
      });

      await customInitEndpointAsNumberCallback(IOS_SDK_BASE_CONFIG);
      expect(mockStartNativeEmbraceSDK).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] Invalid endpoint for Custom Exporter",
      );

      const customInitEndpointAsArrayCallback = initialize({
        logExporter: {
          // @ts-expect-error (testing invalid configuration)
          endpoint: [],
        },
      });

      await customInitEndpointAsArrayCallback(IOS_SDK_BASE_CONFIG);
      expect(mockStartNativeEmbraceSDK).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] Invalid endpoint for Custom Exporter",
      );

      const customInitEmptyEndpointCallback = initialize({
        logExporter: {
          endpoint: "",
        },
      });

      await customInitEmptyEndpointCallback(IOS_SDK_BASE_CONFIG);
      expect(mockStartNativeEmbraceSDK).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] Invalid endpoint for Custom Exporter",
      );

      const customInitEndpointAsObjectCallback = initialize({
        logExporter: {
          // @ts-expect-error (testing invalid configuration)
          endpoint: {},
        },
      });

      await customInitEndpointAsObjectCallback(IOS_SDK_BASE_CONFIG);
      expect(mockStartNativeEmbraceSDK).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] Invalid endpoint for Custom Exporter",
      );
    });

    it("if it receives an endpoint and headers but headers are not matching the expected type", async () => {
      const customInitHeaderAsNumberCallback = initialize({
        logExporter: {
          endpoint: "https://example.com/logs/v1",
          // @ts-expect-error (testing invalid configuration)
          headers: 123456,
        },
      });

      await customInitHeaderAsNumberCallback(IOS_SDK_BASE_CONFIG);
      expect(mockStartNativeEmbraceSDK).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] Invalid header for Custom Exporter",
      );

      const customInitHeaderAsObjectCallback = initialize({
        logExporter: {
          endpoint: "https://example.com/logs/v1",
          // @ts-expect-error (testing invalid configuration)
          headers: {},
        },
      });

      await customInitHeaderAsObjectCallback(IOS_SDK_BASE_CONFIG);
      expect(mockStartNativeEmbraceSDK).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "[Embrace] Invalid header for Custom Exporter",
      );
    });
  });
});
