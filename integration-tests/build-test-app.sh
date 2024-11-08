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
# TODO
#if [ "$is_expo" = true ]; then
#  artifact=$(ls $template_path/*.tgz)
#  echo "Running: npx create-expo $name -y --no-install --template ./$artifact"
#  npx create-expo $name -y --no-install --template ./$artifact
#else
#  echo "Running: npx @react-native-community/cli init $name --package-name io.embrace.$name --skip-git-init --skip-install --pm yarn --template $(pwd)/$template_path"
#  npx @react-native-community/cli init $name --package-name io.embrace.$name --skip-git-init --skip-install --pm yarn \
#    --template $(pwd)/$template_path

  # Hack that works around current issues with the @react-native-community/cli. Even though we are passing --skip-install
  # a package manager is still used to setup the template. If we choose 'npm' the CLI fails with "EISDIR: illegal operation on a directory",
  # if we choose 'yarn' we get past the error but the packageManager version we set in ../package.json is modified so reverting that here
#  git restore ../package.json
#fi

#echo "Build and install local Embrace packages in $name"
#./update-embrace-packages.sh $name

#echo "Updating the Embrace config for $name"
#./set-embrace-config.js $name embrace-configs/remote-mock-api.json --namespace=$namespace

if [ "$platform" == "android" ]; then
  echo "Building $name.apk"
  pushd $name/android/
  ./gradlew app:assembleRelease
  popd

  mv $name/android/app/build/outputs/apk/release/app-release.apk $name.apk
else
  ios_name="${name/-/}"

  echo "Installing pods for $name"
  pushd $name/ios
  pod install
  popd

  ## TODO
  pushd $name
  npm install
  popd

  echo "Building $name.xcarchive"
  xcodebuild archive -workspace $name/ios/$ios_name.xcworkspace \
  -scheme $ios_name -configuration Release \
  -sdk iphoneos -archivePath $name.xcarchive \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO

  echo "Building $name.ipa"
  xcodebuild -exportArchive -archivePath $name.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath $name-ios-export
fi
