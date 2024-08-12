# Install Scripts

## Ios

### Install Script

```shell
node node_modules/@embrace-io/react-native/lib/scripts/setup/installIos.js
```

`installIos.js` execute the default function of `setupIos` that is `run`

That `run` function will register `iosAppID and apiToken` asker fields, they have an `asker` method, that asks in the terminal for those input. Also it will add the step for the install script and execute the `wizard`

The setup script for ios includes
`addEmbraceInitializerSwift`: Adds `EmbraceInitializer.swift` to the project which includes the code for setting up and starting the iOS SDK.
`iosInitializeEmbrace`: It patches the AppDelegate m|mm or swift to call the start method from `EmbraceInitializer.swift`
`iosPodfile`: It patches the Podfile, only in < 0.6 adding the dependency. This is useful if the app does not have autolink for some reason.
`patchXcodeBundlePhase`: It patches the `Bundle React Native code and images` created by React Native, adding a line to export the sourcemap to a desired path
`addUploadBuildPhase`: It adds the `Upload Debug Symbols to Embrace` to the build phase

## Android

### Install Script

```shell
node node_modules/@embrace-io/react-native/lib/scripts/setup/installAndroid.js
```

`installAndroid.js` execute the default function of `setupAndroid` that is `run`

That `run` function will register `androidAppID and apiToken` asker fields, they have an `asker` method, that asks in the terminal for those input. Also it will add the step for the install script and execute the `wizard`

`patchBuildGradle`: It patches the `android/build.gradle` adding the swazzler dependency.
`patchAppBuildGradle`: It patches `android/app/build.gradle` adding the `swazzler apply`
`createEmbraceJSON`: It creates the config file `embrace-config.json` and add the AppId and Token to it
`patchMainApplication`: It patches the MainApplication java or kotlin and adds the import and the Embrace start method
