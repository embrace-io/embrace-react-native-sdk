# React Native Embrace - Orientation Tracker

> ## Core Module Required
>
> This module requires [React Native Embrace SDK](https://www.npmjs.com/package/@embrace-io/core).

# Add Orientation Tracker

## Adding Context to Sessions

Embrace can collect basic session data and crashes as you've already seen in the [Crash Reporting](https://embrace.io/docs/react-native/integration/crash-reporting) and [Session Reporting](https://embrace.io/docs/react-native/integration/session-reporting) sections.
Embrace can also collect when your app changes its orientation
Here's how you add the Orientation tracker to the session.

## Adding the component

Embrace has a separate module for tracking Orientation, to use it you will need to add the Orientation Tracker

### Install the component

```sh
yarn add @embrace-io/orientation-change-tracker
```

```sh
npm install @embrace-io/orientation-change-tracker
```

### Adding the method to your code

Add the useEmbraceOrientationLogger to your component

```javascript
// Import the Embrace log method
import { useEmbraceOrientationLogger } from "@embrace-io/orientation-change-tracker";

const App = () => {
  useEmbraceOrientationLogger()
  return (
   ...
  );
};
```
