import type {TurboModule} from "react-native";
import {TurboModuleRegistry} from "react-native";

/* eslint-disable @typescript-eslint/ban-types -- Object is required by React Native TurboModule codegen */
export interface Spec extends TurboModule {
  startNativeEmbraceSDK(
    sdkConfig: Object,
    otlpExporterConfig: Object,
  ): Promise<boolean>;
}

export default TurboModuleRegistry.get<Spec>("RNEmbraceOTLP");
