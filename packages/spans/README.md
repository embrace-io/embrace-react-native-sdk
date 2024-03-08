# React Native Embrace - Performance Tracing

> ## Core Module Required
>
> This module requires [React Native Embrace SDK](https://www.npmjs.com/package/@embrace-io/react-native).

# Add React Performance Tracing

## Adding Context to Sessions

Embrace can collect session data and crashes as you've already seen in the [Crash Reporting](https://embrace.io/docs/react-native/integration/crash-reporting) and [Session Reporting](https://embrace.io/docs/react-native/integration/session-reporting) sections.
Embrace’s Performance Tracing solution gives you complete visibility into any customized operation you’d like to track, enabling you to identify, prioritize, and resolve any performance issue. With our tool, you can quickly spot any bottlenecks in your app’s architecture, pinpoint areas you need to troubleshoot with high precision, and ultimately deliver a truly optimized user

## Adding the component

Embrace has a separate module for perfomance tracing, to use it you will need to add the Spans Plugin

### Install the component

```sh
yarn add @embrace-io/react-native-spans
```

```sh
npm install @embrace-io/react-native-spans
```

### Adding the component to your code

```javascript

import { startSpan, stopSpan } from "@embrace-io/react-native-spans";
const App = () => {
  const spanId = useRef<string>();
  const getDataFromServer = () => {
    // Create a span, store the spanId to add Events, Attributes and stop the span
    startSpan(`tracingName`).then((id) => {
      spanId.current = id;
    });
    getData().then(stopTracing);
  };
  const stopTracing = () => {
    // You must stop the tracing
    stopSpan(spanId.current);
  };
  useEffect(() => {
    getDataFromServer();
  }, []);
  return <View />;
};
```
