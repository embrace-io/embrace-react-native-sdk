#!/bin/bash
# Patch expo-file-system to fix Kotlin compilation error
# Issue: Variable 'contents' must be initialized

FILE="node_modules/expo-file-system/android/src/main/java/expo/modules/filesystem/FileSystemModule.kt"

if [ -f "$FILE" ]; then
  # Check if already patched
  if grep -q "var contents: String? = null" "$FILE"; then
    echo "expo-file-system already patched"
  else
    echo "Patching expo-file-system..."
    sed -i.bak 's/var contents: String?/var contents: String? = null/' "$FILE"
    rm -f "${FILE}.bak"
    echo "expo-file-system patched successfully"
  fi
else
  echo "Warning: expo-file-system not found, skipping patch"
fi
