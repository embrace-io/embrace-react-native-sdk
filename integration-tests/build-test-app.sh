#!/bin/bash
set -Eeuo pipefail

usage() {
 echo "Usage: $0 <name> <platform> <namespace>"
}

name=$1
if [ -z "$name" ]; then
  echo "name is required."
  usage
  exit 1
fi

platform=$2
if [[ "$platform" != "ios" && "$platform" != "android" ]]; then
  echo "invalid platform."
  usage
  exit 1
fi

namespace=$3
if [ -z "$namespace" ]; then
  echo "namespace is required."
  usage
  exit 1
fi

is_expo=false
if [[ $name == *"expo"* ]]; then
  is_expo=true
fi

template_path="templates/$name-template"
echo "Creating a test app from $template_path"
#if [ "$is_expo" = true ]; then
#  artifact=$(ls $template_path/*.tgz)
#  echo "Running: npx create-expo -y --no-install --template ./$artifact $name"
#  npx create-expo -y --no-install --template ./$artifact $name
#  # For react native templates this step is handled by the template post-init script
#  ./update-local-embrace.sh $name
#else
#  echo "Running: npx @react-native-community/cli init $name --package-name io.embrace.$name --skip-git-init --skip-install --pm yarn --template $(pwd)/$template_path"
#  npx @react-native-community/cli init $name --package-name io.embrace.$name --skip-git-init --skip-install --pm yarn \
#    --template $(pwd)/$template_path
#fi

#echo "Updating the Embrace config for $name"
#./set-embrace-config.js $name embrace-configs/remote-mock-api.json --namespace=$namespace

if [ "$platform" == "android" ]; then
  echo "Building $name.apk"
  pushd $name/android/
  ./gradlew app:assembleRelease
  popd

  mv $name/android/app/build/outputs/apk/release/app-release.apk $name.apk
else
  echo "Install pods for $name"
  pushd $name/ios
  pod install
  popd

  echo "Building the .ipa for $name"
  if [ "$is_expo" = true ]; then
    echo "build expo ios"
  else
    echo "build react native ios"
  fi
fi
