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

interface EmbraceLogData {
  trace_id: string;
  severity_number: number;
  severity_text: string;
  body: string;
  time_unix_nano: number;
  status: "Unset" | "Ok" | "Error";
  events: EmbraceSpanEvent[];
  attributes: EmbraceSpanAttribute[];
}

interface ParsedLogPayload {
  resource?: EmbracePayloadResource;
  metadata?: EmbracePayloadMetadata;
  info: EmbraceLogData[];
  warn: EmbraceLogData[];
  error: EmbraceLogData[];
}
interface EmbracePayloadLogs {
  data: {logs: EmbraceLogData[]};
  metadata: EmbracePayloadMetadata;
  resource: EmbracePayloadResource;
}

interface EmbracePayloadSpans {
  spans: EmbraceSpanData[];
  span_snapshots: EmbraceSpanData[];
}

interface EmbracePayloadResource {
  app_version: string;
  environment_detail: string;
  environment: string;
  environment: string;
  device_architecture: string;
  os_build: string;
  disk_total_capacity: string;
  device_model: string;
  app_bundle_id: string;
  bundle_version: string;
  build_id: string;
  process_start_time: number;
  jailbroken: boolean;
  os_version: string;
  sdk_version: string;
  process_identifier: string;
  os_name: string;
  hosted_sdk_version: string;
  app_framework: number;
  device_manufacturer: string;
  os_alternate_type: string;
  hosted_platform_version: string;
  type: string;
  version: string;
}

interface EmbracePayloadMetadata {
  personas: string[];
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

export type {
  EmbracePayload,
  EmbracePayloadSpans,
  EmbraceSpanData,
  EmbraceSpanAttribute,
  EmbraceSpanEvent,
  ParsedSpanPayload,
  EmbracePayloadLogs,
  EmbraceLogData,
  ParsedLogPayload,
};
