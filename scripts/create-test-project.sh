# android
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