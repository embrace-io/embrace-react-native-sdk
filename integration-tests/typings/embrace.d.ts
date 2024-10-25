// Types here are a very simplified subset of the full Embrace SDK payload,
// add more properties as they become relevant for test specs, see:
// https://github.com/embrace-io/embrace-android-sdk/blob/4a17932389328144ff3f7bd97b09f1dd79058e81/embrace-android-payload/src/main/kotlin/io/embrace/android/embracesdk/internal/payload/Envelope.kt
// https://github.com/embrace-io/embrace-android-sdk/blob/4a17932389328144ff3f7bd97b09f1dd79058e81/embrace-android-payload/src/main/kotlin/io/embrace/android/embracesdk/internal/payload/SessionPayload.kt
// https://github.com/embrace-io/embrace-android-sdk/blob/4a17932389328144ff3f7bd97b09f1dd79058e81/embrace-android-payload/src/main/kotlin/io/embrace/android/embracesdk/internal/payload/Span.kt

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
  sessionSpan: EmbraceSpanData;
  spanSnapshots: EmbraceSpanData[];
  privateSpans: EmbraceSpanData[];
  networkSpans: EmbraceSpanData[];
  viewSpans: EmbraceSpanData[];
  perfSpans: EmbraceSpanData[];
  perfSpanSnapshots: EmbraceSpanData[];
}

interface EmbracePayload {
  json: {
    resource: EmbracePayloadResource;
    metadata: EmbracePayloadMetadata;
    version: string;
    type: "spans"; // TODO logs
    data: EmbracePayloadSpans; // TODO logs
  };
}

interface EmbraceRequestBody {
  json: EmbracePayload;
}

interface Data {
  Body: string;
}
interface EmbraceData {
  Spans: IData[];
  Logs: IData[];
}

export type {
  EmbracePayload,
  EmbraceRequestBody,
  SessionPayload,
  Data,
  EmbraceData,
  EmbracePayloadSpans,
  EmbraceSpanData,
  EmbraceSpanAttribute,
  EmbraceSpanEvent,
  ParsedSpanPayload,
};
