#!/bin/bash
WORKSPACE=$1
SCHEME=$2
xcodebuild test -workspace "$WORKSPACE" -scheme "$SCHEME" -sdk "$IOS_TEST_SDK" -enableCodeCoverage NO -destination "platform=$IOS_TEST_PLATFORM,name=$IOS_TEST_DEVICE,OS=$IOS_TEST_OS" | xcbeautify
exit  "${PIPESTATUS[0]}"
