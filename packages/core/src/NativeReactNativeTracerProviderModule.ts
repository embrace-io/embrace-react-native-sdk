/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import type {TurboModule} from "react-native";
import {TurboModuleRegistry} from "react-native";

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
    links: Array<Object>,
    parentId: string,
  ): Promise<{traceId: string; spanId: string}>;
  setAttributes(spanBridgeId: string, attributes: Object): void;
  addEvent(
    spanBridgeId: string,
    eventName: string,
    attributes: Object,
    time: number,
  ): void;
  addLinks(spanBridgeId: string, links: Array<Object>): void;
  setStatus(spanBridgeId: string, status: Object): void;
  updateName(spanBridgeId: string, name: string): void;
  endSpan(spanBridgeId: string, endTime: number): void;
  clearCompletedSpans(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  "ReactNativeTracerProviderModule",
);
