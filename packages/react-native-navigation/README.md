# React Native Embrace - React Native Navigation

> [!IMPORTANT]
>
> This module requires [React Native Embrace SDK](https://www.npmjs.com/package/@embrace-io/react-native).

Embrace can collect basic session data and crashes as you've already seen in the [Crash Reporting](https://embrace.io/docs/react-native/integration/crash-reporting) and [Session Reporting](https://embrace.io/docs/react-native/integration/session-reporting) sections.
Embrace can also collect the screens that your app opened and include it as context within your sessions.
Here's how you add the screen tracker to the session.

### Install the component

```sh
yarn add @embrace-io/react-native-navigation
```

Or

```sh
npm install @embrace-io/react-native-navigation
```

### Adding the component to your code

Apply the EmbraceNavigationTracker to your Navigation instance. You should do this in your entry point, usually index.js

> [!TIP]
> 
> If you have more than one navigation instance, you can pass a second parameter to the build method with an identifier

```javascript
import { Navigation } from "react-native-navigation";

// Start - Add those lines
import EmbraceNavigationTracker from "@embrace-io/react-native-navigation";
EmbraceNavigationTracker.build(Navigation);
// End - Add those lines

Navigation.registerComponent("myLaunchScreen", () => App);
Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setRoot({
    root: {
      stack: {
        children: [
          {
            component: {
              name: "myLaunchScreen",
            },
          },
        ],
      },
    },
  });
});
```

## Disable Auto Tracking for Native Screens

Embrace automatically collects the native screens, if you do not want to see them in the session you can disable it.

### Android:

Go to your embrace-config.json inside android/app/src/main and add the sdk_config, your file should be like this

```json
{
  "app_id": "APP_ID",
  "api_token": "API_TOKEN",
  ...
  // Add these lines
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