## create package directory under /packages
# add package.json
# add README.md
# add tsconfig.json
# add .gitignore
# add .eslintrc.js
# create /android
# create /ios
# create /src
# create /test-project
# create RNEmbrace__NAME__.podspec file

## iOS
# create workspace -> File -> New -> Workspace (into test-project/ios/ dir) -> RNEmbrace__NAME__Tests.xcworkspace
# create project -> File -> New -> Project -> Framework (iOS)
#     Product Name -> RNEmbrace__NAME__ (no sufix Test here, should be the same name as the ios source package)
#     Language -> Swift
#     Team -> None
#     Organization Identifier -> io.embrace.rnembrace__NAME__
#     Testing System -> XCTest
# save it into /test-project/ios (this will create a dir called `RNEmbrace__NAME__`, a `RNEmbrace__NAME__.xcodeproj` and a dir `RNEmbrace__NAME__Tests`)
# remove /test-project/ios/RNEmbrace__NAME__/RNEmbrace__NAME__ dir, it's not needed (but keep the target)
# add a reference (without copying files) to the ios source package in RNEmbrace__NAME__ root folder (project)
#     Action -> Reference files in place
#     Groups -> Create Groups
#     Targets -> both (regular and test targets)
# make sure to click into the new referenced folder, open the File Inspector (top right corner of xcode) and update the location of the folder to be relative to the project (instead of absolute)
#     it should show a relative path like `../../../ios/RNEmbrace__NAME__`
# after all make sure to follow steps in https://github.com/CocoaPods/CocoaPods/issues/12583#issuecomment-2357470707
# move everything using XCode (because of references) from `packages/__PACKAGE_NAME__/test-project/ios/RNEmbrace__NAME__/` to `packages/__PACKAGE_NAME__/test-project/ios/` (we don't need to keep the RNEmbrace__NAME__ dir)
# at this point the structure will be ios/*.xcodeproj/ + ios/REmbraceTracerProviderTests/*
# into the xcodeproj dir run `pod init` to initialize the Podfile with the minimum targets configuration (this will create the ios/Podfile)
# add all required dependencies + React Native
# run `pod install` to install the dependencies + create the RNEmbrace__NAME__.xcworkspace
# make sure it is created the RNEmbrace__NAME__Tests.xctestplan into test-project/ios
#     by opening Edit Scheme (top center of xcode) -> look for Tests Plan -> Click on the arrow at the right of the name.
#     if it is the first time you click on it and the RNEmbrace__NAME__Tests.xctestplan file was not saved yet, it will ask for it. Save it, so the changes will persist. Otherwise the configurations will be lost.
# make sure swift classes add the `React` import at the top of the file
# make sure `BUILD_LIBRARY_FOR_DISTRIBUTION / Build Libraries for Distribution` is set to `No` for regular target (not the test one)
# make sure `ENABLE_USER_SCRIPT_SANDBOXING / User Script Sandboxing` is set to `NO` for regular target (not the test one)

## Android
# Create the project: File -> New -> New Project -> Empty Activity + kotlin (into test-project dir)
# settings.gradle.kts -> to settings.gradle only
# add React Native configuration
# make sure includeBuild("../node_modules/@react-native/gradle-plugin") is added into `pluginManagement`
# move `dependencyResolutionManagement` after `plugins`
# include local package to test (include ':react-native-tracer-provider')
# link the local package into test (project(':react-native-tracer-provider').projectDir = file('../../android'))
# update rootProject.name (rootProject.name = "RNEmbrace__NAME__Test")
# gradle.properties -> to add custom properties (particularly packageJsonPath)
# add android/config folder (detekt plugin for linting)
# remove app/src/androidTest
# remove app/src/main/java
# remove all app/src/main/res except for app/src/main/res/values/strings.xml and app/src/main/AndroidManifest.xml
# create app/src/main/AndroidManifestNew.xml
# rename app/src/test/java/io/embrace/xxxx/ExampleUnitTest.kt to RNEmbrace__NAME__Test.kt
# replace content of app/build.gradle.kts with proper configuration
# make sure app/build.gradle.kts includes the right local package (implemented in settings.gradle)
# make sure apply("../../../android/dependencies.gradle") is added into app/build.gradle.kts