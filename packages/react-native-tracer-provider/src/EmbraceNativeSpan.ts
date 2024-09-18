import {Link} from "@opentelemetry/api/build/src/trace/link";
import {
  Attributes,
  AttributeValue,
  Exception,
  Span,
  SpanContext,
  SpanStatus,
  SpanStatusCode,
  TimeInput,
} from "@opentelemetry/api";

import {
  isAttributes,
  logWarning,
  normalizeAttributes,
  normalizeLinks,
  normalizeTime,
} from "./util";
import {SpanContextSyncBehaviour} from "./types";
import {TracerProviderModule} from "./TracerProviderModule";

/**
 * EmbraceNativeSpan implements a Span over the native Embrace Android and iOS SDKs.
 *
 * A handful of simple attributes are maintained on the JS side for each span including a unique ID based on the
 * tracer's name and version which is used in calls over the bridge to the native modules to perform the actual operations
 * on the span
 *
 * The JS side of this implementation is modelled after [opentelemetry-sdk-trace-base](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-trace-base)
 */
export class EmbraceNativeSpan implements Span {
  private readonly tracerName: string;
  private readonly tracerVersion: string;
  private readonly tracerSchemaUrl: string;
  private readonly createdIndex: number;
  private readonly spanContextSyncBehaviour: SpanContextSyncBehaviour;
  private recording: boolean = true;
  private savedSpanContext: SpanContext | null = null;
  private creating: Promise<SpanContext> | null = null;

  constructor(
    tracerName: string,
    tracerVersion: string,
    tracerSchemaUrl: string,
    createdIndex: number,
    spanContextSyncBehaviour: SpanContextSyncBehaviour,
  ) {
    this.tracerName = tracerName;
    this.tracerVersion = tracerVersion;
    this.tracerSchemaUrl = tracerSchemaUrl;
    this.createdIndex = createdIndex;
    this.spanContextSyncBehaviour = spanContextSyncBehaviour;
  }

  public nativeID(): string {
    return `${this.tracerName}_${this.tracerVersion}_${this.tracerSchemaUrl}_${this.createdIndex}`;
  }

  public creatingNativeSide(creating: Promise<SpanContext>) {
    this.creating = creating;
    this.creating.then((spanContext: SpanContext) => {
      this.savedSpanContext = spanContext;
    });
  }

  public isReadonly() {
    return !this.recording;
  }

  /**
   * The fact that native module calls are asynchronous and the @opentelemetry/api is synchronous doesn't matter for
   * most methods as they are generally fire and forget. Getting spanContext is an exception since this could be asked
   * for immediately after having started a span and if the value is not yet ready on the native side we will either:
   *  - return a blank span context
   *  - throw an error
   *
   * Behaviour can be configured on the EmbraceNativeTracerProvider by supplying spanContextSyncBehaviour
   */
  public spanContext(): SpanContext {
    if (this.savedSpanContext) {
      return this.savedSpanContext;
    }

    const msg =
      "Span context is not yet available on the native side." +
      " You can wait on it with: `await (span as EmbraceNativeSpan).spanContextAsync()`.";

    switch (this.spanContextSyncBehaviour) {
      case "return_empty":
        logWarning(msg + " Returning a blank SpanContext");
        return {
          traceId: "",
          spanId: "",
          traceFlags: 0,
        };
      case "throw":
        throw new Error(msg);
    }
  }

  /**
   * spanContextAsync provides an async alternative to spanContext by wrapping the response in a promise
   */
  public spanContextAsync(): Promise<SpanContext> {
    return this.creating || Promise.reject("failed to retrieve span context");
  }

  public setAttribute(key: string, value: AttributeValue): this {
    return this.setAttributes({[key]: value});
  }

  public setAttributes(attributes: Attributes): this {
    if (this.isReadonly()) {
      return this;
    }
    TracerProviderModule.setAttributes(
      this.nativeID(),
      normalizeAttributes(attributes),
    );
    return this;
  }

  public addEvent(
    name: string,
    attributesOrStartTime?: Attributes | TimeInput,
    timeStamp?: TimeInput,
  ): this {
    if (this.isReadonly()) {
      return this;
    }

    if (isAttributes(attributesOrStartTime)) {
      TracerProviderModule.addEvent(
        this.nativeID(),
        name,
        normalizeAttributes(attributesOrStartTime),
        normalizeTime(timeStamp),
      );
    } else {
      TracerProviderModule.addEvent(
        this.nativeID(),
        name,
        normalizeAttributes({}),
        normalizeTime(attributesOrStartTime),
      );
    }

    return this;
  }

  public addLink(link: Link): this {
    return this.addLinks([link]);
  }

  public addLinks(links: Link[]): this {
    if (this.isReadonly()) {
      return this;
    }

    logWarning(
      "Adding span links is not currently supported by the Embrace SDK",
    );
    TracerProviderModule.addLinks(this.nativeID(), normalizeLinks(links));

    return this;
  }

  public setStatus(status: SpanStatus): this {
    if (this.isReadonly()) {
      return this;
    }

    TracerProviderModule.setStatus(this.nativeID(), {
      code: SpanStatusCode[status.code],
      message: status.message,
    });

    return this;
  }

  public updateName(name: string): this {
    if (this.isReadonly()) {
      return this;
    }

    TracerProviderModule.updateName(this.nativeID(), name);

    return this;
  }

  public end(endTime?: TimeInput): void {
    if (this.isReadonly()) {
      return;
    }

    TracerProviderModule.endSpan(this.nativeID(), normalizeTime(endTime));
    this.recording = false;
  }

  public isRecording(): boolean {
    return this.recording;
  }

  public recordException(exception: Exception, time?: TimeInput): void {
    if (this.isReadonly()) {
      return;
    }

    // See:
    // https://opentelemetry.io/docs/specs/semconv/exceptions/exceptions-spans/
    // https://github.com/open-telemetry/opentelemetry-js/blob/4fa7c1358e84287079a5cba95313d42b50cfcb91/packages/opentelemetry-sdk-trace-base/src/Span.ts#L303
    const attributes: Attributes = {};
    if (typeof exception === "string") {
      attributes["exception.message"] = exception;
    } else if (exception) {
      if (exception.code) {
        attributes["exception.type"] = exception.code.toString();
      } else if (exception.name) {
        attributes["exception.type"] = exception.name;
      }
      if (exception.message) {
        attributes["exception.message"] = exception.message;
      }
      if (exception.stack) {
        attributes["exception.stacktrace"] = exception.stack;
      }
    }

    TracerProviderModule.addEvent(
      this.nativeID(),
      "exception",
      normalizeAttributes(attributes),
      normalizeTime(time),
    );
  }
}
