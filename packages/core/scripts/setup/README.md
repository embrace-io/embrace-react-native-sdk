# Installing React Native Embrace SDK using node scripts

## iOS

```shell
node node_modules/@embrace-io/react-native/lib/scripts/setup/installIos.js
```

`installIos.js` execute the default function of `setupIos` that is `run`.

That `run` function will register `iosAppID`, `apiToken` and `iosProjectFolderName` (in case the package.json doesn't match the name with the current iOS folder structure) fields, they have an `asker` method, that asks in the terminal for those inputs. Also it will add the step for the install script and execute the `wizard`.

The setup script for iOS includes:
- `addEmbraceInitializerSwift`: Adds `EmbraceInitializer.swift` to the project which includes the code for setting up and starting the iOS SDK.
- `iosInitializeEmbrace`: It patches the AppDelegate m|mm or swift to call the start method from `EmbraceInitializer.swift`.
- `iOSPodfilePatch`: It patches the Podfile, only in < 0.6 adding the dependency. This is useful if the app does not have autolink for some reason.
- `patchXcodeBundlePhase`: It patches the `Bundle React Native code and images` created by React Native, adding a line to export the sourcemap to a desired path.
- `addUploadBuildPhase`: It adds the `Upload Debug Symbols to Embrace` to the build phase.

## Android

```shell
node node_modules/@embrace-io/react-native/lib/scripts/setup/installAndroid.js
```

`installAndroid.js` execute the default function of `setupAndroid` that is `run`.

That `run` function will register `androidAppID` and `apiToken` fields, they have an `asker` method, that asks in the terminal for those inputs. Also it will add the step for the install script and execute the `wizard`.

- `patchBuildGradle`: It patches the `android/build.gradle` adding the swazzler dependency.
- `patchAppBuildGradle`: It patches `android/app/build.gradle` adding the `swazzler apply`.
- `createEmbraceJSON`: It creates the config file `embrace-config.json` and add the `appId` and `token` to it.
- `patchMainApplication`: It patches the MainApplication java or kotlin and adds the import and the Embrace start method.

# Uninstalling React Native Embrace SDK using node scripts

```shell
node node_modules/@embrace-io/react-native/lib/scripts/setup/uninstall.js
```
`uninstall.js` execute the the cleanup for both Android and iOS. It will ask only for the name of the iOS project in case it doesn't match with the name of the package.json.

Shoud revert all changes produced by the `installIos.js` and `installAndroid.js` scripts.
