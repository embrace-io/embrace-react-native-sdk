import {EmbraceEnvelope} from "../typings/embrace";

// The hosted mock-api service records everything the SDK POSTs, keyed by namespace:
//   GET    /namespace/<ns>/stored   -> {Blobs, Crashes, Events, Logs, Sessions, Spans, Errors}
//   DELETE /namespace/<ns>/stored   -> clears the namespace
// Both 404 while the namespace has never received data. Stored data ages out after 7 days.
// See "Using the Hosted mock-api Service.md" and golden/remote-stored-shape.json.
const DEFAULT_MOCK_API_URL = "https://mock-api.emb-eng.com";

// A recorded request as the service returns it: the body is a JSON string (it decompresses gzip
// before storing) and Timestamp is RFC3339 with a fixed Z offset, so it sorts as a string.
interface RawStoredEntry {
  Headers: Record<string, string[]>;
  Body: string;
  Timestamp: string;
}

// The same entry with its body parsed, so callers deal in readable JSON rather than an escaped string.
export interface StoredEntry extends Omit<RawStoredEntry, "Body"> {
  Body: EmbraceEnvelope;
}

const storedUrl = (namespace: string): string =>
  `${process.env.MOCK_API_URL ?? DEFAULT_MOCK_API_URL}/namespace/${namespace}/stored`;

const RETRIES = 5;
const RETRY_DELAY_MS = 500;

// Retry so a transient network blip does not become a spec failure. fetch rejects with a bare
// "fetch failed" and puts the real reason on `cause`, so report that too.
const request = async (url: string, init?: RequestInit): Promise<Response> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      return await fetch(url, init);
    } catch (e) {
      lastError = e;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  const {message, cause} = lastError as Error;
  throw new Error(
    `mock-api request to ${url} failed after ${RETRIES + 1} attempts: ${message} (cause: ${cause})`,
  );
};

// Every request the namespace holds, oldest first, across all buckets.
export const retrieveStored = async (namespace: string): Promise<StoredEntry[]> => {
  const response = await request(storedUrl(namespace));

  // 404 = nothing has been sent to this namespace yet, an expected state.
  if (response.status === 404) {
    return [];
  }
  if (!response.ok) {
    throw new Error(
      `mock-api GET /stored failed: ${response.status} ${await response.text()}`,
    );
  }

  const buckets = (await response.json()) as Record<string, RawStoredEntry[] | null>;
  return Object.values(buckets)
    .filter(bucket => Array.isArray(bucket))
    .flat()
    .sort((a, b) => a.Timestamp.localeCompare(b.Timestamp))
    .map(entry => ({...entry, Body: JSON.parse(entry.Body) as EmbraceEnvelope}));
};

export const clearStored = async (namespace: string): Promise<void> => {
  const response = await request(storedUrl(namespace), {method: "DELETE"});

  // 404 = the namespace is already empty, which is what clearing is for.
  if (!response.ok && response.status !== 404) {
    throw new Error(`mock-api DELETE /stored failed: ${response.status}`);
  }
};
