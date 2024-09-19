## Package structure

Native modules can't be built outside the context of a React Application, this makes it difficult to run unit tests
on the native side functionality. To get around this limitation the actual Android and iOS native source files for this
module are in native-src/ structured as if they were plugins within an example app.

The source files are then copied over to the android/ and ios/ directories at build time following the structure RN
expects them to have when being packaged as libraries. To avoid editing the wrong spot the source files under those
directories are git ignored and only generated as needed during build.

## Testing

### Testing Android

Tests can be run from Android Studio by adding native-src/android as a Project or from the CLI with `yarn android-test`

### Testing iOS

TODO

## Building

`yarn build` will copy the needed files to android/ and ios/ and then compile the package as normal
