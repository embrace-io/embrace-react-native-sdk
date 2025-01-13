import {Tracer, Span} from "@opentelemetry/api";

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
