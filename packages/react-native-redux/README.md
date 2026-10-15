# React Native Embrace - Redux

> [!IMPORTANT]
>
> This module requires the [React Native Embrace SDK](https://www.npmjs.com/package/@embrace-io/react-native).

This package uses Embrace's React Native SDK and OpenTelemetry Tracer Provider to collect telemetry around dispatching
actions with Redux. It provides a custom middleware that can be configured with your Redux store.

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

### With hooks

```typescript
import {useEffect, useState} from "react";
import {EnhancedStore, configureStore, Tuple} from "@reduxjs/toolkit";
import {useEmbrace, useEmbraceNativeTracerProvider} from "@embrace-io/react-native";
import {useEmbraceMiddleware} from "@embrace-io/react-native-redux";

const MyApp = () => {
  const {isStarted} = useEmbrace({ios: {appId: "MYAPP"}});
  const {tracerProvider} = useEmbraceNativeTracerProvider({}, isStarted);
  const {middleware} = useEmbraceMiddleware(tracerProvider);
  const [store, setStore] = useState<EnhancedStore>();

  useEffect(() => {
    if (middleware && !store) {
      setStore(
        configureStore({
          reducer: rootReducer,
          middleware: () => new Tuple(middleware),
        }),
      );
    }
  }, [middleware, store]);

  ...

};
```

### Without hooks

```typescript
import {configureStore, Tuple} from "@reduxjs/toolkit";
import {EmbraceNativeTracerProvider, initialize} from "@embrace-io/react-native";
import {createEmbraceMiddleware} from "@embrace-io/react-native-redux";

const setupStore = async () => {
  await initialize({sdkConfig: {ios: {appId: "abc123"}}});
  const tracerProvider = new EmbraceNativeTracerProvider();
  return configureStore({
    reducer: rootReducer,
    middleware: () => new Tuple(createEmbraceMiddleware(tracerProvider)),
  });
};
```
