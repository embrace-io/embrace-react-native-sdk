# iOS Test Scripts

This directory contains scripts for running iOS unit tests.

## Scripts

### `run-ios-tests.sh`
Runs iOS tests **with code coverage enabled**.

**Used by:**
- `@embrace-io/react-native` (core package)
- `@embrace-io/react-native-tracer-provider`

**Usage:**
```bash
./run-ios-tests.sh <workspace> <scheme>
```

### `run-ios-tests-no-coverage.sh`
Runs iOS tests **without code coverage**.

**Used by:**
- `@embrace-io/react-native-otlp`

**Why no coverage for OTLP?**

The OTLP package has significantly heavier dependencies than other packages:
- OpenTelemetry Protocol exporters
- Protobuf libraries
- Additional OTLP-specific dependencies

When combined with:
- `USE_FRAMEWORKS=dynamic` (required for EmbraceIO 6.14.1+)
- Code coverage instrumentation
- GitHub Actions `macos-latest` runners (~7GB RAM)

...the build process consumes excessive memory, leading to swapping and eventual OOM failures.

Running OTLP tests without coverage reduces memory footprint enough to complete successfully on free CI runners, while still verifying functionality.

**Coverage on other packages:**
Core and tracer-provider packages still run with full code coverage enabled.

**Running OTLP with coverage locally:**
If you need coverage data for OTLP (e.g., for local development), you can temporarily modify `packages/react-native-otlp/package.json` to use `run-ios-tests.sh` instead. This works fine on local machines with more RAM.
