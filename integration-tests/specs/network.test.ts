import {endSession, tap} from "../helpers/app";
import {getAttribute} from "../helpers/normalize";
import {getPayloadSource} from "../helpers/payload_source";
import {currentPlatform} from "../helpers/platform";

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
    expect(payload.networkSpans).toHaveLength(2);

    const successSpanName = currentPlatform() === "android" ? "emb-GET /" : "GET "
    const successSpan = payload.networkSpans.find(span => span.name === successSpanName)
    // The 200 request carries a cache-busting query param, so match the host rather than the url.
    expect(getAttribute(successSpan, "url.full")).toContain("example.com");
    expect(successSpan).toHaveAttributes({
      "http.request.method": "GET",
      "http.response.status_code": "200"
    });

    const badRequestSpanName = currentPlatform() === "android" ? "emb-GET /sdk/auto/interception" : "GET /sdk/auto/interception"
    const badRequestSpan = payload.networkSpans.find(span => span.name === badRequestSpanName)
    expect(badRequestSpan).toHaveAttributes({
      "http.request.method": "GET",
      "http.response.status_code": "404",
      "url.full": "https://example.com/sdk/auto/interception",
    });
  });

  it("records manually reported requests and client errors", async () => {
    await tap("Record Network Request");
    await tap("Log Network Client Error");
    await endSession();

    const p = await source.getPayloads();
    expect(p.networkSpans).toMatchGoldenFile("network-manual", "networkSpans");
  });
});
