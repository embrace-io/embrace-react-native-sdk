import {driver} from "@wdio/globals";
import {loadGoldenFile} from "../helpers/golden";
import {getAttribute} from "../helpers/normalize";
import {endSession, tap} from "../helpers/app";
import {getPayloadSource} from "../helpers/payload_source";
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
    await tap("SPAN TESTING", 1000);
  });

  it("records a basic span", async () => {
    await tap("GENERATE BASIC SPAN");
    await endSession();

    const p = await source.getPayloads();
    expect(p.perfSpans).toMatchGoldenFile("tracer-basic-span", "perfSpans");
  });

  it("records test spans and an unfinished-span snapshot", async () => {
    await tap("GENERATE TEST SPANS");
    await endSession();

    const p = await source.getPayloads();
    expect(p.perfSpans).toMatchGoldenFile("tracer-test-spans", "perfSpans");
    expect(p.spanSnapshots).toMatchGoldenFile("tracer-test-spans", "spanSnapshots");
  });

  it("records nested spans with correct parent relationships", async () => {
    await tap("GENERATE NESTED SPANS");
    await endSession();

    const p = await source.getPayloads();
    expect(p.perfSpans).toMatchGoldenFile("tracer-nested-spans", "perfSpans");
  });

  it("records a view span via startView", async () => {
    await tap("Record View");
    await endSession();

    const p = await source.getPayloads();
    // startView names its span emb-screen-view and identifies the view via view.name.
    // viewSpans also holds incidental tab-navigation views whose composition depends on run
    // order, so compare only this span against its counterpart in the golden.
    const golden = loadGoldenFile("span-record-view").viewSpans;
    expect(byViewName(p.viewSpans, "my-view")).toMatchSpan(byViewName(golden, "my-view"));
  });

  it("records completed spans with attributes, events and a parent", async () => {
    await tap("Record Completed Span");
    await endSession();

    const p = await source.getPayloads();
    expect(p.perfSpans).toMatchGoldenFile("span-record-completed", "perfSpans");
  });
});
