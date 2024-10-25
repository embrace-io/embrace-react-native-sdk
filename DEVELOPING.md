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
- `src/` and `__tests__/` folders to contain the code for the package.

If an item from the previous list is missing, the package won't compile.

## Adding dependencies

Since we are using Yarn workspaces `dependencies` should not be added to the root `package.json` (see [more details](https://stackoverflow.com/a/53558779)).
If multiple packages include the same dependency Yarn constraints will enforce that the version used matches.
`devDependencies` are fine to add at the root `package.json` (see [more details](https://github.com/lerna/lerna/issues/1079#issuecomment-337660289))
if they are only needed at the top-level, otherwise add them to just the individual package that requires it. If they
are shared between multiple packages then they should be added to the Yarn constraints file to enforce a common version.
This is also where we define common peerDependencies and enforce a common version. These are packages such as React Native
that our packages require but that we leave to the customer to have defined as explicit dependencies.

## Adding new Native Modules

If new packages needs to connect with native code there are few things to have in mind.
The folder structure should be something like the following:

```
packages/
└── <package-name>/
    ├── ios/                          # containing an Xcode workspace/project
    ├── android/                      # containing an Android workspace/project
    ├── src/
    │   ├── __tests__/
    │   └── index.ts
    ├── tsconfig.json
    ├── package.json
    ├── .eslintrc.js
    ├── README.md
    └── RNEmbrace<PackageName>.podspec    # `RNEmbrace` is the prefix as per convention
```

> Make sure the new `package.json` file list all files/folders we want to get packed during the build and pack process. Example:

```json
{
  "files": [
    "lib",
    "android",
    "ios",
    "RNEmbrace<PackageName>.podspec"
  ],
}
```

This example is configured to pack lib/, android/, ios/ and RNEmbraceNewPackage.podspec into the package we will publish in the future. All folders/files that should be packed and published should be listed here. If they are not there, the pack/publish process will ignore them.

## iOS Native Module

References are very important when developing a new iOS Standalone Native Module, we encourage developers to create new modules through Xcode to avoid any issue related to this.

### Recommended steps

- Open Xcode and create a new workspace.
- Create a new target with the same name
- Create the proper files following the [iOS Native Modules for React Native](https://reactnative.dev/docs/native-modules-ios) official documentation.

This repository already contains classes using Swift. We highly recommend to keep this approach. More information about how to do it can be found in the (official documentation)[https://reactnative.dev/docs/native-modules-ios#exporting-swift].

At the end of this process the ios folder structure should contain something like the following:

```
ios/
└── RNEmbrace<PackageName>.xcworkspace
└── RNEmbrace<PackageName>/
    ├── RNEmbrace<PackageName>.xcodeproj
    ├── RNEmbrace<PackageName>-Bridging-Header.h
    ├── RNEmbrace<PackageName>.m
    └── RNEmbrace<PackageName>.swift
```

This is the bare minimum we need to create a new iOS Native Module.

> Do not forget to properly create the .podspec file outside the ios folder listing all dependencies. Also it's a good idea to check in that this file is in place after run the build and pack the new package. Without this file the new iOS Native Module won't be recognized by the application and won't be installed.

### Create Unit Test suite for the new iOS Native Module

- Under `packages/new-package` create a `test-project` directory.
- Make sure the following structure is created under the new `test-project` directory

```
test-project /
└── ios
    └── Podfile // This should contain the proper React Native install script adding all dependencies we need
└── package.json
└── yarn.lock
```

- Once it's done, open Xcode and create a new project.
- Create a new workspace and link the project it was already created.
- Create a new Target* (Framework). Make sure the Language is Swift, Testing System is XCTest and it's attached to the already created project.
- At this point the structure should look like

```
test-project/
└── ios
    ├── RNEmbrace<PackageName>/
    │   └── RNEmbrace<PackageName>.h // NOTE: The `RNEmbrace<PackageName>.h` file is created automatically by XCode but it will be removed in the future, the target will remain here to link the source code of the component.
    ├── RNEmbrace<PackageName>Tests/
    │   └── RNEmbrace<PackageName>Tests.swift
    ├── RNEmbrace<PackageName>Tests.xcworkspace // created manually
    ├── RNEmbrace<PackageName>Tests.xcodeproj // created manually
    └── Podfile
└── package.json
└── yarn.lock
```
* Notice that `RNEmbrace<PackageName>` and `RNEmbrace<PackageName>Tests` are the Framework + XCTest targets created by xcode.

- Due to this (CocoaPods issue)[https://github.com/CocoaPods/CocoaPods/issues/12583#issuecomment-2357470707] it's needed an extra step before `yarn run install:ios`. Follow the instructions there with both Targets (`RNEmbrace<PackageName>` and `RNEmbrace<PackageName>Tests`).
- Run `yarn install:ios`.
- This should install all dependencies related to React Native and those coming from Embrace (listed in `ios/Podfile`). 
- In XCode click into the new project (files navigator) and right click.
- Click on `Add files to 'RNEmbrace<PackageName>Tests.xcodeproj'`
- Select the folder where the native code is for the new package, i.e `packages/ios/RNEmbrace<PackageName>` (where the swift solution for the component is).
- Make sure this reference is added to the right target (`RNEmbrace<PackageName>`, the one created when we added the Framework + XCTest). Do not copy/move files. The reference is what we need here (Location: `Relative to a Group`)

## Android Native Module
- TBD

## Testing changes during development

From the root of the project you can lint and test all packages with:

```bash
yarn lint
yarn test
```

## Manual integration testing (TODO update after changes to integration testing workflow)

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

## Testing against new Embrace Android SDK versions (TODO update after changes to integration testing workflow)

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

## Testing against new Embrace iOS SDK versions (TODO update after changes to integration testing workflow)

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

## Updating native SDK dependencies

1. Bump the Android (SDK + Swazzler)/iOS dependencies to the latest available stable versions in `./yarn.config.cjs`
2. Run `yarn constraints --fix` to propagate this change to all package.json files
3. Run `yarn build` to update build files to the latest versions

## Automated integration testing

Automated integration testing is being actively developed to replace some of the manual testing outlined above, see [here](./integration-tests/README.md) for more details.

## Branching strategy

Generally all proposed changes should target the `main` branch and new releases are cut from there after QA. One exception
is urgent patch fixes, in those cases a branch should be made from the latest released tag to isolate the fix from any
unreleased changes on `main` and a patch release will be cut from that new branch.

## Releasing

1. Create a release branch off of main and push it to origin
2. Make sure you are logged into the npmjs registry (`npm login`)
3. Release to npm with `yarn publish-modules`, you will be prompted to choose the version number to update to
4. Check https://www.npmjs.com/org/embrace-io, the latest versions should have been published
5. Check https://github.com/embrace-io/embrace-react-native-sdk/tags, a vX.X.X tag should have been pushed
6. Create a PR from your release branch against `main` to merge all the version updates
7. Run an example app and point to the latest released packages to confirm basic behaviour
8. Update and publish the [Changelog](https://github.com/embrace-io/embrace-docs/blob/main/docs/react-native/changelog.md) for the release

NOTE: If you make a mistake while publishing you can remove the specific version w/ `npm unpublish <package-name>@<version>`, see [Unpublishing a single version of a package](https://docs.npmjs.com/unpublishing-packages-from-the-registry#unpublishing-a-single-version-of-a-package)

## Deprecating

If we find a critical issue in particular version that requires a hotfix we should mark that version as deprecated. This
can be done using the following:

```bash
npm deprecate @embrace-io/<package>@"<version>" "some message explaining deprecation"
```

The command will prompt you to login and/or supply 2FA for NPM. You will need to re-run it for each package.

Next commit an update to the [Changelog](https://github.com/embrace-io/embrace-docs/blob/main/docs/react-native/changelog.md)
that notifies about the deprecation like:

```markdown
## <bad version>
*<date>*

:::warning Important
This version contained an issue where .... Please use <fixed-version> instead.
:::
```

If you make a mistake you can undeprecate a package following [these steps](https://www.notion.so/embraceio/Mark-older-releases-as-deprecated-in-the-npmjs-registry-10d7e3c9985280cb9ea5ea1e9f054c83?pvs=4).