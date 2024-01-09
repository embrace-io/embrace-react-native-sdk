# React Native Embrace - Redux Tracker

> ## Core Module Required
>
> This module requires [React Native Embrace SDK](https://www.npmjs.com/package/@embrace-react-native/core).

# Add React Redux Tracker

## Adding Context to Sessions

Embrace can collect basic session data and crashes as you've already seen in the [Crash Reporting](https://embrace.io/docs/react-native/integration/crash-reporting) and [Session Reporting](https://embrace.io/docs/react-native/integration/session-reporting) sections.
Embrace can also collect the actions that your app dispatched and its state (SUCCESS AND FAILED)
Here's how you add the redux tracker to the session.

## Adding the component

Embrace has a separate module for tracking Redux's Actions, to use it you will need to add the React Redux Tracker

### Install the component

```sh
yarn add @embrace-react-native/action-tracker
```

```sh
npm install @embrace-react-native/action-tracker
```

### Adding the component to your code

Add an useRef for the NavigationContainer and pass it to Embrace's hook

```javascript
import { applyMiddleware, compose, configureStore } from "@reduxjs/toolkit";

// Import the Embrace's Middleware
import { buildEmbraceMiddleware } from "@embrace-react-native/action-tracker";

// Create the Enhancer that applies the Embrace's Middleware
const middlewareEnhancer = applyMiddleware(buildEmbraceMiddleware());

// Compose your Enhancers with the Embrace's enahncer
const composedEnhancers = compose(middlewareEnhancer);
export default configureStore({
  // your reducers
  enhancers: [composedEnhancers],
});
```
