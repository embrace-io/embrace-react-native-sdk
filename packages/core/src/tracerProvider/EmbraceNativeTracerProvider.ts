import {AppState, Platform} from "react-native";
import {
  context,
  ContextManager,
  Tracer,
  TracerProvider,
} from "@opentelemetry/api";

import {logWarning} from "./util";
import {
  EmbraceNativeTracerProviderConfig,
  SpanContextSyncBehaviour,
} from "./types";
import {TracerProviderModule} from "./TracerProviderModule";
import {StackContextManager} from "./StackContextManager";
import {EmbraceNativeTracer} from "./EmbraceNativeTracer";

/**
 * EmbraceNativeTracerProvider implements a TracerProvider over the native Embrace Android and iOS SDKs.
 * Thin wrapped objects representing Tracers and Spans are maintained at the JS level and use Native Modules to
 * call down to the SDKs to perform the actual operations on them.
 *
 * The JS side of this implementation is modelled after [opentelemetry-sdk-trace-base](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-trace-base)
 */
class EmbraceNativeTracerProvider implements TracerProvider {
  private readonly contextManager: ContextManager;
  private readonly spanContextSyncBehaviour: SpanContextSyncBehaviour;

  constructor(
    config: EmbraceNativeTracerProviderConfig = {
      setGlobalContextManager: true,
    },
  ) {
    this.contextManager = new StackContextManager();
    this.contextManager.enable();

    if (config.setGlobalContextManager) {
      context.setGlobalContextManager(this.contextManager);
    }

    this.spanContextSyncBehaviour =
      config.spanContextSyncBehaviour || "return_empty";

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

    if (schemaUrl && Platform.OS === "ios") {
      logWarning("`schemaUrl` is ignored when running on iOS");
    }

    TracerProviderModule.setupTracer(name, tracerVersion, schemaUrl);
    return new EmbraceNativeTracer(
      this.contextManager,
      this.spanContextSyncBehaviour,
      name,
      tracerVersion,
      schemaUrl,
    );
  }
}

export {EmbraceNativeTracerProvider};
