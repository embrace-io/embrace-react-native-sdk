import {MutableRefObject, useEffect, useRef} from "react";
import {trace, Tracer, TracerProvider} from "@opentelemetry/api";

import {PACKAGE_NAME, PACKAGE_VERSION} from "../../version";
import {TrackerConfig} from "../../types/navigation";

import useConsole from "./useConsole";

export type TracerRef = MutableRefObject<Tracer | null>;

const useTracerRef = (
  provider?: TracerProvider,
  config?: TrackerConfig,
): TracerRef => {
  const {debug, tracerOptions} = config ?? {};
  const tracerRef = useRef<Tracer | null>(null);
  const console = useConsole(!!debug);

  useEffect(() => {
    if (tracerRef.current === null) {
      if (!provider) {
        console.info("No TracerProvider found. Using global tracer instead.");
      } else {
        console.info("TracerProvider. Using custom tracer.");
      }

      tracerRef.current = provider
        ? provider.getTracer(PACKAGE_NAME, PACKAGE_VERSION, tracerOptions)
        : // using global tracer provider
          trace.getTracer(PACKAGE_NAME, PACKAGE_VERSION);
    }

    // this is useful in cases where the provider is passed but it's still `null` or `undefined` (given a re-render or something specific of the lifecycle of the app that implements the library)
    if (
      tracerRef.current !== null &&
      provider !== undefined &&
      provider !== null
    ) {
      tracerRef.current = provider.getTracer(
        PACKAGE_NAME,
        PACKAGE_VERSION,
        tracerOptions,
      );

      console.info("Updated TracerProvider. Switching to the new instance.");
    }
  }, [console, provider, tracerOptions]);

  return tracerRef;
};

export default useTracerRef;
