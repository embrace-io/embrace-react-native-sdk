import {NativeModules, Platform} from "react-native";

const LINKING_ERROR =
  `The package '@embrace-io/react-native-tracer-provider' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ios: "- You have run 'pod install'\n", default: ""}) +
  "- You rebuilt the app after installing the package\n" +
  "- You are not using Expo Go\n";

const TracerProviderModule = NativeModules.ReactNativeTracerProviderModule
  ? NativeModules.ReactNativeTracerProviderModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      },
    );

export {TracerProviderModule};
