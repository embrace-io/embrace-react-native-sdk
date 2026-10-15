import {useEmbraceNativeTracerProvider} from "../tracerProvider/useEmbraceNativeTracerProvider";

const mockGetEmbraceTracerProvider = jest.fn();

jest.mock("../tracerProvider/register", () => ({
  getEmbraceTracerProvider: () => mockGetEmbraceTracerProvider(),
}));

describe("useEmbraceNativeTracerProvider", () => {
  test("returns the registered provider and its default tracer", () => {
    const tracer = {startSpan: jest.fn()};
    const provider = {getTracer: jest.fn().mockReturnValue(tracer)};
    mockGetEmbraceTracerProvider.mockReturnValue(provider);

    expect(useEmbraceNativeTracerProvider()).toEqual({
      isLoading: false,
      isError: false,
      error: "",
      tracerProvider: provider,
      tracer,
    });
    expect(provider.getTracer).toHaveBeenCalledWith(
      "embrace-default-tracer",
      undefined,
    );
  });

  test("returns an error when no provider is registered", () => {
    mockGetEmbraceTracerProvider.mockReturnValue(undefined);

    expect(useEmbraceNativeTracerProvider()).toEqual({
      isLoading: false,
      isError: true,
      error:
        "No Embrace tracer provider is registered. Call `initialize` from `@embrace-io/react-native` in the first import of your app's entry file, check that it returns `true`, and do not pass `tracerProvider: false`.",
      tracerProvider: null,
      tracer: null,
    });
  });
});
