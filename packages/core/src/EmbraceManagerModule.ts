import {NativeModules, Platform} from "react-native";

const LINKING_ERROR =
  `The package '@embrace-io/react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ios: "- You have run 'pod install'\n", default: ""}) +
  "- You rebuilt the app after installing the package\n" +
  "- You are not using Expo Go\n";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- standard React Native TurboModule detection
const isTurboModuleEnabled = (global as any).__turboModuleProxy != null;

const NativeModule = isTurboModuleEnabled
  ? require("./NativeEmbraceManager").default
  : NativeModules.EmbraceManager;

export const EmbraceManagerModule = NativeModule
  ? NativeModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      },
    );
