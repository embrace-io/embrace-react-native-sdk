#!/bin/bash
# Run iOS tests WITHOUT code coverage (used for memory-intensive packages like OTLP)
WORKSPACE=$1
SCHEME=$2
# iPhone 17 Pro with iOS 26.5 - available on both local and CI environments
xcodebuild test -workspace "$WORKSPACE" -scheme "$SCHEME" -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 17 Pro,OS=26.5' -disable-concurrent-testing -jobs 1 | xcbeautify
exit  "${PIPESTATUS[0]}"
