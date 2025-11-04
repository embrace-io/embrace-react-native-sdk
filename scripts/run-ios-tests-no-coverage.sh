#!/bin/bash
# Run iOS tests WITHOUT code coverage (used for memory-intensive packages like OTLP)
WORKSPACE=$1
SCHEME=$2
# Use iPhone 16 Pro without specifying OS version - xcodebuild picks any available iOS version for this device
# GitHub Actions macos-latest runners (as of Nov 2024) have iPhone 16 series simulators
xcodebuild test -workspace "$WORKSPACE" -scheme "$SCHEME" -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 16 Pro' -disable-concurrent-testing -jobs 1 | xcbeautify
exit  "${PIPESTATUS[0]}"
