describe("TracerProviderModule resolution", () => {
  const originalTurboModuleProxy = (global as any).__turboModuleProxy;

  afterEach(() => {
    (global as any).__turboModuleProxy = originalTurboModuleProxy;
    jest.resetModules();
  });

  it("uses NativeModules when TurboModules are not available", () => {
    delete (global as any).__turboModuleProxy;

    jest.isolateModules(() => {
      const mockNativeModule = {setupTracer: jest.fn()};

      jest.doMock("react-native", () => ({
        NativeModules: {ReactNativeTracerProviderModule: mockNativeModule},
        Platform: {select: jest.fn(() => "")},
      }));
      jest.doMock("../NativeReactNativeTracerProviderModule", () => ({
        default: {setupTracer: jest.fn()},
      }));

      const {TracerProviderModule} =
        require("../TracerProviderModule") as typeof import("../TracerProviderModule");

      expect(TracerProviderModule).toBe(mockNativeModule);
    });
  });

  it("uses TurboModule when TurboModules are available", () => {
    (global as any).__turboModuleProxy = jest.fn();

    jest.isolateModules(() => {
      const mockTurboModule = {setupTracer: jest.fn()};

      jest.doMock("react-native", () => ({
        NativeModules: {
          ReactNativeTracerProviderModule: {setupTracer: jest.fn()},
        },
        Platform: {select: jest.fn(() => "")},
      }));
      jest.doMock("../NativeReactNativeTracerProviderModule", () => ({
        default: mockTurboModule,
      }));

      const {TracerProviderModule} =
        require("../TracerProviderModule") as typeof import("../TracerProviderModule");

      expect(TracerProviderModule).toBe(mockTurboModule);
    });
  });

  it("throws LINKING_ERROR when module is not available (Old Architecture)", () => {
    delete (global as any).__turboModuleProxy;

    jest.isolateModules(() => {
      jest.doMock("react-native", () => ({
        NativeModules: {ReactNativeTracerProviderModule: undefined},
        Platform: {select: jest.fn(() => "")},
      }));
      jest.doMock("../NativeReactNativeTracerProviderModule", () => ({
        default: undefined,
      }));

      const {TracerProviderModule} =
        require("../TracerProviderModule") as typeof import("../TracerProviderModule");

      expect(() => {
        (TracerProviderModule as any).someMethod;
      }).toThrow("doesn't seem to be linked");
    });
  });

  it("throws LINKING_ERROR when module is not available (New Architecture)", () => {
    (global as any).__turboModuleProxy = jest.fn();

    jest.isolateModules(() => {
      jest.doMock("react-native", () => ({
        NativeModules: {ReactNativeTracerProviderModule: undefined},
        Platform: {select: jest.fn(() => "")},
      }));
      jest.doMock("../NativeReactNativeTracerProviderModule", () => ({
        default: null,
      }));

      const {TracerProviderModule} =
        require("../TracerProviderModule") as typeof import("../TracerProviderModule");

      expect(() => {
        (TracerProviderModule as any).someMethod;
      }).toThrow("doesn't seem to be linked");
    });
  });
});
