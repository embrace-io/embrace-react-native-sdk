import type {TurboModule} from "react-native";
import {TurboModuleRegistry} from "react-native";

/* eslint-disable @typescript-eslint/ban-types -- Object is required by React Native TurboModule codegen */
export interface Spec extends TurboModule {
  setupTracer(name: string, version: string, schemaUrl: string): void;
  startSpan(
    tracerName: string,
    tracerVersion: string,
    tracerSchemaUrl: string,
    spanBridgeId: string,
    name: string,
    kind: string,
    time: number,
    attributes: Object,
    links: Object[],
    parentId: string,
  ): Promise<Object>;
  setAttributes(spanBridgeId: string, attributes: Object): void;
  addEvent(
    spanBridgeId: string,
    eventName: string,
    attributes: Object,
    time: number,
  ): void;
  addLinks(spanBridgeId: string, links: Object[]): void;
  setStatus(spanBridgeId: string, status: Object): void;
  updateName(spanBridgeId: string, name: string): void;
  endSpan(spanBridgeId: string, time: number): void;
  clearCompletedSpans(): void;
}

export default TurboModuleRegistry.get<Spec>("ReactNativeTracerProviderModule");
