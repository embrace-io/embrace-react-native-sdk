import {
  context,
  ContextManager,
  Tracer,
  TracerProvider,
} from '@opentelemetry/api';
import { EmbraceNativeTracer } from './EmbraceNativeTracer';
import { StackContextManager } from './StackContextManager';
import { TracerProviderModule } from './TracerProviderModule';
import {
  EmbraceNativeTracerProviderConfig,
  SpanContextSyncBehaviour,
} from './types';

/**
 * EmbraceNativeTracerProvider implements a TracerProvider over the native Embrace Android and iOS SDKs.
 * Thin wrapped objects representing Tracers and Spans are maintained at the JS level and use Native Modules to
 * call down to the SDKs to perform the actual operations on them.
 *
 * The JS side of this implementation is modelled after [opentelemetry-sdk-trace-base](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-trace-base)
 */
export class EmbraceNativeTracerProvider implements TracerProvider {
  private readonly contextManager: ContextManager;
  private readonly spanContextSyncBehaviour: SpanContextSyncBehaviour;

  constructor(
    config: EmbraceNativeTracerProviderConfig = {
      setGlobalContextManager: true,
    }
  ) {
    this.contextManager = new StackContextManager();
    this.contextManager.enable();

    if (config.setGlobalContextManager) {
      context.setGlobalContextManager(this.contextManager);
    }

    this.spanContextSyncBehaviour = config.spanContextSyncBehaviour || 'block';
  }

  public getTracer(
    name: string,
    version?: string,
    options?: { schemaUrl?: string }
  ): Tracer {
    const schemaUrl = options?.schemaUrl || '';
    const tracerVersion = version || '';
    TracerProviderModule.getTracer(name, tracerVersion, schemaUrl);
    return new EmbraceNativeTracer(
      this.contextManager,
      this.spanContextSyncBehaviour,
      name,
      tracerVersion,
      schemaUrl,
    );
  }
}
