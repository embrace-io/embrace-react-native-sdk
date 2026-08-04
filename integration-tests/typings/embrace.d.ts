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

// Envelope-level metadata. User identity lands here rather than on span attributes.
// Android always adds locale/timezone_description and an SDK-injected "first_day" persona;
// iOS sends neither, so specs assert subsets rather than the whole object.
interface EmbracePayloadMetadata {
  user_id?: string;
  email?: string;
  username?: string;
  personas?: string[];
  timezone_description?: string;
  locale?: string;
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
  sessionMetadata: EmbracePayloadMetadata;
  ignored: EmbraceSpanData[];
}

type PayloadSection =
  | "sessionSpans"
  | "viewSpans"
  | "perfSpans"
  | "networkSpans"
  | "spanSnapshots"
  | "logs";

type Platform = "android" | "ios";

export type {
  EmbracePayload,
  EmbracePayloadMetadata,
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
  PayloadSection,
  Platform,
};
