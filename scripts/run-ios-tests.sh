#!/bin/bash
WORKSPACE=$1
SCHEME=$2
xcodebuild test -workspace "$WORKSPACE" -scheme "$SCHEME" -sdk "$IOS_TEST_SDK" -enableCodeCoverage YES -destination "platform=$IOS_TEST_PLATFORM,name=$IOS_TEST_DEVICE,OS=$IOS_TEST_OS" -parallel-testing-enabled NO -maximum-parallel-testing-workers 1 -jobs 1 -parallelizeTargets NO | xcbeautify
exit  "${PIPESTATUS[0]}"
