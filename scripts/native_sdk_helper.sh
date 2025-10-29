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
    SED="sed -i''"
  else
    SED="sed -i"
  fi

  # Example: https://github.com/embrace-io/embrace-react-native-sdk/pull/535
  if [[ $platform == "android" ]]; then
    $SED "s/androidVersion: \"[^\"]*\"/androidVersion: \"${version}\"/" yarn.config.cjs
  fi

  # Example: https://github.com/embrace-io/embrace-react-native-sdk/pull/474
  if [[ $platform == "apple" ]]; then
    $SED "s/iosVersion: \"[^\"]*\"/iosVersion: \"${version}\"/" yarn.config.cjs
  fi

  echo "::group::git diff" && git diff; echo "::endgroup::"

  # Update packages/*/package.json
  echo "::group::corepack enable" && corepack enable; echo "::endgroup::"
  echo "::group::yarn install" && yarn install; echo "::endgroup::"
  echo "::group::yarn constraints --fix" && yarn constraints --fix; echo "::endgroup::"
  echo "::group::yarn build" && yarn build; echo "::endgroup::"

  # Update packages/*/*/*/Podfile.lock
  if [[ $platform == "apple" ]]; then
    echo "::group::brew install cocoapods" && brew install cocoapods; echo "::endgroup::"
    echo "::group::yarn ios:install" && yarn ios:install; echo "::endgroup::"
  fi
fi
