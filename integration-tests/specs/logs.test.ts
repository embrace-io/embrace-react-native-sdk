import {driver} from "@wdio/globals";
import {getPayloadSource} from "../helpers/payload_source";
import {endSession} from "../helpers/session";

// Logs are batched rather than sent immediately (iOS flushes on a ~20s timer of its own), but
// backgrounding forces the batch out, so these use the same endSession() flush as every other spec.
describe("Logs", () => {
  const source = getPayloadSource();

  beforeEach(async () => {
    await driver.$("~LOG TESTING").click();
    await new Promise(r => setTimeout(r, 500));
  });

  it("records info, warning, error and message logs", async () => {
    await driver.$("~Info / Warning / Error / Message").click();
    await endSession();

    const p = await source.getPayloads();
    expect(p.logs).toMatchGoldenFile("logs-basic", "logs");
  });

  it("records logs without stack traces", async () => {
    await driver.$("~Warning / Error / Message").click();
    await endSession();

    const p = await source.getPayloads();
    expect(p.logs).toMatchGoldenFile("logs-no-stacktrace", "logs");
  });

  it("records a handled exception", async () => {
    await driver.$("~Handled Exception").click();
    await endSession();

    const p = await source.getPayloads();
    expect(p.logs).toMatchGoldenFile("logs-handled-exception", "logs");
  });
});
