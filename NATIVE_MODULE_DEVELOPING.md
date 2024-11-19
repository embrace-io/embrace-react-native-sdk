# Native Developing

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

> Make sure the new `package.json` file list all files/folders we want to get packed. Notice that in the following example android has a very detailed list. That's the minimum the Android Native module needs for building/running into a React Native application.

```json
{
  "files": [
    "lib",
    "android/gradle",
    "android/src",
    "android/build.gradle",
    "android/dependencies.gradle",
    "android/gradle.properties",
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

This repository already contains classes using Swift. We highly recommend to keep this approach. More information about how to do it can be found in the [official documentation](https://reactnative.dev/docs/native-modules-ios#exporting-swift).

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