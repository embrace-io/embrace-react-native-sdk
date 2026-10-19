import {configureStore, Tuple} from "@reduxjs/toolkit";
import {trace} from "@opentelemetry/api";

import {createEmbraceMiddleware} from "../src";

import {counterActions, rootReducer} from "./helpers/store";
import {
  createInstanceProvider,
  shutdownInstanceProvider,
} from "./helpers/provider";
import {TestSpanExporter} from "./helpers/exporter";

describe("React Native Action Tracker", () => {
  let exporter: TestSpanExporter;

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
  });

  afterEach(async () => {
    jest.clearAllMocks();
    trace.disable();
    await shutdownInstanceProvider();
    if (exporter) {
      await exporter.shutdown();
    }
  });

  it("should apply the middleware with Embrace specific attributes", () => {
    const provider = createInstanceProvider(exporter);
    const store = configureStore({
      reducer: rootReducer,
      middleware: () => new Tuple(createEmbraceMiddleware(provider)),
    });

    store.dispatch(counterActions.decrease(1));

    verifySpans([
      {
        name: "action",
        attributes: {
          "emb.type": "sys.rn_action",
          name: "COUNTER_DECREASE:normal",
          outcome: "success",
          payload_size: "31",
        },
      },
    ]);
  });

  it("should use a global tracer provider registered after the store is created", () => {
    const store = configureStore({
      reducer: rootReducer,
      middleware: () => new Tuple(createEmbraceMiddleware()),
    });
    createInstanceProvider(exporter);

    store.dispatch(counterActions.decrease(1));

    verifySpans([
      {
        name: "action",
        attributes: {
          "emb.type": "sys.rn_action",
          name: "COUNTER_DECREASE:normal",
          outcome: "success",
          payload_size: "31",
        },
      },
    ]);
  });
});
