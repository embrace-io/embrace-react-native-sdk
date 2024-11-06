#!/bin/bash

# See DEVELOPING.md

# Android
rm -r android/src/main/java
cp -r native-src/android/app/src/main/java android/src/main/java
cp native-src/android/app/dependencies.gradle android/dependencies.gradle

# iOS, not needed since the project in XCode can reference files from other locations