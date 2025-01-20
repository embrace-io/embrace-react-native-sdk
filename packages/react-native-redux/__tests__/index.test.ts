import {renderHook, waitFor} from "@testing-library/react-native";
import {configureStore, Tuple} from "@reduxjs/toolkit";

import {useEmbraceMiddleware} from "../src";

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
    await shutdownInstanceProvider();
    if (exporter) {
      await exporter.shutdown();
    }
  });

  it("should apply the middleware with Embrace specific attributes", async () => {
    const provider = createInstanceProvider(exporter);
    const {result} = renderHook(() => useEmbraceMiddleware(provider));
    await waitFor(() => expect(result.current.middleware).toBeTruthy());

    const store = configureStore({
      reducer: rootReducer,
      middleware: () => new Tuple(result.current.middleware!),
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

  it("should handle a provider not being ready yet", () => {
    const {result} = renderHook(() => useEmbraceMiddleware(undefined));
    expect(result.current.middleware).toBeFalsy();
  });
});
