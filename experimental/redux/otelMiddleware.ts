import {
  Dispatch,
  Middleware,
  MiddlewareAPI,
  Action,
  UnknownAction,
} from "redux";
import {TracerProvider, trace} from "@opentelemetry/api";

interface ConfigArgs {
  name: string;
  version: string;
}

const otelMiddleware = <RootState>(
  provider: TracerProvider,
  config: ConfigArgs,
): Middleware<object, RootState> => {
  if (!provider) {
    console.warn("Provider is not available. Spans won't be recorded");
  }

  const tracer = trace.getTracer(config.name, config.version);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return (_: MiddlewareAPI<Dispatch<UnknownAction>, RootState>) => {
    return (next: Dispatch<UnknownAction>) => {
      return (action: Action) => {
        const span = tracer.startSpan("redux-action");
        const result = next(action);

        span.addEvent("dispatch", result);
        span.end();

        return result;
      };
    };
  };
};

export default otelMiddleware;
