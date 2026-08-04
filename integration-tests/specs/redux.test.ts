import {endSession, tap} from "../helpers/app";
import {getPayloadSource} from "../helpers/payload_source";

describe("Redux", () => {
  const payloadSource = getPayloadSource();

  it("records spans for redux actions", async () => {
    await tap("REDUX TESTING", 1000);
    await tap("Increase", 500);
    await tap("Decrease", 500);
    await endSession();

    const payload = await payloadSource.getPayloads();
    expect(payload.perfSpans).toMatchGoldenFile("redux", "perfSpans");
  });
});
