# NPM - React Native Embrace

Embrace gathers the information needed to identify issues and measure performance automatically upon integration. The following React Native guide provides simple instruction on how to call the relevant functions so teams can be provided much needed additional context (logs and user info) and measure the timing of key areas of their app explicitly (moments).

For additional info please refer to the [React Native Guide](https://embrace.io/docs/react-native/).

# Requirements

Only an Embrace App ID and an Embrace API Token.

_If you need an App ID and API Token, contact us at support@embrace.io or on Slack._

# Integration

### Step 1: Add Native Embrace iOS SDK

##### 1.1: Add EmbraceIO's Pod to your Podfile

The Embrace SDK is available through CocoaPods. If you do not use CocoaPods, follow the instructions [here](https://facebook.github.io/react-native/docs/integration-with-existing-apps), on the step `Configuring CocoaPods dependencies`.

Add the `Embrace.io` pod to your Podfile:
(usually located in `YourReactNativeProject/ios/Podfile`).

```pod
target 'YourApp' do
    ...
    pod 'React', :path => '../node_modules/react-native', :subspecs => [
        'Core',
        'CxxBridge',
        'DevSupport',
        'RCTText',
        'RCTNetwork',
        'RCTWebSocket',
        'RCTAnimation'
    ]

    # Add this line in the end of the target block
    pod 'EmbraceIO'

end
```

##### 1.2: Install the Pods

Go into the iOS project folder inside of your React Native app directory, where the Podfile should be located, and on your terminal run:

```console
$ pod install
```

##### 1.3: Initialize the SDK

On the iOS project, you'll find a file named `AppDelegate.m`.
(usually located in `YourReactNativeProject/ios/YourAppName/AppDelegate.m`).

To initialize the Embrace SDK as early as possible, we strongly recommend that you place the Embrace start call on the first line of your `application:didFinishLaunchingWithOptions` callback.

```Objective-C
#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <Embrace/Embrace.h> // Remember to add the import line

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *) launchOptions
{
    // Replace with your APP_ID, which is a 5-character value, e.g. "aBc45"
    [[Embrace sharedInstance] startWithKey:@"APP_ID"];
    ...
    return YES;
}

@end
```

##### Optional:

This is a simplified process for React Native projects. If you want further information on the iOS SDK integration, you can check the steps on the Native [iOS Quick Integration Guide](https://embrace.io/docs/ios/).

### Step 2: Add Native Embrace Android SDK

##### 2.1: Add Android Permissions

Your application must have access to the internet to send events. In order to do so, you must declare permissions in you Android app's Manifest.

Into the android project folder inside of your React Native app directory, look for your app's `AndroidManifest.xml` file.
(usually located in `YourReactNativeProject/android/app/src/main/AndroidManifest.xml`).

Add the following lines inside of the `<manifest>` tag in the `AndroidManifest.xml` file.

```XML
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.myReactNativeProject">

    <!--ADD THESE TWO LINES WITH THE REST OF THE PERMISSIONS-->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <!-- // -->

    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>

    <application
      android:name=".MainApplication"
      ...
    </application>

</manifest>
```

##### 2.2: Add the SDK to your app

The Embrace Android SDK is publicly available on Maven Central. To add it to your app, simply make the following changes in your projects’s build.gradle file:
(usually located in `YourReactNativeProject/android/build.gradle`).

```groovy
...
buildscript {
    repositories {
        mavenCentral() // Ensure this repository is specified
        ...
    }

    dependencies {
        classpath "io.embrace:embrace-swazzler:${findProject(':embrace-io_react-native').properties['emb_android_sdk']}"
        ...
    }
}
...
allprojects {
    repositories {
        mavenCentral() // Ensure this repository is specified
        ...
    }
}
...
```

Then in your app's build gradle file:
(usually located in `YourReactNativeProject/android/app/build.gradle`).

```groovy
apply plugin: 'com.android.application'
// Add this line on top of the file, right below the 'com.android.application' one
apply plugin: 'embrace-swazzler'
```

Also, inside the android block in the same file:

```groovy
...
android {
    ...
    embrace {
        // Replace with your APP_ID, which is a 5-character value, e.g. "aBc45" and the token
        appId = '<APP_ID>'
        apiToken = '<APP_TOKEN>'
    }
    compileOptions {
        // If compile options is not present, add it.
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    ...
}
...
```

##### 2.3: Initialize the SDK

Initialize the Embrace client as early as possible so we can correctly track crashes, OOMs, ANRs and termination.
Open the `MainApplication.java` class and add the following lines:
(usually located in `YourReactNativeProject/android/app/src/main/java/com/YourAppName/MainApplication.java`).

```java
import io.embrace.android.embracesdk.Embrace; // Add the import line

public class MainApplication extends Application implements ReactApplication {

    ...

    @Override
    public void onCreate() {
        super.onCreate();
        Embrace.getInstance().start(this); // Add this line right after the super.onCreate();
        ...
    }
    ...
}
```

##### 2.4: Define the App Startup

Embrace automatically detects the beginning and end of the Startup. However, since Startups end in multiple ways - a deep link to a particular activity, a load of a home screen, a promotion, you must explicitly define which activities do not constitute the end of a Startup.

Add `@StartupActivity` annotation to the `MainActivity.java` if you want to handle the startup end time:
(usually located in `YourReactNativeProject/android/app/src/main/java/com/YourAppName/MainActivity.java`).

```java
// Add this annotation
@StartupActivity
public class MainActivity extends ReactActivity {
    ...
}
```

##### Optional:

This is a simplified process for React Native projects. If you want further information on the Android SDK integration, you can check the steps on the Native [Android Quick Integration Guide](https://embrace.io/docs/android/).

### Step 3: Add the embrace-io npm package to your React Native Project

In order to access the native functionalities that the Embrace SDKs provide, we built a wrapper using an npm package, fully compatible with react-native linking logic.
Open your terminal and on the root of your React Native project install the npm package by running the following:

```console
$ npm i -S embrace-io
```

### Step 4: Link embrace-io

React Native offers a pretty handy command that automatically links native modules with you React Native application.
For more info, you can get it on the [Original Documentation Site](https://facebook.github.io/react-native/docs/linking-libraries-ios).

To link embrace-io, open your terminal and on your React Native project root run:

```console
$ react-native link embrace-io
```

### Troubleshoot Step - Deprecated instruction on you app's build gradle file.

During the linking process, React native will add a line to your android `app/build.gradle` file like this:

```gradle
...
compile project(':embrace-io')
```

Be aware that the compile instruction has been deprecated but React Native still uses it on the Linking process.
If that line is causing issues, you can replace it with:

```gradle
...
implementation project(':embrace-io')
```

`implementation` is the right instruction for the compiler to add dependency to the project.
You can read more about this [here](https://docs.gradle.org/current/userguide/java_library_plugin.html#sec:java_library_separation)

### Step 5: Install latest pods

Once you're done linking, it's necessary to download the pods that were linked to the project.
To do so, go into the iOS project folder inside of your React Native app directory, where the Podfile should be located, and run:

```console
$ pod install
```

This should download `RNEmbrace` pod to your iOS Project.

### Step 6: Call Methods

A good place to start is after your startup moment ends. This moment starts automatically with the code added to AppDelegate.m on iOS or MainActivity.java on Android, and you should end on Component mount similar to the below code.

```javascript
import { endAppStartup } from "embrace-io";

type Props = {};
export default class App extends Component<Props> {
  componentDidMount() {
    endAppStartup();
  }
}
```

### Step 7: Integrate the User Identifier, Logs and Moments into your App

Since React Native is built with either an iOS or Android native framework, most of the functionality integrated to effectively use Embrace can be called either in Swift / Obj-C, Java, or Javascript. Please follow the iOS Quick Integration or Android Quick Integration for the remaining steps to complete your integration.

_The following calls located in the file, embrace.js, are listed below for reference._

```javascript
// Startup: Call each place a startup may conclude.  Remember those deeplinks!
endAppStartup(properties: ?Dictionary<Any>)

// User Identifiers: Set (or clear) one or more User Identifiers on app start up or registration
setUserIdentifier(userIdentifier: String)
clearUserIdentifier()

setUsername (username: String)
clearUsername()

setUserEmail(userEmail: String)
clearUserEmail()

setUserAsPayer()
clearUserAsPayer()
// Breadcrumbs: Log a Breadcrumb to display these on the User Timelines
addBreadcrumb(message: String)

// Views: Log a Screen as screens are not automatically detected when in JS
logScreen(screenName: String)

// Moments : Start and End a Moment.
// For ex, a purchase is from click-to-purchase to both success or failure
// For more information on Moments, please refer to the docs in the links below

startMoment(name: String, identifier: ?String, properties: ?Dictionary<Any>)

startMomentAllowingScreenshot (name: String, allowScreenshot: Boolean, identifier: ?String, properties: ?Dictionary<Any>)

endMoment(name: String, identifier: ?String, properties: ?Dictionary<Any>)

//Logs : Logs are aggregated and searchable for insights and finding specific carts, users and other properties.
//Logs are sent immediately to assure effective replays of problematic sessions
export const WARNING = 'warning';
export const INFO = 'info';
export const ERROR = 'error';

logMessage = (message: String, severity: 'info' | 'warning' | 'error' = 'error', properties: ?Dictionary<Any>)

// Personas : Include a user in a segment
// User personas are of specific types. For more info, please refer to the docs in the links below
addUserPersona(persona: String)
clearUserPersona(persona: String)

//Custom Views :  specify views that will be displayed in the dashboard
startView(view: string)
endView (view: string)

//Session Properties :  specify properties for your sessionsgit
addSessionProperty(key: string, value: string, permanent: boolean)
removeSessionProperty(key: string)
getSessionProperties()

// Manual session ending: remember to check your embrace-config file to enable it.
endSession = (clearUserInfo: boolean = false)

```
