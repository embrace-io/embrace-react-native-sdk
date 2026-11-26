import {endSession, tap} from "../helpers/app";
import {goldenFile} from "../helpers/golden";
import {getPayloadSource} from "../helpers/payload_source";

describe("Sessions", () => {
  const payloadSource = getPayloadSource();

  it("records a foreground session when the app is backgrounded", async () => {
    goldenFile("session-foreground");
    await endSession();

    const payload = await payloadSource.getPayloads();
    expect(payload.sessionSpans).toHaveLength(1);
    expect(payload.sessionSpans[0]).toHaveAttributes({"emb.state": "foreground"});
  });

  it("records a breadcrumb as a session span event", async () => {
    goldenFile("session-breadcrumb");
    await tap("SPAN TESTING", 500);
    await tap("Add Breadcrumb", 500);
    await endSession();

    const payload = await payloadSource.getPayloads();
    expect(payload.sessionSpans).toHaveLength(1);
    expect(payload.sessionSpans[0]).toHaveEvents([
      {
        name: "emb-breadcrumb",
        attributes: [
          {
            key: "emb.type",
            value: "sys.breadcrumb"
          },
          {
            key: "message",
            value: "my-breadcrumb"
          }
        ]
      }
    ]);
  });
});
