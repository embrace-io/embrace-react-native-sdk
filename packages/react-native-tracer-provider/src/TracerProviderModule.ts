import {NativeModules, Platform, TurboModuleRegistry} from "react-native";
import {Attributes, Link, SpanContext} from "@opentelemetry/api";

import type {Spec} from "./NativeReactNativeTracerProviderModule";

const LINKING_ERROR =
  `The package '@embrace-io/react-native-tracer-provider' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ios: "- You have run 'pod install'\n", default: ""}) +
  "- You rebuilt the app after installing the package\n" +
  "- You are not using Expo Go\n";

interface NativeTracerProviderModule extends Spec {
  startSpan(
    tracerName: string,
    tracerVersion: string,
    tracerSchemaUrl: string,
    spanBridgeId: string,
    name: string,
    kind: string,
    time: number,
    attributes: Attributes,
    links: Link[],
    parentId: string,
  ): Promise<SpanContext>;
  setAttributes(spanBridgeId: string, attributes: Attributes): void;
  addEvent(
    spanBridgeId: string,
    eventName: string,
    attributes: Attributes,
    time: number,
  ): void;
  addLinks(spanBridgeId: string, links: Link[]): void;
  setStatus(
    spanBridgeId: string,
    status: {code: string; message?: string},
  ): void;
}

const nativeModule =
  TurboModuleRegistry?.get?.<Spec>("ReactNativeTracerProviderModule") ??
  (NativeModules?.ReactNativeTracerProviderModule as Spec | undefined);

const TracerProviderModule: NativeTracerProviderModule =
  (nativeModule as NativeTracerProviderModule | undefined) ??
  new Proxy({} as NativeTracerProviderModule, {
    get() {
      throw new Error(LINKING_ERROR);
    },
  });

export {TracerProviderModule};
