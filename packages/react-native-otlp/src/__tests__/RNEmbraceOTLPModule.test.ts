import type {Spec} from "../NativeRNEmbraceOTLP";

const LINKING_ERROR_HEAD =
  "The package '@embrace-io/react-native-otlp' doesn't seem to be linked. Make sure: \n\n";
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
  nativeModules?: {RNEmbraceOTLP?: object};
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

  return require("../RNEmbraceOTLPModule").RNEmbraceOTLPModule as Spec;
};

describe("RNEmbraceOTLPModule", () => {
  it("should use the TurboModule when the registry provides it", () => {
    const turboModule = {name: "turbo"};
    const get = jest.fn().mockReturnValue(turboModule);

    const otlp = loadModule({
      turboModuleRegistry: {get},
      nativeModules: {RNEmbraceOTLP: {name: "legacy"}},
    });

    expect(otlp).toBe(turboModule);
    expect(get).toHaveBeenCalledWith("RNEmbraceOTLP");
  });

  it("should fall back to NativeModules when the registry has no RNEmbraceOTLP", () => {
    const legacyModule = {name: "legacy"};

    const otlp = loadModule({
      turboModuleRegistry: {get: jest.fn().mockReturnValue(null)},
      nativeModules: {RNEmbraceOTLP: legacyModule},
    });

    expect(otlp).toBe(legacyModule);
  });

  it("should fall back to NativeModules when the registry cannot be queried", () => {
    const legacyModule = {name: "legacy"};

    const otlp = loadModule({
      turboModuleRegistry: {},
      nativeModules: {RNEmbraceOTLP: legacyModule},
    });

    expect(otlp).toBe(legacyModule);
  });

  it("should fall back to NativeModules when there is no registry at all", () => {
    const legacyModule = {name: "legacy"};

    const otlp = loadModule({
      turboModuleRegistry: undefined,
      nativeModules: {RNEmbraceOTLP: legacyModule},
    });

    expect(otlp).toBe(legacyModule);
  });

  it("should throw a linking error on any property access when the native module is missing", () => {
    const otlp = loadModule({
      turboModuleRegistry: {get: jest.fn().mockReturnValue(null)},
      nativeModules: {},
    });

    expect(() => otlp.startNativeEmbraceSDK({}, {})).toThrow(
      ANDROID_LINKING_ERROR,
    );
  });

  it("should ask for pod install in the linking error on iOS", () => {
    const otlp = loadModule({os: "ios"});

    expect(() => otlp.startNativeEmbraceSDK({}, {})).toThrow(IOS_LINKING_ERROR);
  });
});
