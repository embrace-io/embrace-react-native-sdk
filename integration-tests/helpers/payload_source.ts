import {
  EmbraceLogEnvelope,
  EmbraceSpanEnvelope,
  NormalizedPayloads,
} from "../typings/embrace";
import {localMockClient} from "./local_mock";
import {
  MockApiResponse,
  clearStoredRequests,
  retrieveStoredRequests,
} from "./mock_api";
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
    const stored = await this.settledResponse();
    // The service buckets by endpoint, so Spans holds /v2/spans envelopes and Logs /v2/logs.
    return normalizePayloads(
      stored.Spans.map(entry => entry.Body as EmbraceSpanEnvelope),
      stored.Logs.map(entry => entry.Body as EmbraceLogEnvelope),
    );
  }

  async clear(): Promise<void> {
    await clearStoredRequests(this.namespace);
  }

  // Return once the stored set holds steady across two polls. On timeout return whatever arrived
  // so the assertion reports the real mismatch ("missing span ...") rather than a bare timeout.
  private async settledResponse(): Promise<MockApiResponse> {
    const deadline = Date.now() + SETTLE_TIMEOUT_MS;
    let stored = await retrieveStoredRequests(this.namespace);
    let storedCount = stored.Logs.length + stored.Spans.length;

    while (Date.now() < deadline) {
      await sleep(SETTLE_INTERVAL_MS);
      const next = await retrieveStoredRequests(this.namespace);
      const count = next.Spans.length + next.Logs.length;
      if (count > 0 && count === storedCount) {
        return next;
      }
      stored = next;
      storedCount = count;
    }

    console.warn(
      `mock-api namespace "${this.namespace}" did not settle in ${SETTLE_TIMEOUT_MS}ms ` +
        `(${storedCount} request(s) stored)`,
    );
    return stored;
  }
}

// If the namespace is set, the test is running against the mock-api service. Unset means the local mockserver.
let payloadSource = process.env.MOCK_API_NAMESPACE ? new RemoteMockApiSource(process.env.MOCK_API_NAMESPACE) : new LocalMockServerSource();


export const getPayloadSource = (): PayloadSource => payloadSource;
