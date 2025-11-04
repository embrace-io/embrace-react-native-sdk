#!/bin/bash
# Run iOS tests WITHOUT code coverage (used for memory-intensive packages like OTLP)
WORKSPACE=$1
SCHEME=$2
# Use "Any iOS Simulator Device" to avoid issues with specific iOS versions not being available on all CI runners
xcodebuild test -workspace "$WORKSPACE" -scheme "$SCHEME" -sdk iphonesimulator -destination 'platform=iOS Simulator,id=dvtdevice-DVTiOSDeviceSimulatorPlaceholder-iphonesimulator:placeholder' -disable-concurrent-testing -jobs 1 | xcbeautify
exit  "${PIPESTATUS[0]}"
