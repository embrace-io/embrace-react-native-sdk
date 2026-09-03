import {NativeModules, Platform, TurboModuleRegistry} from "react-native";

import {AndroidConfig, IOSConfig, OTLPExporterConfig} from "./interfaces";
import type {Spec} from "./NativeRNEmbraceOTLP";

const LINKING_ERROR =
  `The package '@embrace-io/react-native-otlp' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ios: "- You have run 'pod install'\n", default: ""}) +
  "- You rebuilt the app after installing the package\n" +
  "- You are not using Expo Go\n";

interface NativeRNEmbraceOTLPModule extends Spec {
  startNativeEmbraceSDK(
    sdkConfig: IOSConfig | AndroidConfig,
    otlpExporterConfig: OTLPExporterConfig,
  ): Promise<boolean>;
}

const nativeModule =
  TurboModuleRegistry?.get?.<Spec>("RNEmbraceOTLP") ??
  (NativeModules?.RNEmbraceOTLP as Spec | undefined);

const RNEmbraceOTLPModule: NativeRNEmbraceOTLPModule =
  (nativeModule as NativeRNEmbraceOTLPModule | undefined) ??
  new Proxy({} as NativeRNEmbraceOTLPModule, {
    get() {
      throw new Error(LINKING_ERROR);
    },
  });

export {RNEmbraceOTLPModule};
