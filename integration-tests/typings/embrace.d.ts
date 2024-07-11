// Types here are a very simplified subset of the full Embrace SDK payload,
// add more properties as they become relevant for test specs, see:
// https://github.com/embrace-io/embrace-android-sdk/blob/master/embrace-android-sdk/src/main/java/io/embrace/android/embracesdk/internal/payload/Envelope.kt
// https://github.com/embrace-io/embrace-android-sdk/blob/master/embrace-android-sdk/src/main/java/io/embrace/android/embracesdk/internal/payload/SessionPayload.kt
// https://github.com/embrace-io/embrace-android-sdk/blob/master/embrace-android-sdk/src/main/java/io/embrace/android/embracesdk/internal/payload/Span.kt

interface EmbraceSpanAttribute {
  key: string;
  value: string;
}

interface EmbraceSpanEvent {
  name: string;
  time_unix_nano: number;
  attributes: EmbraceSpanAttribute[];
}

interface EmbraceSpanData {
  trace_id: string;
  span_id: string;
  parent_span_id: string;
  name: string;
  start_time_unix_nano: number;
  end_time_unix_nano: number;
  status: "Unset" | "Ok" | "Error";
  events: EmbraceSpanEvent[];
  attributes: EmbraceSpanAttribute[];
}

interface EmbracePayloadSpans {
  spans: EmbraceSpanData[];
  span_snapshots: EmbraceSpanData[];
}

interface EmbracePayloadResource {
  // TODO
}

interface EmbracePayloadMetadata {
  // TODO
}

interface ParsedSpanPayload {
  sessionSpan: EmbraceSpanData,
  spanSnapshots: EmbraceSpanData[],
  privateSpans: EmbraceSpanData[],
  networkSpans: EmbraceSpanData[],
  userSpans: EmbraceSpanData[],
  userSpanSnapshots: EmbraceSpanData[],
}

interface EmbracePayload {
  json: {
    resource: EmbracePayloadResource
    metadata: EmbracePayloadMetadata
    version: string,
    type: "spans", // TODO logs
    data: EmbracePayloadSpans, // TODO logs
  }
}

export type {
  EmbracePayload,
  EmbracePayloadSpans,
  EmbraceSpanData,
  EmbraceSpanAttribute,
  EmbraceSpanEvent,
  ParsedSpanPayload,
};
