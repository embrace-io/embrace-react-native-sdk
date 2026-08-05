import {EmbraceLogEnvelope, EmbraceSpanEnvelope} from "../typings/embrace";

// The hosted mock-api service records everything the SDK POSTs, keyed by namespace:
//   GET    /namespace/<ns>/stored   -> {Logs, Spans}
//   DELETE /namespace/<ns>/stored   -> clears the namespace
const DEFAULT_MOCK_API_URL = "https://mock-api.emb-eng.com";

// A single stored request in the Mock API
interface StoredRequest<T> {
  Headers: Record<string, string[]>;
  Body: T;
  Timestamp: string;
}

// The parsed mock API response
export interface MockApiResponse {
  Logs: StoredRequest<EmbraceLogEnvelope>[];
  Spans: StoredRequest<EmbraceSpanEnvelope>[];
}

const storedUrl = (namespace: string): string =>
  `${process.env.MOCK_API_URL ?? DEFAULT_MOCK_API_URL}/namespace/${namespace}/stored`;

const RETRIES = 5;
const RETRY_DELAY_MS = 500;

// Requests are retried so a transient network blip does not become a spec failure.
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

const parseStoredRequests = (entries: StoredRequest<string>[] = []) =>
  entries
    .sort((a, b) => a.Timestamp.localeCompare(b.Timestamp))
    .map(entry => ({...entry, Body: JSON.parse(entry.Body)}));

// Everything the namespace holds, keyed by bucket, with every body parsed and each bucket's
// entries oldest first so their order matches the order the device sent them in.
export const retrieveStoredRequests = async (
  namespace: string,
): Promise<MockApiResponse> => {
  const response = await request(storedUrl(namespace));

  // 404 = nothing has been sent to this namespace yet, an expected state.
  if (response.status === 404) {
    return  { Logs: [], Spans: [] };
  }
  if (!response.ok) {
    throw new Error(
      `mock-api GET /namespace/${namespace}/stored failed: ${response.status} ${await response.text()}`,
    );
  }

  const raw = (await response.json()) as Record<string, StoredRequest<string>[]>;

  return {
    Logs: parseStoredRequests(raw.Logs),
    Spans: parseStoredRequests(raw.Spans),
  };
};

export const clearStoredRequests = async (namespace: string): Promise<void> => {
  const response = await request(storedUrl(namespace), {method: "DELETE"});

  // 404 = the namespace is already empty, which is what clearing is for.
  if (!response.ok && response.status !== 404) {
    throw new Error(`mock-api DELETE /namespace/${namespace}/stored failed: ${response.status}`);
  }
};
