import {driver} from "@wdio/globals";
import {getAttribute} from "../helpers/normalize";
import {getPayloadSource} from "../helpers/payload_source";
import {endSession} from "../helpers/session";

describe("Sessions", () => {
  it("records a foreground session when the app is backgrounded", async () => {
    const source = getPayloadSource();

    await endSession();

    const p = await source.getPayloads();
    expect(p.sessionSpans).toHaveLength(1);
    expect(p.sessionSpans[0]).toHaveAttributes({"emb.state": "foreground"});
  });

  it("records a breadcrumb as a session span event", async () => {
    const source = getPayloadSource();

    await driver.$("~SPAN TESTING").click();
    await new Promise(r => setTimeout(r, 500));
    await driver.$("~Add Breadcrumb").click();
    await endSession();

    const p = await source.getPayloads();
    // The event list isn't comparable exactly: both platforms add an automatic
    // "The App started in portrait mode" breadcrumb, and iOS adds an emb-ui-tap per tap.
    const messages = p.sessionSpans[0].events
      .filter(e => e.name === "emb-breadcrumb")
      .map(e => getAttribute(e, "message"));
    expect(messages).toContain("my-breadcrumb");
  });
});
