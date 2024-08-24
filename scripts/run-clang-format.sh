#!/bin/bash

# Define the directory name for iOS
IOS_DIR="ios"

# Define paths
SOURCE_DIRS=(
    "$(pwd)/integration-tests/basic-test-app/${IOS_DIR}/basictestapp"
    "$(pwd)/examples/react-native-test-suite"
    "$(pwd)/packages"
    "$(pwd)/packages/core/test-project"
)

# Initialize find command
FIND_CMD="find"

# Add each directory to the find command
for dir in "${SOURCE_DIRS[@]}"; do
    FIND_CMD+=" $dir"
done

# Append the find options to exclude node_modules and build directories
FIND_CMD+=" -type d \( -name 'node_modules' -o -name 'build' \) -prune -o -type f \( -name '*.m' -o -name '*.mm' -o -name '*.h' \) -print"

# Execute the find command and run clang-format on each file
eval "$FIND_CMD" | xargs -r clang-format -i
