import {driver} from "@wdio/globals";

import {backgroundSessionsEnabled, endSession} from "../helpers/session";
import {getSpanPayloads} from "../helpers/embrace_server";
import {EmbraceSpanData} from "../typings/embrace";
import {
  commonEmbraceSpanAttributes,
  embraceSpanDefaults,
  sortSpanAttributes,
} from "../helpers/span";

describe("Navigation", () => {
  const backgroundViewState = () => {
    // On iOS we get the "inactive" state which represents a transition between foreground and background instead of
    // "background" due to how our integration tests run
    // See https://reactnative.dev/docs/appstate#app-states
    return driver.isAndroid ? "background" : "inactive";
  };

  it("should record the initially rendered screen", async () => {
    await endSession();
    const spanPayloads = await getSpanPayloads();
    expect(spanPayloads).toHaveLength(backgroundSessionsEnabled() ? 2 : 1);
    if (spanPayloads.length > 0) {
      const spans = spanPayloads[0].viewSpans;
      expect(spans.length).toBe(1);
      const span = spans[0];

      expect(span).toEqual({
        ...embraceSpanDefaults(),
        trace_id: span.trace_id,
        span_id: span.span_id,
        name: "index",
        start_time_unix_nano: span.start_time_unix_nano,
        end_time_unix_nano: span.end_time_unix_nano,
        events: [],
        attributes: sortSpanAttributes([
          {
            key: "emb.type",
            value: "ux.view",
          },
          {
            key: "view.launch",
            value: "false", // TODO this will be true when launching the app from a cold start, but running locally for now the app is already running
          },
          {
            key: "view.name",
            value: "index",
          },
          {
            key: "view.state.end",
            value: backgroundViewState(),
          },
          ...commonEmbraceSpanAttributes(span),
        ]),
      });
    }
  });

  it("should record navigation between screens", async () => {
    const secondScreen = await driver.$("~SECOND SCREEN");
    await secondScreen.click();
    await new Promise(r => setTimeout(r, 1000));
    const homeScreen = await driver.$("~HOME");
    await homeScreen.click();
    await endSession();
    const spanPayloads = await getSpanPayloads();

    expect(spanPayloads).toHaveLength(backgroundSessionsEnabled() ? 2 : 1);
    if (spanPayloads.length > 0) {
      const spans = spanPayloads[0].viewSpans;
      expect(spans.length).toBe(3);
      expect(spans).toEqual([
        {
          ...embraceSpanDefaults(),
          trace_id: spans[0].trace_id,
          span_id: spans[0].span_id,
          name: "index",
          start_time_unix_nano: spans[0].start_time_unix_nano,
          end_time_unix_nano: spans[0].end_time_unix_nano,
          events: [],
          attributes: sortSpanAttributes([
            {
              key: "emb.type",
              value: "ux.view",
            },
            {
              key: "view.launch",
              value: "false", // TODO this will be true when launching the app from a cold start, but running locally for now the app is already running
            },
            {
              key: "view.name",
              value: "index",
            },
            {
              key: "view.state.end",
              value: "active",
            },
            ...commonEmbraceSpanAttributes(spans[0]),
          ]),
        },
        {
          ...embraceSpanDefaults(),
          trace_id: spans[1].trace_id,
          span_id: spans[1].span_id,
          name: "second",
          start_time_unix_nano: spans[1].start_time_unix_nano,
          end_time_unix_nano: spans[1].end_time_unix_nano,
          events: [],
          attributes: sortSpanAttributes([
            {
              key: "emb.type",
              value: "ux.view",
            },
            {
              key: "view.launch",
              value: "false",
            },
            {
              key: "view.name",
              value: "second",
            },
            {
              key: "view.state.end",
              value: "active",
            },
            ...commonEmbraceSpanAttributes(spans[1]),
          ]),
        },
        {
          ...embraceSpanDefaults(),
          trace_id: spans[2].trace_id,
          span_id: spans[2].span_id,
          name: "index",
          start_time_unix_nano: spans[2].start_time_unix_nano,
          end_time_unix_nano: spans[2].end_time_unix_nano,
          events: [],
          attributes: sortSpanAttributes([
            {
              key: "emb.type",
              value: "ux.view",
            },
            {
              key: "view.launch",
              value: "false",
            },
            {
              key: "view.name",
              value: "index",
            },
            {
              key: "view.state.end",
              value: backgroundViewState(),
            },
            ...commonEmbraceSpanAttributes(spans[2]),
          ]),
        },
      ] as EmbraceSpanData[]);
    }
  });
});
