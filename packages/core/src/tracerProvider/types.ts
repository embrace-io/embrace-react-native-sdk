import {Tracer, TracerProvider} from "@opentelemetry/api";

/** @deprecated Returned only by the deprecated `useEmbraceNativeTracerProvider`. */
interface EmbraceNativeTracerProviderReturn {
  isLoading: boolean;
  isError: boolean;
  error: string;
  tracerProvider: TracerProvider | null;
  tracer: Tracer | null;
}

interface EmbraceNativeTracerProviderConfig {
  /** Determines the behaviour when a span's context is not currently available when grabbed synchronously */
  spanContextSyncBehaviour?: SpanContextSyncBehaviour;
  /** If true or omitted, the tracer provider will be registered globally with OpenTelemetry */
  registerGlobally?: boolean;
}

/**
 * Possible behaviours when a span context is not currently available from the native side:
 *  - return_empty: return a span context with blank strings for the span and trace IDs
 *  - throw: throw an error
 */
type SpanContextSyncBehaviour = "return_empty" | "throw";

export {
  EmbraceNativeTracerProviderReturn,
  EmbraceNativeTracerProviderConfig,
  SpanContextSyncBehaviour,
};
