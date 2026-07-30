// The hosted mock-api service records everything the SDK POSTs, keyed by namespace:
//   GET    /namespace/<ns>/stored   -> {Blobs, Crashes, Events, Logs, Sessions, Spans, Errors}
//   DELETE /namespace/<ns>/stored   -> clears the namespace
// Both 404 while the namespace has never received data. Stored data ages out after 7 days.
// See "Using the Hosted mock-api Service.md" and golden/remote-stored-shape.json.
const DEFAULT_MOCK_API_URL = "https://mock-api.emb-eng.com";

// One recorded request. Body is the request body as a JSON string (the service decompresses gzip
// before storing); Timestamp is RFC3339 with a fixed Z offset, so it sorts as a string.
export interface StoredEntry {
  Headers: Record<string, string[]>;
  Body: string;
  Timestamp: string;
}

const storedUrl = (namespace: string): string =>
  `${process.env.MOCK_API_URL ?? DEFAULT_MOCK_API_URL}/namespace/${namespace}/stored`;

// Every request the namespace holds, oldest first, across all buckets.
export const retrieveStored = async (namespace: string): Promise<StoredEntry[]> => {
  const response = await fetch(storedUrl(namespace));

  // 404 = nothing has been sent to this namespace yet, an expected state.
  if (response.status === 404) {
    return [];
  }
  if (!response.ok) {
    throw new Error(
      `mock-api GET /stored failed: ${response.status} ${await response.text()}`,
    );
  }

  const buckets = (await response.json()) as Record<string, StoredEntry[] | null>;
  return Object.values(buckets)
    .filter(bucket => Array.isArray(bucket))
    .flat()
    .sort((a, b) => a.Timestamp.localeCompare(b.Timestamp));
};

export const clearStored = async (namespace: string): Promise<void> => {
  const response = await fetch(storedUrl(namespace), {method: "DELETE"});

  // 404 = the namespace is already empty, which is what clearing is for.
  if (!response.ok && response.status !== 404) {
    throw new Error(`mock-api DELETE /stored failed: ${response.status}`);
  }
};
