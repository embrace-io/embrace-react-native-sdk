#!/bin/bash
WORKSPACE=$1
SCHEME=$2
# iPhone 17 Pro with iOS 26.5 - available on both local and CI environments
xcodebuild test -workspace "$WORKSPACE" -scheme "$SCHEME" -sdk iphonesimulator -enableCodeCoverage YES -destination 'platform=iOS Simulator,name=iPhone 17 Pro,OS=26.5' -disable-concurrent-testing -jobs 1 | xcbeautify
exit  "${PIPESTATUS[0]}"
