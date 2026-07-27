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

interface EmbraceSpanLink {
  span_id: string;
  trace_id: string;
  attributes: EmbraceSpanAttribute[];
  is_remote?: boolean;
}

interface EmbraceSpanData {
  trace_id: string;
  span_id: string;
  parent_span_id?: string;
  name: string;
  start_time_unix_nano: number;
  end_time_unix_nano: number;
  status: string;
  events: EmbraceSpanEvent[];
  attributes: EmbraceSpanAttribute[];
  links?: EmbraceSpanLink[];
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

interface EmbracePayload {
  json: {
    resource: EmbracePayloadResource;
    metadata: EmbracePayloadMetadata;
    version: string;
    type: "spans"; // TODO logs
    data: EmbracePayloadSpans; // TODO logs
  };
}

interface EmbraceLogRecord {
  body: string;
  severity_number: number;
  severity_text: string;
  time_unix_nano: number;
  attributes: EmbraceSpanAttribute[];
}

interface EmbracePayloadLogs {
  logs: EmbraceLogRecord[];
}

interface EmbraceSpanEnvelope {
  resource: EmbracePayloadResource;
  metadata: EmbracePayloadMetadata;
  version: string;
  type: string;
  data: EmbracePayloadSpans;
}

interface EmbraceLogEnvelope {
  resource: EmbracePayloadResource;
  metadata: EmbracePayloadMetadata;
  version: string;
  type: string;
  data: EmbracePayloadLogs;
}

interface NormalizedPayloads {
  sessionSpans: EmbraceSpanData[];
  viewSpans: EmbraceSpanData[];
  perfSpans: EmbraceSpanData[];
  networkSpans: EmbraceSpanData[];
  spanSnapshots: EmbraceSpanData[];
  logs: EmbraceLogRecord[];
  ignored: EmbraceSpanData[];
}

type Platform = "android" | "ios";

export type {
  EmbracePayload,
  EmbracePayloadSpans,
  EmbraceSpanData,
  EmbraceSpanAttribute,
  EmbraceSpanEvent,
  EmbraceSpanLink,
  EmbraceLogRecord,
  EmbracePayloadLogs,
  EmbraceSpanEnvelope,
  EmbraceLogEnvelope,
  NormalizedPayloads,
  Platform,
};
