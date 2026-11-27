#!/bin/bash
# Run iOS tests WITHOUT code coverage (used for memory-intensive packages like OTLP)
WORKSPACE=$1
SCHEME=$2

# CocoaPods merges the Embrace modules into one EmbraceIO while SPM keeps them separate, so a
# shared products dir lets one mode's leftover swiftmodule shadow the other's framework.
MODE="pods"
if [ "${EMBRACE_USE_SPM:-}" = "1" ]; then
  MODE="spm"
fi
# Workspace-based name, matching the paths CI's cache and upload steps reference
DERIVED_DATA="$HOME/Library/Developer/Xcode/DerivedData/$(basename "$WORKSPACE" .xcworkspace)-$MODE"

# Drop earlier results so a cached bundle can't be mistaken for this run's
rm -rf "$DERIVED_DATA/Logs/Test"

# iPhone 17 Pro with iOS 26.5 - available on both local and CI environments
for _ in $(seq 1 12); do
  UDID=$(xcrun simctl list devices available --json | jq -r '.devices["com.apple.CoreSimulator.SimRuntime.iOS-26-5"][]? | select(.name == "iPhone 17 Pro") | .udid' | head -1)
  [ -n "$UDID" ] && break
  sleep 5
done
[ -n "$UDID" ] || { echo "No iPhone 17 Pro simulator on iOS 26.5 is available"; exit 1; }

xcodebuild test -workspace "$WORKSPACE" -scheme "$SCHEME" -sdk iphonesimulator -derivedDataPath "$DERIVED_DATA" -destination "platform=iOS Simulator,id=$UDID" -disable-concurrent-testing -jobs 1 | xcbeautify
exit  "${PIPESTATUS[0]}"
