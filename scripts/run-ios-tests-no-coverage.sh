#!/bin/bash
# Run iOS tests WITHOUT code coverage (used for memory-intensive packages like OTLP)
WORKSPACE=$1
SCHEME=$2
xcodebuild test -workspace "$WORKSPACE" -scheme "$SCHEME" -sdk "$IOS_TEST_SDK" -destination "platform=$IOS_TEST_PLATFORM,name=$IOS_TEST_DEVICE,OS=$IOS_TEST_OS" -disable-concurrent-testing -jobs 1 | xcbeautify
exit  "${PIPESTATUS[0]}"
