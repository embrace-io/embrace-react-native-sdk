import {useEffect} from "react";
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
const exporter = new ConsoleSpanExporter();
const processor = new SimpleSpanProcessor(exporter);
const provider = new BasicTracerProvider();

const configure = () => {
  provider.addSpanProcessor(processor);
  provider.register();
};

const useProvider = () => {
  useEffect(() => {
    try {
      configure();
    } catch (e) {
      console.log(e);
    }
  }, []);

  return provider;
};

export default useProvider;
