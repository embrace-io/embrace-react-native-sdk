# Developing

## Setup

```bash
corepack enable
yarn install
```

## Adding a new package

Any new package under ./packages/ will get automatically picked up as a new Yarn workspace. The directory should include:
- `package.json` with name, description, main, typings (other fields will be filled by yarn constraints, version is supplied by Lerna)
- `tsconfig.json` that extends from the one at the root
- `README.md`
- `src/` and `__tests__/` folders to contain the code for the package

## Adding dependencies

Since we are using Yarn workspaces `dependencies` should not be added to the root `package.json` (see [more details](https://stackoverflow.com/a/53558779)).
If multiple packages include the same dependency Yarn constraints will enforce that the version used matches.
`devDependencies` are fine to add at the root `package.json` (see [more details](https://github.com/lerna/lerna/issues/1079#issuecomment-337660289))
if they are only needed at the top-level, otherwise add them to just the individual package that requires it. If they
are shared between multiple packages then they should be added to the Yarn constraints file to enforce a common version.
This is also where we define common peerDependencies and enforce a common version. These are packages such as React Native
that our packages require but that we leave to the customer to have defined as explicit dependencies.

## Testing changes during development

From the root of the project you can lint and test all packages with:

```bash
yarn lint
yarn test
```

## Manual integration testing

The [example app](examples/react-native-test-suite/) allows you to test out the React Native Embrace SDK in a representative app.

Code changes will **NOT** automatically be picked up by the example app. You **MUST** follow the instructions to test out local changes.

To get started generate a new artifact from whichever packages you modified:

```bash
cd packages/<package-modified>/
yarn build
npm pack    # yarn pack behaves differently, stick to npm pack because that's what lerna publish uses
```

Then update the example app with that local artifact:

```bash
cd examples/react-native-test-suite
yarn add ../<path-to-local-artifact>/
```

If you alter the node_modules in any way (either by deleting them or running `yarn install`) or make further changes
then you will need to follow the above instructions again.

Then run the app on either Android or iOS, note that React Native behaves substantially different between debug/release
mode, so we should always test release candidates against a release build.

Android:

```bash
`yarn android --mode=release`
```

iOS:

```bash
pushd ios; pod install; popd;
yarn ios --mode=Release
```

## Testing against new Embrace Android SDK versions

You can test Embrace Android SDK changes by altering the dependency in the core package's [build.gradle](./packages/core/android/build.gradle).
And then either publish a local artifact or if you need CI to pass - publish a beta:

### Local artifact

1. Publish locally with `cd packages/core/android && ./gradlew clean assembleRelease publishToMavenLocal -Pversion=<your-version-here>`
2. Add `mavenLocal()` to the `repositories` closure in `examples/react-native-test-suite/node_modules/embrace-io/android/build.gradle`
3. Set the correct `embrace-android-sdk` version in `examples/react-native-test-suite/node_modules/embrace-io/android/build.gradle`
4. Run the app in the normal way

### Beta artifact

1. Follow the [Android repo](https://github.com/embrace-io/embrace-android-sdk3#qa-releases) instructions for creating a beta
2. Find `rootProject.allprojects.repositories` in `embrace_android/android/build.gradle` and add `maven {url "https://repo.embrace.io/repository/beta"}`
3. Add `mavenLocal()` to the `repositories` closure in `examples/react-native-test-suite/node_modules/embrace-io/android/build.gradle`
4. Set the correct `embrace-android-sdk` version in `examples/react-native-test-suite/node_modules/embrace-io/android/build.gradle`
5. Run the app in the normal way

## Testing against new Embrace iOS SDK versions

### Local artifact

You can test local changes to the iOS SDK by updating the example app's `podspec` and `Podfile` to point to the local copy.

1. In `examples/react-native-test-suite/node_modules/embrace-io/RNEmbrace.podspec`, change the dependency on the iOS SDK to `s.dependency 'EmbraceIO-LOCAL'`
2. In `examples/react-native-test-suite/ios/Podfile`, add the following line `pod 'EmbraceIO-LOCAL', :path => 'path/to/ios_sdk'`
3. In `examples/react-native-test-suite/ios`, run the `pod update` command

### Beta artifact

1. Ask the iOS team to publish a beta of the iOS SDK to the `EmbraceIO-DEV` pod
2. In `examples/react-native-test-suite/node_modules/embrace-io/RNEmbrace.podspec`, change the dependency on the iOS SDK to `s.dependency 'EmbraceIO-DEV'`
3. In `examples/react-native-test-suite/ios/Podfile`, add the following line `pod 'EmbraceIO-DEV'`
4. In `examples/react-native-test-suite/ios`, run the `pod update` command

## Automated integration testing

Automated integration testing is being actively developed to replace some of the manual testing outlined above, see [here](./integration-tests/README.md) for more details.

## Branching strategy

Generally all proposed changes should target the `master` branch and new releases are cut from there after QA. One exception
is urgent patch fixes, in those cases a branch should be made from the latest released tag to isolate the fix from any
unreleased changes on `master` and a patch release will be cut from that new branch.

## Releasing

1. Bump the Android (SDK + Swazzler)/iOS dependencies to the latest available stable versions in `./yarn.config.cjs`
2. Run `yarn constraints --fix` to propagate this change to all package.json files
3. Run `yarn build`
4. Bump the RN SDK version according to semver in `./lerna.json`
5. Run the example app on Android + iOS (in release mode) and confirm that a session is captured & appears in the dashboard with useful info
6. Release to npm with `yarn publish-modules`
7. Create a PR with all these changes and merge to `master`
8. Update and publish the [Changelog](https://github.com/embrace-io/embrace-docs/blob/main/docs/react-native/changelog.md) for the release

NOTE: If you make a mistake while publishing you can remove the specific version w/ `npm unpublish <package-name>@<version>`, see [Unpublishing a single version of a package](https://docs.npmjs.com/unpublishing-packages-from-the-registry#unpublishing-a-single-version-of-a-package)