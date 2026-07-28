import {endSession, tap} from "../helpers/app";
import {getAttribute} from "../helpers/normalize";
import {getPayloadSource} from "../helpers/payload_source";

describe("Sessions", () => {
  const payloadSource = getPayloadSource();

  it("records a foreground session when the app is backgrounded", async () => {
    await endSession();

    const payloads = await payloadSource.getPayloads();
    expect(payloads.sessionSpans).toHaveLength(1);
    expect(payloads.sessionSpans[0]).toHaveAttributes({"emb.state": "foreground"});
  });

  it("records a breadcrumb as a session span event", async () => {
    await new Promise(r => setTimeout(r, 500));
    await tap("SPAN TESTING", 500);
    await tap("Add Breadcrumb", 500);
    await endSession();

    // The event list isn't comparable exactly: both platforms add an automatic
    // "The App started in portrait mode" breadcrumb, and iOS adds an emb-ui-tap per tap.
    const payloads = await payloadSource.getPayloads();
    const userBreadcrumb = payloads.sessionSpans
      .flatMap(span => span.events)
      .find(event => getAttribute(event, "message") === "my-breadcrumb");
    
    expect(userBreadcrumb).not.toBeUndefined()
    expect(userBreadcrumb.name).toBe("emb-breadcrumb")
    expect(userBreadcrumb).toHaveAttributes({
      "emb.type": "sys.breadcrumb",
      "message": "my-breadcrumb",
    })
  });
});
