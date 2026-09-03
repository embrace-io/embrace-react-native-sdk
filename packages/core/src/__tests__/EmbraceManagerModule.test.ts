import type {Spec} from "../NativeEmbraceManager";

const LINKING_ERROR_HEAD =
  "The package '@embrace-io/react-native' doesn't seem to be linked. Make sure: \n\n";
const LINKING_ERROR_TAIL =
  "- You rebuilt the app after installing the package\n" +
  "- You are not using Expo Go\n";

const IOS_LINKING_ERROR = new Error(
  LINKING_ERROR_HEAD + "- You have run 'pod install'\n" + LINKING_ERROR_TAIL,
);
const ANDROID_LINKING_ERROR = new Error(
  LINKING_ERROR_HEAD + LINKING_ERROR_TAIL,
);

const loadModule = ({
  nativeModules,
  turboModuleRegistry,
  os = "android",
}: {
  nativeModules?: {EmbraceManager?: object};
  turboModuleRegistry?: {get?: jest.Mock};
  os?: string;
}) => {
  jest.resetModules();
  jest.doMock("react-native", () => ({
    NativeModules: nativeModules,
    TurboModuleRegistry: turboModuleRegistry,
    Platform: {
      OS: os,
      select: (spec: Record<string, string>) => spec[os] ?? spec.default,
    },
  }));

  return require("../EmbraceManagerModule").EmbraceManagerModule as Spec;
};

describe("EmbraceManagerModule", () => {
  it("should use the TurboModule when the registry provides it", () => {
    const turboModule = {name: "turbo"};
    const get = jest.fn().mockReturnValue(turboModule);

    const manager = loadModule({
      turboModuleRegistry: {get},
      nativeModules: {EmbraceManager: {name: "legacy"}},
    });

    expect(manager).toBe(turboModule);
    expect(get).toHaveBeenCalledWith("EmbraceManager");
  });

  it("should fall back to NativeModules when the registry has no EmbraceManager", () => {
    const legacyModule = {name: "legacy"};

    const manager = loadModule({
      turboModuleRegistry: {get: jest.fn().mockReturnValue(null)},
      nativeModules: {EmbraceManager: legacyModule},
    });

    expect(manager).toBe(legacyModule);
  });

  it("should fall back to NativeModules when the registry cannot be queried", () => {
    const legacyModule = {name: "legacy"};

    const manager = loadModule({
      turboModuleRegistry: {},
      nativeModules: {EmbraceManager: legacyModule},
    });

    expect(manager).toBe(legacyModule);
  });

  it("should fall back to NativeModules when there is no registry at all", () => {
    const legacyModule = {name: "legacy"};

    const manager = loadModule({
      turboModuleRegistry: undefined,
      nativeModules: {EmbraceManager: legacyModule},
    });

    expect(manager).toBe(legacyModule);
  });

  it("should throw a linking error on any property access when the native module is missing", () => {
    const manager = loadModule({
      turboModuleRegistry: {get: jest.fn().mockReturnValue(null)},
      nativeModules: {},
    });

    expect(() => manager.isStarted()).toThrow(ANDROID_LINKING_ERROR);
    expect(() => manager.getDeviceId()).toThrow(ANDROID_LINKING_ERROR);
  });

  it("should ask for pod install in the linking error on iOS", () => {
    const manager = loadModule({os: "ios"});

    expect(() => manager.isStarted()).toThrow(IOS_LINKING_ERROR);
  });
});
