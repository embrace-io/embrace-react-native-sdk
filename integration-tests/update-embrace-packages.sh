#!/bin/bash

# Default variable values
skip_sdk_packages=false
skip_test_harness=false
version="local"

# https://medium.com/@wujido20/handling-flags-in-bash-scripts-4b06b4d0ed04
usage() {
 echo "Usage: $0 <test-app> [OPTIONS]"
 echo "Options:"
 echo " -h, --help               Display this help message"
 echo " --skip-sdk-packages      Skip updating the sdk packages"
 echo " --skip-test-harness      Skip updating the test harness package"
 echo " --version                Version of Embrace packages to update to (defaults to local)"
}

has_argument() {
    [[ ("$1" == *=* && -n ${1#*=}) || ( ! -z "$2" && "$2" != -*)  ]];
}

extract_argument() {
  echo "${2:-${1#*=}}"
}

handle_options() {
  while [ $# -gt 0 ]; do
    case $1 in
      -h | --help)
        usage
        exit 0
        ;;
      --skip-sdk-packages)
        skip_sdk_packages=true
        ;;
      --skip-test-harness)
        skip_test_harness=true
        ;;
      --version*)
        if ! has_argument $@; then
          echo "Version not specified." >&2
          usage
          exit 1
        fi

        version=$(extract_argument $@)

        shift
        ;;
      *)
        echo "Invalid option: $1" >&2
        usage
        exit 1
        ;;
    esac
    shift
  done
}

if [ -z "$1" ]; then
  echo "test-app is required."
  usage
  exit 1
fi

test_app=$1
shift
handle_options "$@"

# NOTE: opentelemetry-instrumentation-react-native-navigation comes from outside this repo so we include it as
# a prebuilt artifact
third_party_dependencies="
  ./artifacts/opentelemetry-instrumentation-react-native-navigation-0.1.0.tgz
"

embrace_local_dependencies="
  ./artifacts/embrace-io-react-native-local.tgz
  ./artifacts/embrace-io-react-native-otlp-local.tgz
  ./artifacts/embrace-io-react-native-tracer-provider-local.tgz
  ./artifacts/embrace-io-react-native-spans-local.tgz
  $third_party_dependencies
"
if [ "$version" = "local" ]; then
  embrace_dependencies="$embrace_local_dependencies"
else
  embrace_dependencies="
    @embrace-io/react-native@$version
    @embrace-io/react-native-tracer-provider@$version
    @embrace-io/react-native-spans@$version
    $third_party_dependencies
  "
fi

if [ "$skip_sdk_packages" = false ]; then
  if [ "$version" = "local" ]; then
    echo "==========================================="
    echo "Building and packing Embrace local packages"
    echo "==========================================="

    # build required packages
    pushd ..
    npx lerna run build --scope=@embrace-io/react-native
    npx lerna run build --scope=@embrace-io/react-native-otlp
    npx lerna run build --scope=@embrace-io/react-native-tracer-provider
    npx lerna run build --scope=@embrace-io/react-native-spans
    popd

    # pack required packages into tarballs
    ./pack.sh ../packages/core/ artifacts/embrace-io-react-native-local.tgz
    ./pack.sh ../packages/react-native-otlp/ artifacts/embrace-io-react-native-otlp-local.tgz
    ./pack.sh ../packages/react-native-tracer-provider/ artifacts/embrace-io-react-native-tracer-provider-local.tgz
    ./pack.sh ../packages/spans/ artifacts/embrace-io-react-native-spans-local.tgz
  fi

  echo "========================================"
  echo "Updating app with Embrace local packages"
  echo "========================================"
  npm --prefix $test_app add --save-exact $embrace_dependencies
fi

if [ "$skip_test_harness" = false ]; then
  if [ "$skip_sdk_packages" = false ] && [ "$version" = "local" ]; then
    echo "============================================================"
    echo "Updating Test Harness dev dependencies with Embrace packages"
    echo "============================================================"
    npm --prefix test-harness add --save-dev $embrace_local_dependencies
  fi

  echo "================================="
  echo "Building and packing Test Harness"
  echo "================================="
  npm --prefix test-harness run build
  ./pack.sh  test-harness/ artifacts/embrace-io-react-native-test-harness-local.tgz

  echo "===================================="
  echo "Updating app with local Test Harness"
  echo "===================================="
  npm --prefix $test_app add ./artifacts/embrace-io-react-native-test-harness-local.tgz
fi
