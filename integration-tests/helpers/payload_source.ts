import {
  EmbraceLogEnvelope,
  EmbraceSpanEnvelope,
  NormalizedPayloads,
} from "../typings/embrace";
import {localMockClient} from "./local_mock";
import {StoredEntry, clearStored, retrieveStored} from "./mock_api";
import {normalizePayloads} from "./normalize";
export interface PayloadSource {
  getPayloads(): Promise<NormalizedPayloads>;
  clear(): Promise<void>;
}

// Reads captured payloads from the local mockserver-node used by wdio.conf.ts.
export class LocalMockServerSource implements PayloadSource {
  private client = localMockClient();

  private async envelopes<T>(path: string): Promise<T[]> {
    const requests = await this.client.retrieveRecordedRequests({
      path,
      method: "POST",
    });
    return requests.map(r => (r.body as {json: T}).json);
  }

  async getPayloads(): Promise<NormalizedPayloads> {
    const spans = await this.envelopes<EmbraceSpanEnvelope>("/v2/spans");
    const logs = await this.envelopes<EmbraceLogEnvelope>("/v2/logs");
    return normalizePayloads(spans, logs);
  }

  async clear(): Promise<void> {
    await this.client.clear({}, "LOG");
  }
}

type EmbraceEnvelope = EmbraceSpanEnvelope | EmbraceLogEnvelope;

// Dispatch on the payload's own shape rather than the /stored bucket it came from: `Spans` is
// confirmed to hold span envelopes, but where log envelopes land has not been observed.
const isSpanEnvelope = (envelope: EmbraceEnvelope): envelope is EmbraceSpanEnvelope =>
  "spans" in (envelope.data ?? {}) || "span_snapshots" in (envelope.data ?? {});

const isLogEnvelope = (envelope: EmbraceEnvelope): envelope is EmbraceLogEnvelope =>
  "logs" in (envelope.data ?? {});

// How long to wait for a flushed payload to reach the hosted service, and how often to re-check.
// Locally the payload is on the server ~1s after backgrounding; remotely it is a device -> service
// round trip, so wait for delivery to finish rather than assuming it has.
const SETTLE_TIMEOUT_MS = 30_000;
const SETTLE_INTERVAL_MS = 1_000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Reads captured payloads from the hosted mock-api used by browserstack.conf.ts.
export class RemoteMockApiSource implements PayloadSource {
  constructor(private readonly namespace: string) {}

  async getPayloads(): Promise<NormalizedPayloads> {
    const envelopes = (await this.settledEntries()).map(
      entry => JSON.parse(entry.Body) as EmbraceEnvelope,
    );
    return normalizePayloads(
      envelopes.filter(isSpanEnvelope),
      envelopes.filter(isLogEnvelope),
    );
  }

  async clear(): Promise<void> {
    await clearStored(this.namespace);
  }

  // Return once the stored set holds steady across two polls. On timeout return whatever arrived
  // so the assertion reports the real mismatch ("missing span ...") rather than a bare timeout.
  private async settledEntries(): Promise<StoredEntry[]> {
    const deadline = Date.now() + SETTLE_TIMEOUT_MS;
    let entries = await retrieveStored(this.namespace);

    while (Date.now() < deadline) {
      await sleep(SETTLE_INTERVAL_MS);
      const next = await retrieveStored(this.namespace);
      if (next.length > 0 && next.length === entries.length) {
        return next;
      }
      entries = next;
    }

    console.warn(
      `mock-api namespace "${this.namespace}" did not settle in ${SETTLE_TIMEOUT_MS}ms ` +
        `(${entries.length} request(s) stored)`,
    );
    return entries;
  }
}

const localSource = new LocalMockServerSource();
let remoteSource: RemoteMockApiSource | undefined;

// The namespace is baked into the app under test at build time, so a run that has one is by
// definition reporting to the hosted mock-api. Unset means the local mockserver.
export const getPayloadSource = (): PayloadSource => {
  const namespace = process.env.MOCK_API_NAMESPACE;
  if (!namespace) {
    return localSource;
  }
  remoteSource ??= new RemoteMockApiSource(namespace);
  return remoteSource;
};
