export interface EmbraceNativeTracerProviderConfig {
  /** Determines the behaviour when a span's context is not currently available when grabbed synchronously */
  spanContextSyncBehaviour?: SpanContextSyncBehaviour;

  setGlobalContextManager?: boolean;
}

/**
 * Possible behaviours when a span context is not currently available from the native side:
 *  - block: make a blocking synchronous call over the native bridge
 *  - return_empty: return a span context with blank strings for the span and trace IDs
 *  - throw: throw an error
 */
export type SpanContextSyncBehaviour = 'block' | 'return_empty' | 'throw';
