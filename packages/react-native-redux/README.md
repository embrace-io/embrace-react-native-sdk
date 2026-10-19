# React Native Embrace - Redux

> [!IMPORTANT]
>
> This module requires the [React Native Embrace SDK](https://www.npmjs.com/package/@embrace-io/react-native).

This package uses Embrace's React Native SDK and OpenTelemetry Tracer Provider to collect telemetry around dispatching
actions with Redux. It provides a custom middleware that can be configured with your Redux store.

For more information, see [Track Redux actions](https://embrace.io/docs/react-native/features/redux-actions/).

## Install the component

npm:

```sh
npm install @embrace-io/react-native-redux
```

yarn:

```sh
yarn add @embrace-io/react-native-redux
```

## Add the middleware

By default, the middleware records its spans with the global OpenTelemetry tracer provider. Since `initialize` from
`@embrace-io/react-native` registers the Embrace tracer provider as the global one by default, the middleware needs no further setup:

```typescript
import {configureStore} from "@reduxjs/toolkit";
import {createEmbraceMiddleware} from "@embrace-io/react-native-redux";

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(createEmbraceMiddleware()),
});
```

## When Embrace is not the global tracer provider

If you pass `tracerProviderConfig: {registerGlobally: false}` to `initialize` but still want the middleware's spans to reach Embrace, pass the Embrace tracer provider to the middleware directly. Note that `getEmbraceTracerProvider()` returns `undefined` until `initialize` has run, so be sure to create the store after calling `initialize`:

```typescript
import {configureStore} from "@reduxjs/toolkit";
import {getEmbraceTracerProvider} from "@embrace-io/react-native";
import {createEmbraceMiddleware} from "@embrace-io/react-native-redux";

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(
      createEmbraceMiddleware(getEmbraceTracerProvider()), // must be called after initialize
    ),
});
```
