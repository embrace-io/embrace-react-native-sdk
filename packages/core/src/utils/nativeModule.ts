import type {TurboModule} from "react-native";
import {NativeModules, Platform, TurboModuleRegistry} from "react-native";

const LINKING_ERROR =
  `The package '@embrace-io/react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ios: "- You have run 'pod install'\n", default: ""}) +
  "- You rebuilt the app after installing the package\n" +
  "- You are not using Expo Go\n";

const getNativeModule = <T extends TurboModule>(name: string): T =>
  TurboModuleRegistry?.get?.<T>(name) ??
  (NativeModules?.[name] as T | undefined) ??
  new Proxy({} as T, {
    get() {
      throw new Error(LINKING_ERROR);
    },
  });

export {getNativeModule};
