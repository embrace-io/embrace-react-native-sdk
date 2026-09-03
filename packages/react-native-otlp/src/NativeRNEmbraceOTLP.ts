/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import type {TurboModule} from "react-native";
import {TurboModuleRegistry} from "react-native";

export interface Spec extends TurboModule {
  startNativeEmbraceSDK(
    sdkConfig: Object,
    otlpExporterConfig: Object,
  ): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>("RNEmbraceOTLP");
