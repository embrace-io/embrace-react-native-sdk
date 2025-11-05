#!/bin/bash
# Run iOS tests WITHOUT code coverage (used for memory-intensive packages like OTLP)
WORKSPACE=$1
SCHEME=$2
# Use iPhone 16 Pro with iOS 18.5 - available on both local and CI environments
# GitHub Actions macos-latest runners (as of Nov 2024) have iPhone 16 series simulators
# TEMPORARILY REMOVED xcbeautify to capture full diagnostic output including NSLog statements
xcodebuild test -workspace "$WORKSPACE" -scheme "$SCHEME" -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 16 Pro,OS=18.5' -disable-concurrent-testing -jobs 1
exit  "${PIPESTATUS[0]}"
