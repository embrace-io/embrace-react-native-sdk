import {
  Tracer,
  Span,
  SpanStatusCode,
  context,
  trace,
  SpanOptions,
  TimeInput,
  Attributes,
  SpanStatus,
} from "@opentelemetry/api";

/**
 * startView uses the given tracer to create a span that follows Embrace's semantics for representing a view
 */
export const startView = (tracer: Tracer, viewName: string): Span =>
  tracer.startSpan("emb-screen-view", {
    attributes: {
      "view.name": viewName,
      "emb.type": "ux.view",
    },
  });

/**
 * endAsFailed offers a shortcut for setting the span's status as ERROR and then ending it
 */
export const endAsFailed = (span: Span) => {
  span.setStatus({code: SpanStatusCode.ERROR});
  span.end();
};

/**
 * asParent puts the given span into a context that can then be used as an argument to a tracer's
 * `startSpan` call, e.g.: `tracer.startSpan("the-child", {}, asParent(parentSpan));`
 */
export const asParent = (span: Span) => trace.setSpan(context.active(), span);

/**
 * recordCompletedSpan starts and then immediately stops a span, forwarding on the given options to invocations
 * of `startSpan`, `addEvent`, `setStatus`, and `end` as appropriate
 */

export type CompletedSpanOptions = SpanOptions & {
  parent?: Span;
  events?: {
    name: string;
    attributes?: Attributes;
    timeStamp?: TimeInput;
  }[];
  status?: SpanStatus;
  endTime?: TimeInput;
};

export const recordCompletedSpan = (
  tracer: Tracer,
  name: string,
  options: CompletedSpanOptions = {},
) => {
  const span = tracer.startSpan(
    name,
    {
      kind: options.kind,
      attributes: options.attributes,
      links: options.links,
      startTime: options.startTime,
      root: options.root,
    },
    options.parent ? asParent(options.parent) : undefined,
  );

  if (options.events) {
    options.events.forEach(e =>
      span.addEvent(e.name, e.attributes, e.timeStamp),
    );
  }

  if (options.status) {
    span.setStatus(options.status);
  }

  span.end(options.endTime);
};
