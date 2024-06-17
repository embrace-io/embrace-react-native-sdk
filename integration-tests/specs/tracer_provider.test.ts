import { driver } from "@wdio/globals";

import { getSessionMessages } from "../helpers/embrace_server";
import { EmbraceSpanData } from "../typings/embrace";

describe("Tracer Provider", () => {
  const expectValidIDs = (span: EmbraceSpanData) => {
    expect(span.span_id).toHaveLength(16);
    expect(span.span_id).not.toEqual("0000000000000000");
    expect(span.trace_id).toHaveLength(32);
    expect(span.trace_id).not.toEqual("00000000000000000000000000000000");
  };

  it("should record test spans", async () => {
    const generateTestSpans = await driver.$("~GENERATE TEST SPANS");
    await generateTestSpans.click();

    const endSession = await driver.$("~END SESSION");
    await endSession.click();

    const sessionPayloads = await getSessionMessages();

    expect(sessionPayloads).toHaveLength(1);
    if (sessionPayloads.length > 0) {
      const spans = sessionPayloads[0].spans;
      expect(spans.length).toBe(3);

      // span and trace ids are not deterministic so just check they aren't invalid
      expectValidIDs(spans[0]);
      expectValidIDs(spans[1]);
      expectValidIDs(spans[2]);

      expect(sessionPayloads[0].spans).toEqual([
        {
          trace_id: spans[0].trace_id,
          span_id: spans[0].span_id,
          parent_span_id: "0000000000000000",
          name: "test-1-updated",
          start_time_unix_nano: 1718045981827000 * 1000000,
          end_time_unix_nano: 1718045981827000 * 1000000 + 2591701,
          status: "OK",
          events: [],
          attributes: {},
        },
        {
          trace_id: spans[1].trace_id,
          span_id: spans[1].span_id,
          parent_span_id: "0000000000000000",
          name: "test-2",
          start_time_unix_nano: 1718045981828000 * 1000000,
          end_time_unix_nano: 1718045981828000 * 1000000 + 2352861857268000,
          status: "UNSET",
          events: [
            {
              name: "test-2-event-1",
              attributes: {},
              time_unix_nano: 1718045981 * 1000000,
            },
            {
              name: "test-2-event-2",
              attributes: {},
              time_unix_nano: 1700001002 * 1000000,
            },
            {
              name: "test-2-event-3",
              attributes: {
                "test-2-event-attr": "my-event-attr",
              },
              time_unix_nano: 1700009002 * 1000000,
            },
          ],
          attributes: {},
        },
        {
          trace_id: spans[2].trace_id,
          span_id: spans[2].span_id,
          parent_span_id: "0000000000000000",
          name: "test-3",
          start_time_unix_nano: 1718045981828000 * 1000000,
          end_time_unix_nano: 1718045981828000 * 1000000 + 5927541,
          status: "UNSET",
          events: [
            {
              name: "exception",
              attributes: {
                "exception.message": "span exception",
              },
              time_unix_nano: 1718045981 * 1000000,
            },
          ],
          attributes: {},
        },
      ] as EmbraceSpanData[]);
    }
  });

  it("should record nested spans", async () => {
    const generateTestSpans = await driver.$("~GENERATE NESTED SPANS");
    await generateTestSpans.click();

    const endSession = await driver.$("~END SESSION");
    await endSession.click();

    const sessionPayloads = await getSessionMessages();

    expect(sessionPayloads).toHaveLength(1);
    if (sessionPayloads.length > 0) {
      const spans = sessionPayloads[0].spans;
      expect(spans.length).toBe(5);

      // span and trace ids are not deterministic so just check they aren't invalid
      expectValidIDs(spans[0]);
      expectValidIDs(spans[1]);
      expectValidIDs(spans[2]);
      expectValidIDs(spans[3]);
      expectValidIDs(spans[4]);

      expect(sessionPayloads[0].spans).toEqual([
        {
          trace_id: spans[0].trace_id,
          span_id: spans[0].span_id,
          parent_span_id: spans[1].span_id,
          name: "test-5",
          start_time_unix_nano: 1718047385968000 * 1000000,
          end_time_unix_nano: 1718047385968000 * 1000000 + 46207,
          status: "UNSET",
          events: [],
          attributes: {},
        },
        {
          trace_id: spans[1].trace_id,
          span_id: spans[1].span_id,
          parent_span_id: "0000000000000000",
          name: "test-4",
          start_time_unix_nano: 1718047385966000 * 1000000,
          end_time_unix_nano: 1718047385966000 * 1000000 + 2606099,
          status: "UNSET",
          events: [],
          attributes: {},
        },
        {
          trace_id: spans[2].trace_id,
          span_id: spans[2].span_id,
          parent_span_id: "0000000000000000",
          name: "test-1",
          start_time_unix_nano: 1718047075563000 * 1000000,
          end_time_unix_nano: 1718047075563000 * 1000000 + 693721,
          status: "UNSET",
          events: [],
          attributes: {},
        },
        {
          trace_id: spans[3].trace_id,
          span_id: spans[3].span_id,
          parent_span_id: spans[2].span_id,
          name: "test-2",
          start_time_unix_nano: 1718047075563000 * 1000000,
          end_time_unix_nano: 1718047075563000 * 1000000 + 756168,
          status: "UNSET",
          events: [],
          attributes: {
            "test-2-attr": "my-attr",
          },
        },
        {
          trace_id: spans[4].trace_id,
          span_id: spans[4].span_id,
          parent_span_id: "0000000000000000",
          name: "test-3",
          start_time_unix_nano: 1718047075564000 * 1000000,
          end_time_unix_nano: 1718047075564000 * 1000000 + 841156,
          status: "UNSET",
          events: [],
          attributes: {
            "test-3-attr": "my-attr",
          },
        },
      ] as EmbraceSpanData[]);
    }
  });
});
