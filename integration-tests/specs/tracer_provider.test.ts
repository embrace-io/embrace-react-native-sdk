import {driver} from "@wdio/globals";

import {backgroundSessionsEnabled, endSession} from "../helpers/session";
import {getSpanPayloads} from "../helpers/embrace_server";
import {EmbraceSpanData} from "../typings/embrace";
import {
  commonEmbraceSpanAttributes,
  embraceSpanDefaults,
  sortSpanAttributes,
} from "../helpers/span";

const msToNano = (ms: number) => ms * 1000000;

describe("Tracer Provider", () => {
  const expectValidSpans = (spans: EmbraceSpanData[], snapshots = false) => {
    const reasonableEpochNanos = msToNano(
      new Date("2024-01-01T00:00:00Z").getTime(),
    );
    spans.forEach(span => {
      // span and trace ids are not deterministic so just check they aren't invalid
      expect(span.span_id).toHaveLength(16);
      expect(span.span_id).not.toEqual("0000000000000000");
      expect(span.trace_id).toHaveLength(32);
      expect(span.trace_id).not.toEqual("00000000000000000000000000000000");

      // unless explicitly set start/end times are based on current time so just assert they are reasonable
      expect(span.start_time_unix_nano).toBeGreaterThan(reasonableEpochNanos);

      if (snapshots) {
        expect(span.end_time_unix_nano).toBeUndefined();
      } else {
        expect(span.end_time_unix_nano).toBeGreaterThan(reasonableEpochNanos);
      }
    });
  };

  beforeEach(async () => {
    const tracerProviderScreen = await driver.$("~TRACER PROVIDER TESTING");
    await tracerProviderScreen.click();
    await new Promise(r => setTimeout(r, 1000));
  });

  it("should record a basic span", async () => {
    const generateBasicSpan = await driver.$("~GENERATE BASIC SPAN");
    await generateBasicSpan.click();
    await endSession();
    const spanPayloads = await getSpanPayloads();

    expect(spanPayloads).toHaveLength(backgroundSessionsEnabled() ? 2 : 1);
    if (spanPayloads.length > 0) {
      const spans = spanPayloads[0].perfSpans;
      expect(spans.length).toBe(1);
      expectValidSpans(spans);
      expect(spans[0]).toEqual({
        ...embraceSpanDefaults(),
        trace_id: spans[0].trace_id,
        span_id: spans[0].span_id,
        name: "test-1",
        start_time_unix_nano: spans[0].start_time_unix_nano,
        end_time_unix_nano: spans[0].end_time_unix_nano,
        events: [],
        attributes: commonEmbraceSpanAttributes(spans[0]),
      });
    }
  });

  it("should record test spans", async () => {
    const generateTestSpans = await driver.$("~GENERATE TEST SPANS");
    await generateTestSpans.click();
    await endSession();
    const spanPayloads = await getSpanPayloads();

    expect(spanPayloads).toHaveLength(backgroundSessionsEnabled() ? 2 : 1);
    if (spanPayloads.length > 0) {
      const spans = spanPayloads[0].perfSpans;
      expect(spans.length).toBe(4);
      expectValidSpans(spans);
      expect(spans).toEqual([
        {
          ...embraceSpanDefaults(),
          trace_id: spans[0].trace_id,
          span_id: spans[0].span_id,
          name: "test-1-updated",
          status: driver.isIOS ? "ok" : "Ok",
          start_time_unix_nano: spans[0].start_time_unix_nano,
          end_time_unix_nano: spans[0].end_time_unix_nano,
          events: [],
          attributes: sortSpanAttributes([
            {
              key: "string-attr",
              value: "my-attr",
            },
            {
              key: "number-attr",
              value: driver.isIOS ? "22" : "22.0",
            },
            {
              key: "bool-attr",
              value: "true",
            },
            ...commonEmbraceSpanAttributes(spans[0]),
          ]),
        },
        {
          ...embraceSpanDefaults(),
          trace_id: spans[1].trace_id,
          span_id: spans[1].span_id,
          name: "test-2",
          start_time_unix_nano: spans[1].start_time_unix_nano,
          end_time_unix_nano: driver.isIOS
            ? spans[1].end_time_unix_nano // Not doing the future test on iOS
            : msToNano(new Date("2099-01-01T00:00:00Z").getTime()),
          events: [
            {
              name: "test-2-event-1",
              attributes: [],
              time_unix_nano: spans[1].events[0].time_unix_nano,
            },
            {
              name: "test-2-event-2",
              attributes: [],
              time_unix_nano: 1700001002000 * 1000000,
            },
            {
              name: "test-2-event-3",
              attributes: [
                {
                  key: "test-2-event-attr",
                  value: "my-event-attr",
                },
              ],
              time_unix_nano: 1700009002000 * 1000000,
            },
          ],
          attributes: commonEmbraceSpanAttributes(spans[1]),
        },
        {
          ...embraceSpanDefaults(),
          trace_id: spans[2].trace_id,
          span_id: spans[2].span_id,
          name: "test-3",
          start_time_unix_nano: spans[2].start_time_unix_nano,
          end_time_unix_nano: spans[2].end_time_unix_nano,
          events: [
            {
              name: "exception",
              attributes: [
                {
                  key: "exception.message",
                  value: "span exception",
                },
              ],
              time_unix_nano: spans[2].events[0].time_unix_nano,
            },
          ],
          attributes: commonEmbraceSpanAttributes(spans[2]),
        },
        {
          ...embraceSpanDefaults(),
          trace_id: spans[3].trace_id,
          span_id: spans[3].span_id,
          name: "test-4",
          start_time_unix_nano: spans[3].start_time_unix_nano,
          end_time_unix_nano: msToNano(
            new Date("2024-03-03T00:00:00Z").getTime(),
          ),
          events: [],
          attributes: commonEmbraceSpanAttributes(spans[3]),
        },
      ] as EmbraceSpanData[]);

      /* TODO, still worth validating on snapshots?
      const snapshots = spanPayloads[0].perfSpanSnapshots;
      expect(snapshots.length).toBe(1);
      expectValidSpans(snapshots, true);
      expect(snapshots).toEqual([
        {
          ...embraceSpanDefaults(),
          trace_id: snapshots[0].trace_id,
          span_id: snapshots[0].span_id,
          name: "test-5",
          start_time_unix_nano: snapshots[0].start_time_unix_nano,
          end_time_unix_nano: snapshots[0].end_time_unix_nano,
          events: [],
          status: driver.isIOS ? "unset" : "Unset",
          attributes: commonEmbraceSpanSnapshotAttributes(),
        },
      ] as EmbraceSpanData[]);
       */
    }
  });

  it("should record nested spans", async () => {
    const generateTestSpans = await driver.$("~GENERATE NESTED SPANS");
    await generateTestSpans.click();
    await endSession();
    const spanPayloads = await getSpanPayloads();

    expect(spanPayloads).toHaveLength(backgroundSessionsEnabled() ? 2 : 1);
    if (spanPayloads.length > 0) {
      const spans = spanPayloads[0].perfSpans;
      expect(spans.length).toBe(6);
      expectValidSpans(spans);
      expect(spans).toEqual([
        {
          ...embraceSpanDefaults(),
          trace_id: spans[0].trace_id,
          span_id: spans[0].span_id,
          name: "test-1",
          start_time_unix_nano: spans[0].start_time_unix_nano,
          end_time_unix_nano: spans[0].end_time_unix_nano,
          events: [],
          attributes: commonEmbraceSpanAttributes(spans[0]),
        },
        {
          ...embraceSpanDefaults(),
          trace_id: spans[1].trace_id,
          span_id: spans[1].span_id,
          parent_span_id: spans[0].span_id, // parent should be test-1
          name: "test-2",
          start_time_unix_nano: spans[1].start_time_unix_nano,
          end_time_unix_nano: spans[1].end_time_unix_nano,
          events: [],
          attributes: sortSpanAttributes([
            {
              key: "test-2-attr",
              value: "my-attr",
            },
            ...commonEmbraceSpanAttributes(spans[1]),
          ]),
        },
        {
          ...embraceSpanDefaults(),
          trace_id: spans[2].trace_id,
          span_id: spans[2].span_id,
          name: "test-3",
          start_time_unix_nano: spans[2].start_time_unix_nano,
          end_time_unix_nano: spans[2].end_time_unix_nano,
          events: [],
          attributes: sortSpanAttributes([
            {
              key: "test-3-attr",
              value: "my-attr",
            },
            ...commonEmbraceSpanAttributes(spans[2]),
          ]),
        },
        {
          ...embraceSpanDefaults(),
          trace_id: spans[3].trace_id,
          span_id: spans[3].span_id,
          name: "test-4",
          start_time_unix_nano: spans[3].start_time_unix_nano,
          end_time_unix_nano: spans[3].end_time_unix_nano,
          events: [],
          attributes: commonEmbraceSpanAttributes(spans[3]),
        },
        {
          ...embraceSpanDefaults(),
          trace_id: spans[4].trace_id,
          span_id: spans[4].span_id,
          parent_span_id: spans[3].span_id, // parent should be test-4
          name: "test-5",
          start_time_unix_nano: spans[4].start_time_unix_nano,
          end_time_unix_nano: spans[4].end_time_unix_nano,
          events: [],
          attributes: commonEmbraceSpanAttributes(spans[4]),
        },
        {
          ...embraceSpanDefaults(),
          trace_id: spans[5].trace_id,
          span_id: spans[5].span_id,
          parent_span_id: spans[0].span_id, // parent should be test-1
          name: "test-6",
          start_time_unix_nano: spans[5].start_time_unix_nano,
          end_time_unix_nano: spans[5].end_time_unix_nano,
          events: [],
          attributes: commonEmbraceSpanAttributes(spans[5]),
        },
      ] as EmbraceSpanData[]);
    }
  });
});
