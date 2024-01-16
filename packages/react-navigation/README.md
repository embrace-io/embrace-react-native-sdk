# React Native Embrace - React Navigation

> ## Core Module Required
>
> This module requires [React Native Embrace SDK](https://www.npmjs.com/package/@embrace-io/core).

# Add React Navigation screen tracker

## Adding Context to Sessions

Embrace can collect basic session data and crashes as you've already seen in the [Crash Reporting](https://embrace.io/docs/react-native/integration/crash-reporting) and [Session Reporting](https://embrace.io/docs/react-native/integration/session-reporting) sections.
Embrace can also collect the screens that your app opened and include it as context within your sessions.
Here's how you add the screen tracker to the session.

Currently we are only supporting the React Navigation SDK, if you are using another library please contact us at <support@embrace.io> or on Slack if you would like to request support.

## Adding the component

Embrace has a separate module for tracking Screens, to use it you will need to add the React Navigation Tracker

### Install the component

```sh
yarn add @embrace-io/react-navigation
```

```sh
npm install @embrace-io/react-navigation
```

### Adding the component to your code

Add an useRef for the NavigationContainer and pass it to Embrace's hook

```javascript
import {useRef} from 'react'
import {useEmbraceNavigationTracker} from '@embrace-io/react-navigation';

function App() {
  // Create the reference
  const navigationRef = useRef();
  // Pass the reference to Embrace's Hook
  useEmbraceNavigationTracker(navigationRef);

  return (
      // Assign the NavigationContainer reference value to the useRef created
      <NavigationContainer ref={navigationRef}>
        <Screens... />
      </NavigationContainer>
  );
}
```

## Disable Auto Tracking for Native Screens

Embrace automatically collects the native screens, if you do not want to see them in the session you can disable it.

### Android:

Go to your embrace-config.json inside android/app/src/main and add the sdk_config, your file should be like this

```javascript
{
  "app_id": "APP_ID",
  "api_token": "API_TOKEN",
  ...
  // Add this lines
  "sdk_config": {
    "view_config": {
      "enable_automatic_activity_capture": false
    }
  }
}
```

### iOS:

Go to your Embrace-info.plist inside ios/YOURAPPNAME and add ENABLE_AUTOMATIC_VIEW_CAPTURE as false, your file should be like this

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>API_KEY</key>
	<string>{API_KEY}</string>
	<key>CRASH_REPORT_ENABLED</key>
	<true/>
   <!-- Add this key and the value as false-->
	<key>ENABLE_AUTOMATIC_VIEW_CAPTURE</key>
	<false/>
</dict>
</plist>

```
