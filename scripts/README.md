# iOS Test Scripts

This directory contains scripts for running iOS unit tests.

## Scripts

### `run-ios-tests.sh`
Runs iOS tests **with code coverage enabled**.

**Used by:**
- Local development (recommended)
- Manual coverage collection

**Usage:**
```bash
./run-ios-tests.sh <workspace> <scheme>
```

### `run-ios-tests-no-coverage.sh`
Runs iOS tests **without code coverage**.

**Used by:**
- **All packages on CI** (`@embrace-io/react-native`, `@embrace-io/react-native-tracer-provider`, `@embrace-io/react-native-otlp`)

**Usage:**
```bash
./run-ios-tests-no-coverage.sh <workspace> <scheme>
```

## Why No Coverage on CI?

After upgrading to EmbraceIO 6.14.1+, we're required to use `USE_FRAMEWORKS=dynamic` for CocoaPods. This significantly increases memory usage and build times because:

1. **Every dependency becomes a separate framework** (instead of static libraries)
2. **Each framework must be individually:**
   - Compiled
   - Linked
   - Code signed
   - Loaded into memory (wired pages)

3. **Code coverage adds additional overhead:**
   - Instruments all code
   - Creates coverage data files
   - Increases memory pressure during build

### The Problem

On GitHub Actions `macos-latest` runners (~7GB RAM):
- **With coverage**: Build times of 50+ minutes, frequent OOM/hangs
- **Without coverage**: Build times of ~15-20 minutes, reliable completion

### The Solution

**CI (all packages):** Run tests without coverage to ensure fast, reliable test execution
**Local development:** Run tests with coverage using `run-ios-tests.sh` where hardware is better

### Running Tests with Coverage Locally

To collect coverage data on your local machine:

1. Temporarily modify any `package.json`:
   ```json
   "ios:test": "yarn run ios:shared && ../../scripts/run-ios-tests.sh ..."
   ```

2. Or run directly:
   ```bash
   cd packages/core  # or tracer-provider, otlp
   yarn run ios:shared
   ../../scripts/run-ios-tests.sh test-project/ios/YourWorkspace.xcworkspace YourScheme
   ```

Local machines typically have more RAM and better I/O, so coverage works fine.
