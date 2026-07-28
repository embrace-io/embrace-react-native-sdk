import {driver} from "@wdio/globals";
import {idToNameMap, projectSpan} from "../helpers/compare";
import {loadGoldenFile} from "../helpers/golden";
import {getAttribute} from "../helpers/normalize";
import {getPayloadSource} from "../helpers/payload_source";
import {endSession} from "../helpers/session";
import {EmbraceSpanData} from "../typings/embrace";

const byViewName = (spans: EmbraceSpanData[], name: string) =>
  spans.find(s => getAttribute(s, "view.name") === name)!;

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

  it("records a view span via startView", async () => {
    await driver.$("~Record View").click();
    await endSession();

    const p = await source.getPayloads();
    // startView names its span emb-screen-view and identifies the view via view.name.
    // viewSpans also holds incidental tab-navigation views whose composition depends on run
    // order, so compare only this span against its counterpart in the golden.
    const golden = loadGoldenFile("span-record-view").viewSpans;
    expect(byViewName(p.viewSpans, "my-view")).toMatchSpan(
      projectSpan(byViewName(golden, "my-view"), idToNameMap(golden)),
    );
  });

  it("records completed spans with attributes, events and a parent", async () => {
    await driver.$("~Record Completed Span").click();
    await endSession();

    const p = await source.getPayloads();
    expect(p.perfSpans).toMatchGoldenFile("span-record-completed", "perfSpans");
  });
});
