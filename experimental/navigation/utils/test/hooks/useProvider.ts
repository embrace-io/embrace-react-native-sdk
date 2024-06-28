import {useCallback, useEffect, useRef} from "react";
import {
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";

/**
 * These are only for web, able to see logs coming through DevTools while developing.
 * Example of a trace in console:
    {
        "resource": {
            "attributes": {
                "service.name": "unknown_service",
                "telemetry.sdk.language": "webjs",
                "telemetry.sdk.name": "opentelemetry",
                "telemetry.sdk.version": "1.24.1"
            }
        },
        "traceId": "5cdeae1beab7108c77fa52b5aab30d22",
        "name": "index",
        "id": "4ee77c180c6f1027",
        "kind": 0,
        "timestamp": 1717536927797000,
        "duration": 2820542.167,
        "attributes": {
            "timestamp": 1717536927797,
            "initial_view": true
        },
        "status": {
            "code": 0
        },
        "events": [],
        "links": []
    }
 */
const useProvider = () => {
  const provider = useRef(new BasicTracerProvider());

  const configure = useCallback(() => {
    const exporter = new ConsoleSpanExporter();
    const processor = new SimpleSpanProcessor(exporter);

    provider.current.addSpanProcessor(processor);
    provider.current.register();
  }, []);

  useEffect(() => {
    const providerRef = provider.current;

    try {
      configure();
    } catch (e) {
      console.warn("Provider was not initialized", e);
    }

    return () => {
      const shutdown = async () => {
        // this is important if we are creating more than one instance of a Provider
        await providerRef.shutdown();
      };

      shutdown();
    };
  }, [configure]);

  return provider.current;
};

export default useProvider;
