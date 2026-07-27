import {driver} from "@wdio/globals";
import {getPayloadSource} from "../helpers/payload_source";
import {endSession} from "../helpers/session";

describe("Tracer Provider", () => {
  const source = getPayloadSource();

  after(async () => {
    // Snapshots (e.g. the unfinished test-5) persist across sessions; relaunching the app
    // flushes them so each run starts clean.
    await driver.relaunchActiveApp();
    await new Promise(r => setTimeout(r, 1000));
  });

  beforeEach(async () => {
    await driver.$("~SPAN TESTING").click();
    await new Promise(r => setTimeout(r, 1000));
  });

  it("records a basic span", async () => {
    await driver.$("~GENERATE BASIC SPAN").click();
    await endSession();

    const p = await source.getPayloads();
    expect(p.perfSpans).toMatchGoldenFile("tracer-basic-span", "perfSpans");
  });

  it("records test spans and an unfinished-span snapshot", async () => {
    await driver.$("~GENERATE TEST SPANS").click();
    await endSession();

    const p = await source.getPayloads();
    expect(p.perfSpans).toMatchGoldenFile("tracer-test-spans", "perfSpans");
    expect(p.spanSnapshots).toMatchGoldenFile("tracer-test-spans", "spanSnapshots");
  });

  it("records nested spans with correct parent relationships", async () => {
    await driver.$("~GENERATE NESTED SPANS").click();
    await endSession();

    const p = await source.getPayloads();
    expect(p.perfSpans).toMatchGoldenFile("tracer-nested-spans", "perfSpans");
  });
});
