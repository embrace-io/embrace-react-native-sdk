import {AppState, Platform} from "react-native";
import {ContextManager, Tracer, TracerProvider} from "@opentelemetry/api";

import EmbraceLogger from "../utils/EmbraceLogger";

import {SpanContextSyncBehaviour} from "./types";
import {TracerProviderModule} from "./TracerProviderModule";
import {StackContextManager} from "./StackContextManager";
import {EmbraceNativeTracer} from "./EmbraceNativeTracer";

const logger = new EmbraceLogger(console);

/**
 * EmbraceNativeTracerProvider implements a TracerProvider over the native Embrace Android and iOS SDKs.
 * Thin wrapped objects representing Tracers and Spans are maintained at the JS level and use Native Modules to
 * call down to the SDKs to perform the actual operations on them.
 *
 * The JS side of this implementation is modelled after [opentelemetry-sdk-trace-base](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-trace-base)
 */
class EmbraceNativeTracerProvider implements TracerProvider {
  public readonly contextManager: ContextManager =
    new StackContextManager().enable();
  private readonly spanContextSyncBehaviour: SpanContextSyncBehaviour;
  private readonly tracers = new Map<string, EmbraceNativeTracer>();

  constructor(
    spanContextSyncBehaviour: SpanContextSyncBehaviour = "return_empty",
  ) {
    this.spanContextSyncBehaviour = spanContextSyncBehaviour;

    AppState.addEventListener("change", () => {
      // Embrace ends the current session when the app switches between foreground and background, at that point
      // we can clear any completed spans from memory as they won't be valid to reference anymore
      TracerProviderModule.clearCompletedSpans();
    });
  }

  public getTracer(
    name: string,
    version?: string,
    options?: {schemaUrl?: string},
  ): Tracer {
    const schemaUrl = options?.schemaUrl || "";
    const tracerVersion = version || "";
    const key = JSON.stringify([name, tracerVersion, schemaUrl]);

    const cached = this.tracers.get(key);
    if (cached) {
      return cached;
    }

    if (schemaUrl && Platform.OS === "ios") {
      logger.warn("`schemaUrl` is ignored when running on iOS");
    }

    TracerProviderModule.setupTracer(name, tracerVersion, schemaUrl);
    const tracer = new EmbraceNativeTracer(
      this.contextManager,
      this.spanContextSyncBehaviour,
      name,
      tracerVersion,
      schemaUrl,
    );
    this.tracers.set(key, tracer);

    return tracer;
  }
}

export {EmbraceNativeTracerProvider};
