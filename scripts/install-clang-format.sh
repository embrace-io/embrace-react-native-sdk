#!/bin/bash

# Check if clang-format is installed, if not install it
if ! command -v clang-format &> /dev/null; then
    echo "clang-format not found. Installing..."
    
    # Install llvm (includes clang-tidy and clang-format)
    brew install llvm

    # Add clang tools to PATH
    export PATH="/opt/homebrew/opt/llvm/bin:$PATH"
else
    echo "clang-format is already installed."
fi
