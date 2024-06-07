// Types here are a very simplified subset of the full Embrace SDK payload,
// add more properties as they become relevant for test specs, see:
// https://github.com/embrace-io/embrace-android-sdk/tree/master/embrace-android-sdk/src/main/java/io/embrace/android/embracesdk/payload

interface SessionPayload {
  as: string; // appState
}

interface EmbracePayload {
  s: SessionPayload;
}

interface EmbraceRequestBody {
  json: EmbracePayload;
}

export type { EmbraceRequestBody, SessionPayload };
