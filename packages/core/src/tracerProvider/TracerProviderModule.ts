import {Attributes, Link, SpanContext} from "@opentelemetry/api";

import {getNativeModule} from "../utils/nativeModule";
import type {Spec} from "../NativeEmbraceTracerProvider";

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

const TracerProviderModule = getNativeModule<Spec>(
  "EmbraceTracerProvider",
) as NativeTracerProviderModule;

export {TracerProviderModule};
