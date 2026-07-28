import {endSession, tap} from "../helpers/app";
import {getPayloadSource} from "../helpers/payload_source";

// Logs are batched rather than sent immediately (iOS flushes on a ~20s timer of its own), but
// backgrounding forces the batch out, so these use the same endSession() flush as every other spec.
describe("Logs", () => {
  const source = getPayloadSource();

  beforeEach(async () => {
    await tap("LOG TESTING", 500);
  });

  it("records info, warning, error and message logs", async () => {
    await tap("Info / Warning / Error / Message");
    await endSession();

    const p = await source.getPayloads();
    expect(p.logs).toMatchGoldenFile("logs-basic", "logs");
  });

  it("records logs without stack traces", async () => {
    await tap("Warning / Error / Message");
    await endSession();

    const p = await source.getPayloads();
    expect(p.logs).toMatchGoldenFile("logs-no-stacktrace", "logs");
  });

  it("records a handled exception", async () => {
    await tap("Handled Exception");
    await endSession();

    const p = await source.getPayloads();
    expect(p.logs).toMatchGoldenFile("logs-handled-exception", "logs");
  });
});
