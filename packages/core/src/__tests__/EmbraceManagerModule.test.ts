describe("EmbraceManagerModule resolution", () => {
  const originalTurboModuleProxy = (global as any).__turboModuleProxy;

  afterEach(() => {
    (global as any).__turboModuleProxy = originalTurboModuleProxy;
    jest.resetModules();
  });

  it("uses NativeModules when TurboModules are not available", () => {
    delete (global as any).__turboModuleProxy;

    jest.isolateModules(() => {
      const mockNativeModule = {isStarted: jest.fn()};

      jest.doMock("react-native", () => ({
        NativeModules: {EmbraceManager: mockNativeModule},
        Platform: {select: jest.fn(() => "")},
      }));
      jest.doMock("../NativeEmbraceManager", () => ({
        default: {isStarted: jest.fn()},
      }));

      const {EmbraceManagerModule} =
        require("../EmbraceManagerModule") as typeof import("../EmbraceManagerModule");

      expect(EmbraceManagerModule).toBe(mockNativeModule);
    });
  });

  it("uses TurboModule when TurboModules are available", () => {
    (global as any).__turboModuleProxy = jest.fn();

    jest.isolateModules(() => {
      const mockTurboModule = {isStarted: jest.fn()};

      jest.doMock("react-native", () => ({
        NativeModules: {EmbraceManager: {isStarted: jest.fn()}},
        Platform: {select: jest.fn(() => "")},
      }));
      jest.doMock("../NativeEmbraceManager", () => ({
        default: mockTurboModule,
      }));

      const {EmbraceManagerModule} =
        require("../EmbraceManagerModule") as typeof import("../EmbraceManagerModule");

      expect(EmbraceManagerModule).toBe(mockTurboModule);
    });
  });

  it("throws LINKING_ERROR when module is not available (Old Architecture)", () => {
    delete (global as any).__turboModuleProxy;

    jest.isolateModules(() => {
      jest.doMock("react-native", () => ({
        NativeModules: {EmbraceManager: undefined},
        Platform: {select: jest.fn(() => "")},
      }));
      jest.doMock("../NativeEmbraceManager", () => ({
        default: undefined,
      }));

      const {EmbraceManagerModule} =
        require("../EmbraceManagerModule") as typeof import("../EmbraceManagerModule");

      expect(() => {
        (EmbraceManagerModule as any).someMethod;
      }).toThrow("doesn't seem to be linked");
    });
  });

  it("throws LINKING_ERROR when module is not available (New Architecture)", () => {
    (global as any).__turboModuleProxy = jest.fn();

    jest.isolateModules(() => {
      jest.doMock("react-native", () => ({
        NativeModules: {EmbraceManager: undefined},
        Platform: {select: jest.fn(() => "")},
      }));
      jest.doMock("../NativeEmbraceManager", () => ({
        default: null,
      }));

      const {EmbraceManagerModule} =
        require("../EmbraceManagerModule") as typeof import("../EmbraceManagerModule");

      expect(() => {
        (EmbraceManagerModule as any).someMethod;
      }).toThrow("doesn't seem to be linked");
    });
  });
});
