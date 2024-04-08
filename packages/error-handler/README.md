# React Native Embrace - Error Handler

> ## Core Module Required
>
> This module requires [React Native Embrace SDK](https://www.npmjs.com/package/@embrace-io/react-native).

# Add React Native Error Handler

## Adding Context to Sessions

Embrace can collect basic session data and crashes as you've already seen in the [Crash Reporting](https://embrace.io/docs/react-native/integration/crash-reporting) and [Session Reporting](https://embrace.io/docs/react-native/integration/session-reporting) sections.
Embrace can also collect the screens that your app opened and include it as context within your sessions.
Here's how you add the screen tracker to the session.

## Adding the component

Embrace has a separate module for tracking Apollo network, to use it you will need to add the Apollo Tracker

### Install the component

```sh
yarn add @embrace-io/error-handler

```

```sh
npm install @embrace-io/error-handler
```

### Adding the component to your code

Wrap the component where you want to catch the error (it could be App.js).

```javascript
import ErrorHandler from "@embrace-io/error-handler";

const App = () => {
  return (
    <ErrorHandler>
      <MyApp />
    </ErrorHandler>
  );
};
```

## Add a Fallback Component to show in case of error

```javascript
import ErrorHandler from "@embrace-io/error-handler";

const MyFallbackComponent = ({ error, componentStack, resetErrorState }) => {
  return <Button title="Reset" onPress={resetErrorState} />;
};

const App = () => {
  return (
    <ErrorHandler FallbackComponent={MyFallbackComponent}>
      <MyApp />
    </ErrorHandler>
  );
};
```

## Unmount the component with an error and and get the error information

```javascript
import ErrorHandler from "@embrace-io/error-handler";

const App = () => {
  return (
    <ErrorHandler
      unmountChildrenOnError
      onErrorHandler={(error, componentStack) => {
        console.log("onErrorHandler", r.message, componentStack);
      }}
    >
      <MyApp />
    </ErrorHandler>
  );
};
```
