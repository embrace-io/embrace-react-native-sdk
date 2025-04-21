# React Native Embrace - Native Tracer Provider

> [!IMPORTANT]
>
> This module requires the [React Native Embrace SDK](https://www.npmjs.com/package/@embrace-io/react-native).

This package wraps Embrace's native SDKs with an OpenTelemetry [Tracer Provider](https://opentelemetry.io/docs/concepts/signals/traces/#tracer-provider).
Allowing custom instrumentations to be creating following OpenTelemetry's JS API as well as collecting traces from
any JS Opentelemetry instrumentation library or native instrumentation included in your application.

### Install

npm:

```sh
npm install @embrace-io/react-native-tracer-provider
```

yarn:

```sh
yarn add @embrace-io/react-native-tracer-provider
```

For iOS you will also need to install or update pods for the application:

```sh
cd ios && pod install --repo-update
```

### Setup in your code

Initialize the Tracer Provider near the start of your app's cycle. The Embrace SDK will need to have started before you
can use the tracer provider. To achieve this you can either start the SDK before the component that sets up the provider
renders, or you can make use of the `enabled` parameter on the `useEmbraceNativeTracerProvider` hook to prevent it from
triggering until the SDK is ready as in this example:

```javascript
const {isStarted} = useEmbrace({
  ios: SDK_CONFIG,
});

const optionalConfig = {...}; // See EmbraceNativeTracerProviderConfig in ./src/types/ for possible options
const {tracerProvider: embraceTracerProvider, tracer: embraceTracer} = useEmbraceNativeTracerProvider(optionalConfig, isStarted);
```

You can then use the provided tracer to add custom instrumentations to your application:

```javascript

const MyScreen = () => {
  useEffect(() => {
    span = embraceTracer.startSpan("my-span");

    someAsyncOperation().then(() => span.end());
  }, []);
  return <View />;
};
```

If you'd prefer not to have to pass around the `tracer` object you can instead leverage helpers from the
`@opentelemetry/api` library. First register the Embrace tracer provider as the global one:

```javascript
import { trace } from "@opentelemetry/api";
trace.setGlobalTracerProvider(embraceTracerProvider);
```

You can then create new tracers on the fly where needed and the `getTracer` method from the OTel API will know to
use Embrace as the tracer provider:

```javascript
import { trace } from "@opentelemetry/api";

const MyScreen = () => {
  useEffect(() => {
    const tracer = trace.getTracer("my-application");
    
    span = tracer.startSpan("my-span");

    someAsyncOperation().then(() => span.end());
  }, []);

  return <View />;
};
```

This method of registering the tracer provider globally also means that any OTel instrumentation libraries in your app
to will now automatically be able to find Embrace's provider and use it for tracing.

### Limitations

* Adding links to spans is not currently supported, `span.addLink(...)` and `span.addLinks(...)` behave as noops.
* Only string span attributes are currently supported, other types will be converted to their string representations
* `parentSpanId` will not be set if the parent span was already ended in a previous session when the child span is started
* Due to a limitation in the OTEL Swift API `schemaUrl` in calls to `getTracer` is ignored on iOS
* Since communication with the native modules is asynchronous `span.spanContext()` will return a blank span context if
executed immediately after a call to `startSpan` without yielding, for example:

```javascript
  const mySpan = tracer.startSpan("my-span");
  const spanContext = mySpan.spanContext(); // can be configured to throw an error instead through EmbraceNativeTracerProviderConfig

  console.log(spanContext.traceId) // prints ""
  console.log(spanContext.spanId) // prints ""
```

To avoid this issue you can use the async version:

```javascript
  const mySpan = tracer.startSpan("my-span");
  const spanContext = await (mySpan as EmbraceNativeSpan).spanContextAsync();

  console.log(spanContext.traceId) // prints "51e60a6917dfe46871d7f1d39f66d02c"
  console.log(spanContext.spanId) // prints "b2248eb58720064e"
```