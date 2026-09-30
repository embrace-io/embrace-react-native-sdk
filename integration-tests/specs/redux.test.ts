import {endSession, tap} from "../helpers/app";
import {loadGoldenFile} from "../helpers/golden";
import {getAttribute} from "../helpers/normalize";
import {getPayloadSource} from "../helpers/payload_source";

describe("Redux", () => {
  const payloadSource = getPayloadSource();

  it("records spans for redux actions", async () => {
    await tap("REDUX TESTING", 1000);
    await tap("Increase", 500);
    await tap("Decrease", 500);
    await endSession();

    const payload = await payloadSource.getPayloads();
    expect(payload.reduxSpans).toHaveLength(2);

    const golden = loadGoldenFile("redux");

    const expectedIncreaseSpan = golden.reduxSpans.find(span => getAttribute(span, "name") === "COUNTER_INCREASE:slow");
    const actualIncreaseSpan = payload.reduxSpans.find(span => getAttribute(span, "name") === "COUNTER_INCREASE:slow");
    expect(actualIncreaseSpan).toMatchSpan(expectedIncreaseSpan);

    const expectedDecreaseSpan = golden.reduxSpans.find(span => getAttribute(span, "name") === "COUNTER_DECREASE:normal");
    const actualDecreaseSpan = payload.reduxSpans.find(span => getAttribute(span, "name") === "COUNTER_DECREASE:normal");
    expect(actualDecreaseSpan).toMatchSpan(expectedDecreaseSpan);
  });
});
