describe("OTLP module resolution", () => {
  const originalTurboModuleProxy = (global as any).__turboModuleProxy;

  afterEach(() => {
    (global as any).__turboModuleProxy = originalTurboModuleProxy;
    jest.resetModules();
  });

  it("uses NativeModules when TurboModules are not available", () => {
    delete (global as any).__turboModuleProxy;

    jest.isolateModules(() => {
      const mockStartNativeEmbraceSDK = jest.fn().mockResolvedValue(true);
      const mockNativeModule = {
        startNativeEmbraceSDK: mockStartNativeEmbraceSDK,
      };

      jest.doMock("react-native", () => ({
        NativeModules: {RNEmbraceOTLP: mockNativeModule},
        Platform: {OS: "ios"},
      }));
      jest.doMock("../NativeRNEmbraceOTLP", () => ({
        default: {startNativeEmbraceSDK: jest.fn()},
      }));

      const {initialize} = require("../index") as typeof import("../index");

      const callback = initialize({
        logExporter: {endpoint: "https://example.com/logs/v1"},
      });

      callback({ios: {appId: "test"}});

      expect(mockStartNativeEmbraceSDK).toHaveBeenCalled();
    });
  });

  it("uses TurboModule when TurboModules are available", () => {
    (global as any).__turboModuleProxy = jest.fn();

    jest.isolateModules(() => {
      const mockStartNativeEmbraceSDK = jest.fn().mockResolvedValue(true);
      const mockTurboModule = {
        startNativeEmbraceSDK: mockStartNativeEmbraceSDK,
      };

      jest.doMock("react-native", () => ({
        NativeModules: {RNEmbraceOTLP: {startNativeEmbraceSDK: jest.fn()}},
        Platform: {OS: "ios"},
      }));
      jest.doMock("../NativeRNEmbraceOTLP", () => ({
        default: mockTurboModule,
      }));

      const {initialize} = require("../index") as typeof import("../index");

      const callback = initialize({
        logExporter: {endpoint: "https://example.com/logs/v1"},
      });

      callback({ios: {appId: "test"}});

      expect(mockStartNativeEmbraceSDK).toHaveBeenCalled();
    });
  });
});
