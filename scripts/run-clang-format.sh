#!/bin/bash
FORMATTER="clang-format"

# install if the formatter is not found
if ! command -v ${FORMATTER} &> /dev/null; then
    echo "${FORMATTER} not found. Proceeding to install."  

    brew install llvm

    export PATH="/opt/homebrew/opt/llvm/bin:$PATH"
fi

# 1) Paths to formart
SOURCE_DIRS=(
    "$(pwd)/integration-tests/basic-test-app/ios/basictestapp"
    "$(pwd)/examples/react-native-test-suite"
    "$(pwd)/packages"
    "$(pwd)/packages/core/test-project"
)

# find command
FIND_CMD="find"
for dir in "${SOURCE_DIRS[@]}"; do
    FIND_CMD+=" $dir"
done

# 2) Exclude directories. Add more directories if needed
EXCLUDE_DIRS=(
    "$(pwd)/node_modules"
    "$(pwd)/build"
    "$(pwd)/packages/core/scripts/__tests__"
)

EXCLUDE_CMD=""
EXCLUDE_COUNTER=1
EXCLUDE_DIRS_LEN=${#EXCLUDE_DIRS[@]}
for exc_dir in "${EXCLUDE_DIRS[@]}"; do
    if [ $EXCLUDE_COUNTER -eq $EXCLUDE_DIRS_LEN ]; then
        # do not add '-o' at the end
        EXCLUDE_CMD+=" -path $exc_dir -prune"
    else
        EXCLUDE_CMD+=" -path $exc_dir -prune -o"
    fi
    ((EXCLUDE_COUNTER++))
done

# 3) Include file extensions. Add more file extensions if needed
FILE_EXTS=(
    "*.java"
    "*.h"
)

FILE_CMD=""
FILE_EXTS_COUNTER=1
FILE_EXT_LEN=${#FILE_EXTS[@]}
for file_ext in "${FILE_EXTS[@]}"; do
    if [ $FILE_EXTS_COUNTER -eq $FILE_EXT_LEN ]; then
        # do not add '-o' at the end
        FILE_CMD+=" -name '$file_ext'"
    else
        FILE_CMD+=" -name '$file_ext' -o"
    fi
    ((FILE_EXTS_COUNTER++))
done

# 4) final eval
FIND_CMD+=" -type d \( ${EXCLUDE_CMD} \) -prune -o -type f \( ${FILE_CMD} \) -print"

if [ "$1" == "--fix" ]; then
  eval "$FIND_CMD" | xargs -r clang-format -i
else
  eval "$FIND_CMD" | xargs -r clang-format -i --dry-run
fi
