import {
  EmbraceLogEnvelope,
  EmbraceSpanEnvelope,
  NormalizedPayloads,
} from "../typings/embrace";
import {localMockClient} from "./local_mock";
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

const localSource = new LocalMockServerSource();

// Selects the payload backend (currently only the local mockserver implementation)
export const getPayloadSource = (): PayloadSource => localSource;
