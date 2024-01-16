# React Native Embrace - WebView Tracker

> ## Core Module Required
>
> This module requires [React Native Embrace SDK](https://www.npmjs.com/package/@embrace-io/core).

# Add WebView Tracker

## Adding Context to Sessions

Embrace can collect basic session data and crashes as you've already seen in the [Crash Reporting](https://embrace.io/docs/react-native/integration/crash-reporting) and [Session Reporting](https://embrace.io/docs/react-native/integration/session-reporting) sections.
Embrace can also collect the data from your web page inside a Webview component
Here's how you add the WebView tracker to the session.

## Adding the component

Embrace has a separate module for tracking WebView, to use it you will need to add the WebView Tracker

### Install the component

```sh
yarn add @embrace-io/webview-tracker
```

```sh
npm install @embrace-io/webview-tracker
```

### Adding the method to your code

Add the logEmbraceWebView to your WebView component

```javascript
// Import the Embrace log method
import { logEmbraceWebView } from "@embrace-io/webview-tracker";
import { WebView } from "react-native-webview";

const App = () => {
  const handleOnMessage = (message) => {
    logEmbraceWebView("MyCheckout", message);
  };
  return (
    <WebView
      useWebKit
      onMessage={handleOnMessage}
      source={{ uri: "URL TO TRACK" }}
    />
  );
};
```
