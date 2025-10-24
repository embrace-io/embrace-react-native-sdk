#!/bin/bash

#
# Wrapper script to help with updating native Embrace SDK versions.
# It is primarily used by .github/workflows/update-native-sdks.yaml and not humans.
#

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 <get|set> <android|apple> [version]"
  exit 1
fi

action=$1   # get or set
platform=$2 # example: android or apple
version=$3  # only for "set"

if [[ $action == "get" ]]; then
  if [[ $platform == "android" ]]; then
    grep "androidVersion:" yarn.config.cjs | cut -f 2 -d\"
    exit 0
  fi

  if [[ $platform == "apple" ]]; then
    grep "iosVersion:" yarn.config.cjs | cut -f 2 -d\"
    exit 0
  fi
fi

if [[ $action == "set" ]]; then
  if [[ $(uname) == "Darwin" ]]; then
    SED=gsed
  else
    SED=sed
  fi

  # Example: https://github.com/embrace-io/embrace-react-native-sdk/pull/535
  if [[ $platform == "android" ]]; then
    $SED -i "s/androidVersion: \"[^\"]*\"/androidVersion: \"${version}\"/" yarn.config.cjs
    $SED -i "s/^emb_android_sdk=.*/emb_android_sdk=${version}/" packages/core/android/gradle.properties
  fi

  # Example: https://github.com/embrace-io/embrace-react-native-sdk/pull/474
  if [[ $platform == "apple" ]]; then
    $SED -i "s/iosVersion: \"[^\"]*\"/iosVersion: \"${version}\"/" yarn.config.cjs
  fi

  # Update packages/*/package.json
  corepack enable
  yarn constraints --fix
  yarn build

  # Update packages/*/*/*/Podfile.lock
  if [[ $platform == "apple" ]]; then
    brew install cocoapods
    yarn ios:install
  fi
fi
