/**
 * These helpers setup scenarios for testing the associated payloads that get generated from them in
 * integration-tests/specs/*.test.ts.
 *
 * Ideally this test app would just expose simple buttons and inputs for starting spans, setting attributes, etc.
 * and then the test spec would include both the setup and the assertions. However, in practice the UI that would be
 * needed to recreate these scenarios ends up being quite complex, so we compromise a bit of readability here and split
 * the test setup and assertions between these two spots
 */

/* 'use strict'; */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  context,
  SpanContext,
  SpanKind,
  SpanStatusCode,
  trace,
  Tracer,
} from "@opentelemetry/api";
import {EmbraceNativeSpan} from "@embrace-io/react-native-tracer-provider";

export function generateBasicSpan(tracer: Tracer) {
  const span1 = tracer.startSpan("test-1");
  span1.end();
}

export async function generateTestSpans(tracer: Tracer) {
  const span1 = tracer.startSpan("test-1");
  // Kind is not included in Embrace payload and shouldn't affect output
  const span2 = tracer.startSpan("test-2", {kind: SpanKind.CLIENT});
  const span3 = tracer.startSpan("test-3");
  // End time before start time records as normal in the Embrace payload
  tracer.startSpan("test-4").end(new Date("2024-03-03T00:00:00Z"));
  // Not ended span will be included as a span snapshot in the payload
  tracer.startSpan("test-5");

  // Set some attributes
  span1.setAttributes({
    "string-attr": "my-attr",
    "number-attr": 22,
  });
  span1.setAttribute("bool-attr", true);

  // Misc updates
  span1.setStatus({code: SpanStatusCode.OK, message: "ok span"});
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
    {"test-2-event-attr": "my-event-attr"},
    1700009002000,
  );
  // Future end time should be allowed
  span2.end(new Date("2099-01-01T00:00:00Z"));

  // Links are not included in the Embrace payload
  const span1Context = await (span1 as EmbraceNativeSpan).spanContextAsync();
  const span2Context = await (span2 as EmbraceNativeSpan).spanContextAsync();
  span3.addLink({context: span1Context});
  span3.addLinks([
    {
      context: span2Context,
      attributes: {"test-3-link-attr": "my-link-attr"},
    },
  ]);
  span3.recordException({message: "span exception"});
  span3.end();
}

export function generateNestedSpans(tracer: Tracer) {
  const span1 = tracer.startSpan("test-1");
  const contextWithSpan1 = trace.setSpan(context.active(), span1);
  const span2 = tracer.startSpan(
    "test-2",
    {attributes: {"test-2-attr": "my-attr"}},
    contextWithSpan1,
  );
  const span3 = tracer.startSpan(
    "test-3",
    {attributes: {"test-3-attr": "my-attr"}, root: true},
    contextWithSpan1,
  );

  tracer.startActiveSpan("test-4", span4 => {
    const span5 = tracer.startSpan("test-5");
    span5.end();

    span4.end();
  });
  span1.end();
  span2.end();
  span3.end();

  // Parent span ID should still be set if the parent was already ended
  tracer.startSpan("test-6", {}, contextWithSpan1).end();
}
