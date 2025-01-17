import {configureStore, Tuple} from "@reduxjs/toolkit";
import {Attributes} from "@opentelemetry/api";

import * as spanFactory from "../src/instrumentation/utils/spanFactory";
import middleware from "../src/instrumentation/dispatch";

import getStore, {counterActions, rootReducer} from "./helpers/store";
import {
  createInstanceProvider,
  shutdownInstanceProvider,
} from "./helpers/provider";
import noopMiddleware from "./helpers/noopMiddleware";
import {TestSpanExporter} from "./helpers/exporter";

import SpyInstance = jest.SpyInstance;

jest.mock("react-native", () => ({
  AppState: {currentState: "background"},
}));

describe("instrumentation/dispatch.ts", () => {
  let exporter: TestSpanExporter;
  let consoleInfoSpy: SpyInstance;

  const verifySpans = (expected: object[]) => {
    expect(
      exporter.exportedSpans.map(span => ({
        name: span.name,
        attributes: span.attributes,
      })),
    ).toEqual(expected);
  };

  beforeEach(() => {
    exporter = new TestSpanExporter();
    consoleInfoSpy = jest
      .spyOn(global.console, "info")
      .mockImplementation(() => {});
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await shutdownInstanceProvider();
    if (exporter) {
      await exporter.shutdown();
    }
  });

  it("should not post console messages if debug mode is disabled", () => {
    const store = getStore(exporter);
    consoleInfoSpy.mockClear();
    middleware(undefined, {debug: false})(store);
    expect(consoleInfoSpy).not.toHaveBeenCalled();
  });

  it("should use the custom provider and custom configurations to apply to the middleware", () => {
    const provider = createInstanceProvider(exporter);
    const getTracerSpy = jest.spyOn(provider, "getTracer");
    const spanStartSpy = jest.spyOn(spanFactory, "spanStart");
    const spanEndSpy = jest.spyOn(spanFactory, "spanEnd");
    const store = configureStore({
      reducer: rootReducer,
      middleware: () =>
        new Tuple(
          middleware(provider, {
            debug: true,
            name: "redux-action",
            attributeTransform: (attrs: Attributes) => ({
              ...attrs,
              version: "1.1.1",
            }),
          }),
        ),
    });

    expect(consoleInfoSpy).toHaveBeenCalledWith(
      "TracerProvider. Using custom tracer.",
    );

    expect(getTracerSpy).toHaveBeenCalledWith(
      "@embrace-io/react-native-redux",
      "",
    );

    store.dispatch(counterActions.decrease(1));

    expect(spanStartSpy).toHaveBeenCalledWith(
      expect.anything(),
      "redux-action",
      {
        attributes: {
          version: "1.1.1",
          "action.type": "COUNTER_DECREASE:normal",
          "action.payload": '{"count":1}',
          "action.outcome": "incomplete",
        },
      },
    );

    // calling the end span function
    expect(spanEndSpy).toHaveBeenCalledTimes(1);

    // output of the span exporter
    verifySpans([
      {
        name: "redux-action",
        attributes: {
          version: "1.1.1",
          "action.type": "COUNTER_DECREASE:normal",
          "action.state": "background",
          "action.payload": '{"count":1}',
          "action.outcome": "success",
        },
      },
    ]);
  });

  it("should track an action and create the corresponding span", () => {
    const store = getStore(exporter);

    store.dispatch(counterActions.increase(3));
    verifySpans([
      {
        name: "action",
        attributes: {
          "action.type": "COUNTER_INCREASE:slow",
          "action.state": "background",
          "action.payload": '{"count":3}',
          "action.outcome": "success",
        },
      },
    ]);

    exporter.reset();
    store.dispatch(counterActions.decrease(1));
    verifySpans([
      {
        name: "action",
        attributes: {
          "action.type": "COUNTER_DECREASE:normal",
          "action.state": "background",
          "action.payload": '{"count":1}',
          "action.outcome": "success",
        },
      },
    ]);
  });

  it("should handle an action that fails", () => {
    try {
      getStore(exporter).dispatch(counterActions.decrease(42));
    } catch (e) {}

    verifySpans([
      {
        name: "action",
        attributes: {
          "action.type": "COUNTER_DECREASE:normal",
          "action.state": "background",
          "action.payload": '{"count":42}',
          "action.outcome": "fail",
        },
      },
    ]);
  });

  it("should handle another middleware being added to the chain", () => {
    const provider = createInstanceProvider(exporter);
    const store = configureStore({
      reducer: rootReducer,
      middleware: () =>
        new Tuple(middleware(provider)).concat(noopMiddleware()),
    });

    store.dispatch(counterActions.increase(1));

    verifySpans([
      {
        name: "action",
        attributes: {
          "action.type": "COUNTER_INCREASE:slow",
          "action.state": "background",
          "action.payload": '{"count":1}',
          "action.outcome": "success",
        },
      },
    ]);

    // The slow action should take at least 1000ms, make sure that we still record this duration correctly
    // when there's another middleware in the way
    expect(exporter.exportedSpans[0].duration[1]).toBeGreaterThanOrEqual(1);
  });
});
