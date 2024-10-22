#!/bin/bash
FORMATTER="swiftlint"

# install if the formatter is not found
if ! command -v ${FORMATTER} &> /dev/null; then
    echo "${FORMATTER} not found. Proceeding to install."  

    brew install swiftlint

    export PATH="/opt/homebrew/opt/swiftlint/bin:$PATH"
fi

if [ "$1" == "--fix" ]; then
  swiftlint --fix
else
  swiftlint
fi
