import {MutableRefObject, useEffect, useRef} from "react";
import {trace, Tracer, TracerProvider} from "@opentelemetry/api";

const TRACER_DEFAULT = {
  name: "default",
  version: "1.0",
};

interface ConfigArgs {
  name?: string;
  version?: string;
}

type TracerRef = MutableRefObject<Tracer | null>;

const useTrace = (
  {name, version}: ConfigArgs = {},
  provider: TracerProvider,
): TracerRef => {
  // otel
  const tracerRef = useRef<Tracer | null>(null);

  // using the layout effect to make sure the tracer is initialized before the component is rendered
  useEffect(() => {
    if (tracerRef.current === null && provider) {
      trace.setGlobalTracerProvider(provider);

      tracerRef.current = trace.getTracer(
        name || TRACER_DEFAULT.name,
        version || TRACER_DEFAULT.version,
      );
    }
  }, [provider]);

  return tracerRef;
};

export default useTrace;
export {type TracerRef};
