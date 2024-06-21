import {cleanup} from "@testing-library/react-native";

import store from "../testUtils/store";
import {shutdownInstanceProvider} from "../../testUtils/helpers/provider";

describe("otelMiddleware.ts", () => {
  afterEach(() => {
    cleanup();
    shutdownInstanceProvider();
  });

  const mockConsoleDir = jest.spyOn(console, "dir");

  it("should track an action and create the corresponding span", () => {
    store.dispatch({type: "COUNTER_INCREASE", count: 5});

    store.dispatch({type: "COUNTER_DECREASE", count: 1});

    store.dispatch({type: "COUNTER_INCREASE", count: 2});

    expect(mockConsoleDir).toHaveBeenCalled();
    // TBD: Add more assertions
  });
});
