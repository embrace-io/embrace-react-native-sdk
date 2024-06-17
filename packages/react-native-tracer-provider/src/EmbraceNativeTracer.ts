import {
  Context,
  ContextManager,
  Span,
  SpanKind,
  SpanOptions,
  trace,
  Tracer,
} from '@opentelemetry/api';
import { EmbraceNativeSpan } from './EmbraceNativeSpan';
import { TracerProviderModule } from './TracerProviderModule';
import { SpanContextSyncBehaviour } from './types';
import { normalizeAttributes, normalizeLinks, normalizeTime } from './util';

/**
 * EmbraceNativeTracer implements a Tracer over the native Embrace Android and iOS SDKs.
 *
 * Communication with the native modules is asynchronous while the @opentelemetry/api interfaces are synchronous so spans
 * are returned immediately as simple objects that contain an ID for further communication with the native side.
 *
 * Since the notion of active context differs on the native side this tracer has its own context manager to handle the
 * active context on the JS side which can optionally be configured as the global context manager.
 *
 * The JS side of this implementation is modelled after [opentelemetry-sdk-trace-base](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-trace-base)
 */
export class EmbraceNativeTracer implements Tracer {
  private readonly name: string;
  private readonly version: string;
  private spansCreated: number;
  private readonly contextManager: ContextManager;
  private readonly spanContextSyncBehaviour: SpanContextSyncBehaviour;
  constructor(
    contextManager: ContextManager,
    spanContextSyncBehaviour: SpanContextSyncBehaviour,
    name: string,
    version?: string
  ) {
    this.name = name;
    this.version = version || '';
    this.spansCreated = 0;
    this.contextManager = contextManager;
    this.spanContextSyncBehaviour = spanContextSyncBehaviour;
  }

  public startSpan(name: string, options: SpanOptions = {}, context?: Context): Span {
    const { kind, attributes, links, startTime, root } = options;
    const parentSpan = trace.getSpan(
      context || this.contextManager.active()
    ) as EmbraceNativeSpan;
    const parentNativeID = (!root && parentSpan && parentSpan.nativeID()) || '';

    this.spansCreated += 1;
    const nativeSpan = new EmbraceNativeSpan(
      this.name,
      this.version,
      this.spansCreated,
      this.spanContextSyncBehaviour
    );

    nativeSpan.creatingNativeSide(
      TracerProviderModule.startSpan(
        this.name,
        this.version,
        nativeSpan.nativeID(),
        name,
        kind ? SpanKind[kind] : '',
        normalizeTime(startTime),
        normalizeAttributes(attributes),
        normalizeLinks(links),
        parentNativeID
      )
    );

    return nativeSpan;
  }

  public startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    fn: F
  ): ReturnType<F>;
  public startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    opts: SpanOptions,
    fn: F
  ): ReturnType<F>;
  public startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    opts: SpanOptions,
    ctx: Context,
    fn: F
  ): ReturnType<F>;
  public startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    arg2?: F | SpanOptions,
    arg3?: F | Context,
    arg4?: F
  ): ReturnType<F> | undefined {
    let opts: SpanOptions | undefined;
    let ctx: Context | undefined;
    let fn: F;

    if (arguments.length < 2) {
      return;
    } else if (arguments.length === 2) {
      fn = arg2 as F;
    } else if (arguments.length === 3) {
      opts = arg2 as SpanOptions | undefined;
      fn = arg3 as F;
    } else {
      opts = arg2 as SpanOptions | undefined;
      ctx = arg3 as Context | undefined;
      fn = arg4 as F;
    }
    // Taken from https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-sdk-trace-base/src/Tracer.ts#L226C1-L242C4

    const parentContext = ctx ?? this.contextManager.active();
    const span = this.startSpan(name, opts, parentContext);
    const contextWithSpanSet = trace.setSpan(parentContext, span);

    return this.contextManager.with(contextWithSpanSet, fn, undefined, span);
  }
}
