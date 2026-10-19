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
    if (provider) {
      console.info("[Embrace] TracerProvider. Using custom tracer.");
    } else {
      console.info("[Embrace] Using the global tracer provider.");
    }

    tracerRef.current = (provider ?? trace.getTracerProvider()).getTracer(
      PACKAGE_NAME,
      PACKAGE_VERSION,
      tracerOptions,
    );
  }, [console, provider, tracerOptions]);

  return tracerRef;
};

export default useTracerRef;
