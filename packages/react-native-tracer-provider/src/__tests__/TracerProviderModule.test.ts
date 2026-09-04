import type {Spec} from "../NativeReactNativeTracerProviderModule";

const LINKING_ERROR_HEAD =
  "The package '@embrace-io/react-native-tracer-provider' doesn't seem to be linked. Make sure: \n\n";
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
  nativeModules?: {ReactNativeTracerProviderModule?: object};
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

  return require("../TracerProviderModule").TracerProviderModule as Spec;
};

describe("TracerProviderModule", () => {
  it("should use the TurboModule when the registry provides it", () => {
    const turboModule = {name: "turbo"};
    const get = jest.fn().mockReturnValue(turboModule);

    const tracerProvider = loadModule({
      turboModuleRegistry: {get},
      nativeModules: {ReactNativeTracerProviderModule: {name: "legacy"}},
    });

    expect(tracerProvider).toBe(turboModule);
    expect(get).toHaveBeenCalledWith("ReactNativeTracerProviderModule");
  });

  it("should fall back to NativeModules when the registry has no ReactNativeTracerProviderModule", () => {
    const legacyModule = {name: "legacy"};

    const tracerProvider = loadModule({
      turboModuleRegistry: {get: jest.fn().mockReturnValue(null)},
      nativeModules: {ReactNativeTracerProviderModule: legacyModule},
    });

    expect(tracerProvider).toBe(legacyModule);
  });

  it("should fall back to NativeModules when the registry cannot be queried", () => {
    const legacyModule = {name: "legacy"};

    const tracerProvider = loadModule({
      turboModuleRegistry: {},
      nativeModules: {ReactNativeTracerProviderModule: legacyModule},
    });

    expect(tracerProvider).toBe(legacyModule);
  });

  it("should fall back to NativeModules when there is no registry at all", () => {
    const legacyModule = {name: "legacy"};

    const tracerProvider = loadModule({
      turboModuleRegistry: undefined,
      nativeModules: {ReactNativeTracerProviderModule: legacyModule},
    });

    expect(tracerProvider).toBe(legacyModule);
  });

  it("should throw a linking error on any property access when the native module is missing", () => {
    const tracerProvider = loadModule({
      turboModuleRegistry: {get: jest.fn().mockReturnValue(null)},
      nativeModules: {},
    });

    expect(() => tracerProvider.clearCompletedSpans()).toThrow(
      ANDROID_LINKING_ERROR,
    );
    expect(() => tracerProvider.setupTracer("test", "v1", "")).toThrow(
      ANDROID_LINKING_ERROR,
    );
  });

  it("should ask for pod install in the linking error on iOS", () => {
    const tracerProvider = loadModule({os: "ios"});

    expect(() => tracerProvider.clearCompletedSpans()).toThrow(
      IOS_LINKING_ERROR,
    );
  });
});
