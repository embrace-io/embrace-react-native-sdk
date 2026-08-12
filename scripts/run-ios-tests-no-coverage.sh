#!/bin/bash
# Run iOS tests WITHOUT code coverage (used for memory-intensive packages like OTLP)
WORKSPACE=$1
SCHEME=$2

# CocoaPods merges the Embrace modules into one EmbraceIO while SPM keeps them separate, so a
# shared products dir lets one mode's leftover swiftmodule shadow the other's framework.
case "$(echo "$EMBRACE_USE_SPM" | tr '[:upper:]' '[:lower:]')" in
  1 | true | yes) MODE="spm" ;;
  *) MODE="pods" ;;
esac
# Workspace-based name, matching the paths CI's cache and upload steps reference
DERIVED_DATA="$HOME/Library/Developer/Xcode/DerivedData/$(basename "$WORKSPACE" .xcworkspace)-$MODE"

# Drop earlier results so a cached bundle can't be mistaken for this run's
rm -rf "$DERIVED_DATA/Logs/Test"

# iPhone 17 Pro with iOS 26.5 - available on both local and CI environments
xcodebuild test -workspace "$WORKSPACE" -scheme "$SCHEME" -sdk iphonesimulator -derivedDataPath "$DERIVED_DATA" -destination 'platform=iOS Simulator,name=iPhone 17 Pro,OS=26.5' -disable-concurrent-testing -jobs 1 | xcbeautify
exit  "${PIPESTATUS[0]}"
