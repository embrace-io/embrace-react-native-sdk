import {
  BasicTracerProvider,
  SpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";

let provider: BasicTracerProvider;

const createInstanceProvider = (exporter: SpanExporter) => {
  provider = new BasicTracerProvider();

  const processor = new SimpleSpanProcessor(exporter);

  provider.addSpanProcessor(processor);
  provider.register();

  return provider;
};

const shutdownInstanceProvider = async () => {
  if (provider) {
    await provider.shutdown();
  }
};

export {createInstanceProvider, shutdownInstanceProvider};
