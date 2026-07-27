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
});
