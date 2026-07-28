import {endSession, tap} from "../helpers/app";
import {getPayloadSource} from "../helpers/payload_source";

describe("Network", () => {
  const source = getPayloadSource();

  beforeEach(async () => {
    await tap("NETWORK TESTING", 500);
  });

  it("intercepts automatic fetch requests", async () => {
    await tap("200 Request", 2000);
    await tap("404 Request", 2000);
    await endSession();

    const payload = await source.getPayloads();
    expect(payload.networkSpans).toMatchGoldenFile("network-auto", "networkSpans");
  });

  it("records manually reported requests and client errors", async () => {
    await tap("Record Network Request");
    await tap("Log Network Client Error");
    await endSession();

    const payload = await source.getPayloads();
    expect(payload.networkSpans).toMatchGoldenFile("network-manual", "networkSpans");
  });
});
