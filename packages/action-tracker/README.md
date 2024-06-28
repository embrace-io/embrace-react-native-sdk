# React Native Embrace - Redux Tracker

> [!IMPORTANT]
>
> This module requires [React Native Embrace SDK](https://www.npmjs.com/package/@embrace-io/react-native).

Embrace can collect basic session data and crashes as you've already seen in the [Crash Reporting](https://embrace.io/docs/react-native/integration/crash-reporting) and [Session Reporting](https://embrace.io/docs/react-native/integration/session-reporting) sections.
Embrace can also collect the actions that your app dispatched and its state (SUCCESS AND FAILED)
Here's how you add the redux tracker to the session.

### Install the component

```sh
yarn add @embrace-io/action-tracker
```

Or

```sh
npm install @embrace-io/action-tracker
```

### Adding the component to your code

```javascript
import { applyMiddleware, compose, configureStore } from "@reduxjs/toolkit";

// Import Embrace's Middleware
import { buildEmbraceMiddleware } from "@embrace-io/action-tracker";

// Create the Enhancer that applies Embrace's Middleware
const middlewareEnhancer = applyMiddleware(buildEmbraceMiddleware());

// Compose your Enhancers with Embrace's enhancer
const composedEnhancers = compose(middlewareEnhancer);
export default configureStore({
  // your reducers
  enhancers: [composedEnhancers],
});
```