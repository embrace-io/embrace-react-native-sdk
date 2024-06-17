/* 'use strict'; */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  context,
  SpanKind,
  SpanStatusCode,
  trace,
  Tracer,
} from "@opentelemetry/api";

export function generateTestSpans(tracer: Tracer) {
  const span1 = tracer.startSpan("test-1");
  const span2 = tracer.startSpan("test-2", { kind: SpanKind.CLIENT });
  const span3 = tracer.startSpan("test-3");
  // Not ended so shouldn't be part of the output
  tracer.startSpan("test-4");

  // Set some attributes
  span1.setAttributes({
    "string-attr": "my-attr",
    "number-attr": 22,
  });
  span1.setAttribute("bool-attr", true);

  // Misc updates
  span1.setStatus({ code: SpanStatusCode.OK, message: "ok span" });
  span1.updateName("test-1-updated");

  // Make sure isRecording reports correctly
  if (span1.isRecording()) {
    span1.end();
  }
  if (span1.isRecording()) {
    span1.setAttribute("after-recording", "should not exist");
  }

  // Add some span events
  span2.addEvent("test-2-event-1");
  span2.addEvent("test-2-event-2", 1700001002000);
  span2.addEvent(
    "test-2-event-3",
    { "test-2-event-attr": "my-event-attr" },
    1700009002000
  );
  span2.end(new Date("2099-01-01T00:00:00Z"));

  // Add some links
  span3.addLink({ context: span1.spanContext() });
  span3.addLinks([
    {
      context: span2.spanContext(),
      attributes: { "test-3-link-attr": "my-link-attr" },
    },
  ]);
  span3.recordException({ message: "span exception" });
  span3.end();
}

export function generateNestedSpans(tracer: Tracer) {
  const span1 = tracer.startSpan("test-1");
  const span1Context = trace.setSpan(context.active(), span1);
  const span2 = tracer.startSpan(
    "test-2",
    { attributes: { "test-2-attr": "my-attr" } },
    span1Context
  );
  const span3 = tracer.startSpan(
    "test-3",
    { attributes: { "test-3-attr": "my-attr" }, root: true },
    span1Context
  );

  tracer.startActiveSpan("test-4", (span4) => {
    const span5 = tracer.startSpan("test-5");
    span5.end();

    span4.end();
  });
  span1.end();
  span2.end();
  span3.end();
}
