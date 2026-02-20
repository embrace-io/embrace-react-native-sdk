#!/usr/bin/env swift

// This script exists to manually verify the string output of ComputeBundleIDErrors cases.
// It reproduces the enum from BundleID.swift with an additional case to exercise the
// `default` branch in `errorDescription`, which can't be hit in production today since
// the switch is exhaustive over the current cases.
//
// Run it directly with: swift packages/core/ios/test_error_output.swift
//
// It prints the `errorDescription` and `localizedDescription` for three scenarios:
// 1. .emptyPath — hardcoded message
// 2. .fileReadError — includes the path and underlying error
// 3. A hypothetical future case — hits the `default` branch, outputs via \(self)

import Foundation

enum ComputeBundleIDErrors: Error, LocalizedError {
    case emptyPath
    case fileReadError(path: String, underlying: Error)
    case someFutureCase(context: String)

    var errorDescription: String? {
        switch self {
        case .emptyPath:
            return "Bundle path is empty"
        case .fileReadError(let path, let underlying):
            return "Failed to read bundle at path '\(path)': \(underlying.localizedDescription)"
        default:
            return "An unexpected ComputeBundleIDErrors occurred: \(self)"
        }
    }
}

// Case 1: emptyPath
let empty = ComputeBundleIDErrors.emptyPath
print("=== .emptyPath ===")
print("errorDescription: \(empty.errorDescription ?? "nil")")
print("localizedDescription: \(empty.localizedDescription)")
print()

// Case 2: fileReadError with a real underlying error from a nonexistent path
let underlying: Error
do {
    _ = try Data(contentsOf: URL(fileURLWithPath: "/nonexistent/Application%20Support/bundle.js"))
    fatalError("Should have thrown")
} catch let e {
    underlying = e
}

let fileErr = ComputeBundleIDErrors.fileReadError(path: "/nonexistent/Application%20Support/bundle.js", underlying: underlying)
print("=== .fileReadError ===")
print("errorDescription: \(fileErr.errorDescription ?? "nil")")
print("localizedDescription: \(fileErr.localizedDescription)")
print()

// Case 3: someFutureCase — hits the default branch to verify \(self) outputs
// the case name and associated values
let future = ComputeBundleIDErrors.someFutureCase(context: "unexpected situation")
print("=== .someFutureCase (hits default) ===")
print("errorDescription: \(future.errorDescription ?? "nil")")
print("localizedDescription: \(future.localizedDescription)")
