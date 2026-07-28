import {driver} from "@wdio/globals";
import {getAttribute} from "../helpers/normalize";
import {getPayloadSource} from "../helpers/payload_source";
import {endSession} from "../helpers/session";
import {EmbraceSpanData} from "../typings/embrace";

// Auto-captured spans can't be selected by url.full or name: iOS reports the 200's url as
// "https://example.com" where Android adds a trailing slash, and iOS omits the "emb-" name prefix.
const byStatusCode = (spans: EmbraceSpanData[], code: string) =>
  spans.find(s => getAttribute(s, "http.response.status_code") === code)!;

describe("Network", () => {
  const source = getPayloadSource();

  beforeEach(async () => {
    await driver.$("~NETWORK TESTING").click();
    await new Promise(r => setTimeout(r, 500));
  });

  it("intercepts automatic fetch requests", async () => {
    await driver.$("~200 Request").click();
    await new Promise(r => setTimeout(r, 2000));
    await driver.$("~404 Request").click();
    await new Promise(r => setTimeout(r, 2000));
    await endSession();

    const p = await source.getPayloads();
    // These hit the real example.com, so response size and span status are not asserted:
    // iOS reports the 404 as status "ok" where Android reports "Error", and the body sizes differ.
    expect(p.networkSpans).toHaveLength(2);
    expect(byStatusCode(p.networkSpans, "200")).toHaveAttributes({
      "http.request.method": "GET",
    });
    expect(byStatusCode(p.networkSpans, "404")).toHaveAttributes({
      "http.request.method": "GET",
      "url.full": "https://example.com/sdk/auto/interception",
    });
  });

  it("records manually reported requests and client errors", async () => {
    await driver.$("~Record Network Request").click();
    await driver.$("~Log Network Client Error").click();
    await endSession();

    const p = await source.getPayloads();
    expect(p.networkSpans).toMatchGoldenFile("network-manual", "networkSpans");
  });
});
