#!/bin/bash
WORKSPACE=$1
SCHEME=$2
xcodebuild test -workspace "$WORKSPACE" -scheme "$SCHEME" -sdk "$IOS_TEST_SDK" -enableCodeCoverage YES -destination "platform=$IOS_TEST_PLATFORM,name=$IOS_TEST_DEVICE,OS=$IOS_TEST_OS" -disable-concurrent-testing -jobs 1 | xcbeautify
exit  "${PIPESTATUS[0]}"
