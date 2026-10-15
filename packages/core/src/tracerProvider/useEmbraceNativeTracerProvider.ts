import {
  EmbraceNativeTracerProviderConfig,
  EmbraceNativeTracerProviderReturn,
} from "./types";
import {getEmbraceTracerProvider} from "./register";
import {getEmbraceTracer} from "./convenience";

const NO_TRACER_PROVIDER =
  "No Embrace tracer provider is registered. Call `initialize` from `@embrace-io/react-native` in the first import of your app's entry file, check that it returns `true`, and do not pass `tracerProvider: false`.";

/**
 * @deprecated Use `getEmbraceTracer()` or `getEmbraceTracerProvider()`. Pass any config to `initialize({tracerProvider})`; the arguments here are ignored.
 */
const useEmbraceNativeTracerProvider = (
  _config?: EmbraceNativeTracerProviderConfig,
  _enabled?: boolean,
): EmbraceNativeTracerProviderReturn => {
  const provider = getEmbraceTracerProvider();
  if (!provider) {
    return {
      isLoading: false,
      isError: true,
      error: NO_TRACER_PROVIDER,
      tracerProvider: null,
      tracer: null,
    };
  }

  return {
    isLoading: false,
    isError: false,
    error: "",
    tracerProvider: provider,
    tracer: getEmbraceTracer() ?? null,
  };
};

export {useEmbraceNativeTracerProvider};
