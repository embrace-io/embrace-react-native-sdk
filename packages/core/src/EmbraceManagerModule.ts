import {NativeModules, Platform, TurboModuleRegistry} from "react-native";

import type {Spec} from "./NativeEmbraceManager";

const LINKING_ERROR =
  `The package '@embrace-io/react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ios: "- You have run 'pod install'\n", default: ""}) +
  "- You rebuilt the app after installing the package\n" +
  "- You are not using Expo Go\n";

const nativeModule =
  TurboModuleRegistry?.get?.<Spec>("EmbraceManager") ??
  (NativeModules?.EmbraceManager as Spec | undefined);

export const EmbraceManagerModule: Spec =
  nativeModule ??
  new Proxy({} as Spec, {
    get() {
      throw new Error(LINKING_ERROR);
    },
  });
