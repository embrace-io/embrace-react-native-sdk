#!/bin/bash

# See DEVELOPING.md

rm -rf android/src/main/java
cp -r native-src/android/app/src/main/java android/src/main/java
cp native-src/android/app/dependencies.gradle android/dependencies.gradle
