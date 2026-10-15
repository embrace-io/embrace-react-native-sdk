import {context, trace, TracerProvider} from "@opentelemetry/api";

import EmbraceLogger from "../utils/EmbraceLogger";

import {EmbraceNativeTracerProviderConfig} from "./types";
import {EmbraceNativeTracerProvider} from "./EmbraceNativeTracerProvider";

const logger = new EmbraceLogger(console);

let provider: EmbraceNativeTracerProvider | undefined;

const registerTracerProvider = (
  config: EmbraceNativeTracerProviderConfig = {},
): TracerProvider => {
  if (provider) {
    return provider;
  }

  provider = new EmbraceNativeTracerProvider(config.spanContextSyncBehaviour);

  if (config.registerGlobally === false) {
    return provider;
  }

  if (!context.setGlobalContextManager(provider.contextManager)) {
    logger.warn(
      "Could not register the Embrace context manager as the global OpenTelemetry context manager. Active Embrace spans will not be visible through `context.active()` or `trace.getActiveSpan()`.",
    );
  }

  if (!trace.setGlobalTracerProvider(provider)) {
    logger.warn(
      "Could not register the Embrace tracer provider as the global OpenTelemetry tracer provider. Spans from `trace.getTracer()` will not reach Embrace.",
    );
  }

  return provider;
};

export {registerTracerProvider};
