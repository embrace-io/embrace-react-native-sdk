# Developing React Native

The [example app](examples/react-native-test-suite/) allows you to test out the React Native Embrace SDK in a representative app.

Code changes will **NOT** automatically be picked up by the example app. You **MUST** follow the instructions to test out local changes.

To get started, install node_modules with `yarn`.

React Native behaves substantially different between debug/release mode - we should always test release candidates against a release build.

## Run on Android

To run on Android, follow the instructions below for debug/release mode.

### Debug mode

`yarn android`

### Release mode

`yarn android --variant=release`

## Run on iOS

To run on iOS, follow the instructions below for debug/release mode.

`pushd ios; pod install; popd;`

### Debug mode

`yarn ios`

### Release mode

`yarn ios --configuration=Release`

# Testing SDK changes locally

These instructions are temporary & subject to change while we figure out a better way of testing changes.

If you alter the node_modules in any way (either by deleting them or running `yarn install`) then you might need to follow the instructions again.

## Testing JavaScript changes

You can test React Native changes adding this library using `yarn` or `npm`. To do this you have to run `yarn pack` to generate the dist folder and then, in your test project run `yarn add localPath/embrace-io`. (If for some reason your local sdk has node-modules inside, that might bring some errors, delete that folder since it shouldn't have one)

## Testing Android changes

You can test Android changes in our React Native SDK by altering the dependency in the React Native package's `build.gradle`. You can either publish a local artefact with `./gradlew clean assembleRelease publishToMavenLocal`, or if you need CI to pass - publish a beta as documented in the [Android repo](https://github.com/embrace-io/embrace-android-sdk3#qa-releases).

### Local artefact

1. Publish locally with `./gradlew clean assembleRelease publishToMavenLocal -Pversion=<your-version-here>`
2. Add `mavenLocal()` to the `repositories` closure in `examples/react-native-test-suite/node_modules/embrace-io/android/build.gradle`
3. Set the correct `embrace-android-sdk` version in both `examples/react-native-test-suite/node_modules/embrace-io/android/build.gradle`
4. Run the app in the normal way

### Beta artefact

1. Follow the [Android repo](https://github.com/embrace-io/embrace-android-sdk3#qa-releases) instructions for creating a beta
2. Find `rootProject.allprojects.repositories` in `embrace_android/android/build.gradle` and add `maven {url "https://repo.embrace.io/repository/beta"}`
3. Add `mavenLocal()` to the `repositories` closure in `examples/react-native-test-suite/node_modules/embrace-io/android/build.gradle`
4. Set the correct `embrace-android-sdk` version in both `examples/react-native-test-suite/node_modules/embrace-io/android/build.gradle`
5. Run the app in the normal way

## Testing iOS changes locally

### Local artefact

You can test changes local changes to the iOS SDK by updating the React Native Embrace project's `podspec` and `Podfile` to point to the local copy.

1. In `examples/react-native-test-suite/node_modules/embrace-io/RNEmbrace.podspec`, change the dependency on the iOS SDK to `s.dependency 'EmbraceIO-LOCAL'`
2. In `examples/react-native-test-suite/ios/Podfile`, add the following line `pod 'EmbraceIO-LOCAL', :path => 'path/to/ios_sdk'`
3. In `examples/react-native-test-suite/ios`, run the `pod update` command

### Beta artefact

1. Ask the iOS team to publish a beta of the iOS SDK to the `EmbraceIO-DEV` pod
2. In `examples/react-native-test-suite/node_modules/embrace-io/RNEmbrace.podspec`, change the dependency on the iOS SDK to `s.dependency 'EmbraceIO-DEV'`
3. In `examples/react-native-test-suite/ios/Podfile`, add the following line `pod 'EmbraceIO-DEV'`
4. In `examples/react-native-test-suite/ios`, run the `pod update` command

# Releasing the SDK

0. Bump the Android (SDK + Swazzler)/iOS dependencies to the latest available stable versions
   0.1. Update the iOS SDK version in `./RNEmbrace.podspec`
   0.2. Update the Android SDK version in `./android/gradle.properties`
1. Bump the SDK version according to semver
2. Run the example app on Android + iOS (in release mode) and confirm that a session is captured & appears in the dashboard with useful info
3. Create a PR with all these changes and merge to `master`
4. Release to npm with `yarn publish --tag <your-version-here>`

# Releasing a beta SDK version

To release a beta version of the SDK you should add a suffix to the version string. For example, `1.3.0-beta01` would be an appropriate name.

Otherwise, the release process will be exactly the same as for a regular release.
