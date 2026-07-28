import {endSession, tap} from "../helpers/app";
import {getPayloadSource} from "../helpers/payload_source";

describe("Sessions", () => {
  const payloadSource = getPayloadSource();

  it("records a foreground session when the app is backgrounded", async () => {
    await endSession();

    const payload = await payloadSource.getPayloads();
    expect(payload.sessionSpans).toHaveLength(1);
    expect(payload.sessionSpans[0]).toHaveAttributes({"emb.state": "foreground"});
  });

  it("records a breadcrumb as a session span event", async () => {
    await new Promise(r => setTimeout(r, 500));
    await tap("SPAN TESTING", 500);
    await tap("Add Breadcrumb", 500);
    await endSession();

    const payload = await payloadSource.getPayloads();
    expect(payload.sessionSpans).toMatchGoldenFile("session-breadcrumb", "sessionSpans");
  });
});
