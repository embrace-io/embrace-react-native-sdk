import {
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";

let provider: BasicTracerProvider;

const createInstanceProvider = () => {
  provider = new BasicTracerProvider();

  const exporter = new ConsoleSpanExporter();
  const processor = new SimpleSpanProcessor(exporter);

  provider.addSpanProcessor(processor);
  provider.register();

  return provider;
};

const shutdownInstanceProvider = async () => {
  await provider.shutdown();
  console.log("Provider has been shutdown");
};

export {createInstanceProvider, shutdownInstanceProvider};
