import {renderHook, waitFor} from "@testing-library/react-native";

import {useEmbraceNativeTracerProvider} from "../index";

// This is separated from tracerProvider.test.ts as there didn't seem to be any simple way to unmock NativeModules.EmbraceManager
// for just this test case
describe("Embrace Native Tracer Provider with no SDK", () => {
  it("should error if the Embrace SDK hasn't been installed", async () => {
    const {result} = renderHook(() => useEmbraceNativeTracerProvider());
    await waitFor(() => {
      expect(result.current).toEqual({
        isLoading: false,
        isError: true,
        error:
          "You must have the Embrace SDK available to use the TracerProvider, please install `@embrace-io/react-native`.",
        tracerProvider: null,
        tracer: null,
      });
    });
  });
});
