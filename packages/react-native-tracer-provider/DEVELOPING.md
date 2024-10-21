## Package structure

Native modules can't be built outside the context of a React Application, this makes it difficult to run unit tests
on the native side functionality. To get around this limitation the actual Android native source files and tests for this
module are in native-src/ structured as if they were plugins within an example app. For iOS only the test files are in
native-src/ since the example app project can reference them fine from ios/.

The source files are then copied over to the android/ directory at build time following the structure RN
expects them to have when being packaged as libraries. To avoid editing the wrong spot the source files under those
directories are git ignored and only generated as needed during build.

To keep dependency versions in sync the ones that are common to both the source and tests are kept in
a single file to be referenced by both projects:
- Android
    - native-src/android/app/dependencies.gradle (copied to android/ at build time)
    - referenced by native-src/android/build.gradle for tests
    - referenced by android/build.gradle for the package
- iOS
    - ios/dependencies.rb
    - referenced by native-src/ios/Podfile for tests
    - referenced by ReactNativeTracerProvider.podspec for the package

## Testing

### Testing Android

Tests can be run from Android Studio by adding native-src/android as a Project or from the CLI with `yarn android:test`

### Testing iOS

Tests can be run from XCode by opening native-src/ios/ReactNativeTracerProvider.xcworkspace as a workspace or from the CLI with `yarn ios:test`

## Building

`yarn build` will copy the needed files to android/ and ios/ and then compile the package as normal