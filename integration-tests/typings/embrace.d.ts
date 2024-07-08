// Types here are a very simplified subset of the full Embrace SDK payload,
// add more properties as they become relevant for test specs, see:
// https://github.com/embrace-io/embrace-android-sdk/tree/master/embrace-android-sdk/src/main/java/io/embrace/android/embracesdk/payload

interface Session {
  as: string; // appState
}

interface EmbraceSpanEvent {
  name: string;
  time_unix_nano: number;
  attributes: Record<string, string>;
}

interface EmbraceSpanData {
  trace_id: string;
  span_id: string;
  parent_span_id: string;
  name: string;
  start_time_unix_nano: number;
  end_time_unix_nano: number;
  status: "UNSET" | "OK" | "ERROR";
  events: EmbraceSpanEvent[];
  attributes: Record<string, string>;
}

interface SessionMessage {
  s: Session;
  spans: EmbraceSpanData[];
}

interface EmbraceRequestBody {
  json: SessionMessage;
}

export type {
  EmbraceRequestBody,
  SessionMessage,
  Session,
  EmbraceSpanData,
  EmbraceSpanEvent,
};
