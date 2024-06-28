import {MutableRefObject, useLayoutEffect, useRef} from "react";
import {trace, Tracer, TracerProvider} from "@opentelemetry/api";

interface ConfigArgs {
  name: string;
  version: string;
}

type TracerRef = MutableRefObject<Tracer | null>;

const useTrace = (config: ConfigArgs, provider?: TracerProvider): TracerRef => {
  const {name, version} = config;
  const tracerRef = useRef<Tracer | null>(null);

  // using the layout effect to make sure the tracer is initialized before the component is rendered
  useLayoutEffect(() => {
    if (tracerRef.current === null) {
      tracerRef.current = provider
        ? provider.getTracer(name, version)
        : trace.getTracer(name, version);
    }
  }, [name, provider, version]);

  return tracerRef;
};

export default useTrace;
export {type TracerRef};
