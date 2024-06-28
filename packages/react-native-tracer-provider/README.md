# React Native Embrace - Native Tracer Provider

> [!IMPORTANT]
>
> This module requires the [React Native Embrace SDK](https://www.npmjs.com/package/@embrace-io/react-native).

This package wraps Embrace's native SDKs with an OpenTelemetry [Tracer Provider](https://opentelemetry.io/docs/concepts/signals/traces/#tracer-provider).
Allowing custom instrumentations to be creating following OpenTelemetry's JS API as well as collecting traces from
any JS Opentelemetry instrumentation library or native instrumentation included in your application.

### Install

```sh
yarn add @embrace-io/native-tracer-provider
```

Or

```sh
npm install @embrace-io/native-tracer-provider
```

### Setup in your code

Initialize the Tracer Provider near the start of your app's cycle:

```javascript

import { EmbraceNativeTracerProvider } from "@embrace.io/react-native-tracer-provider";
import { trace } from "@opentelemetry/api";

const optionalConfig = {...}; // See EmbraceNativeTracerProviderConfig in ./src/types/ for possible options
trace.setGlobalTracerProvider(new EmbraceNativeTracerProvider(optionalConfig));
```

Any opentelemetry instrumentation libraries in your app will now find Embrace's provider and use it for tracing.

> [!NOTE]
>
> Setting as the global tracer provider is not required, if you prefer you can simply pass a reference to the provider
> and use it only where you want to

You can also use the tracer to add custom instrumentations to your application:

```javascript
import { trace } from "@opentelemetry/api";

const MyScreen = () => {
  useEffect(() => {
    const tracer = trace.getTracer("my-application", "my-app-version");
    
    span = tracer.startSpan("my-span");
    
    someAsyncOperation().then(() => span.end());
  }, []);
  return <View />;
};
```