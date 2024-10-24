#!/bin/bash

# Default variable values
skip_sdk_packages=false
skip_test_harness=false

# https://medium.com/@wujido20/handling-flags-in-bash-scripts-4b06b4d0ed04
usage() {
 echo "Usage: $0 <test-app> [OPTIONS]"
 echo "Options:"
 echo " -h, --help               Display this help message"
 echo " --skip-sdk-packages      Skip updating the sdk packages"
 echo " --skip-test-harness      Skip updating the test harness package"
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

if [ "$skip_sdk_packages" = false ]; then
  # build required packages
  pushd ..
  npx lerna run build --scope=@embrace-io/react-native
  npx lerna run build --scope=@embrace-io/react-native-tracer-provider

  npx lerna run build --scope=@embrace-io/react-native-otlp
  npx lerna run build --scope=@embrace-io/react-native-spans
  popd


  # pack required packages into tarballs
  ./pack.sh ../packages/core/ artifacts/embrace-io-react-native-local.tgz
  ./pack.sh ../packages/react-native-tracer-provider/ artifacts/embrace-io-react-native-tracer-provider-local.tgz
  ./pack.sh ../packages/react-native-otlp/ artifacts/embrace-io-react-native-otlp-local.tgz
  ./pack.sh ../packages/spans/ artifacts/embrace-io-react-native-spans-local.tgz

  # update the test app with the sdk packages
  # NOTE: opentelemetry-instrumentation-react-native-navigation comes from outside this repo so we include it as
  # a prebuilt artifact
  npm --prefix $test_app add \
    ./artifacts/embrace-io-react-native-local.tgz \
    ./artifacts/embrace-io-react-native-tracer-provider-local.tgz \
    ./artifacts/embrace-io-react-native-otlp-local.tgz  \
    ./artifacts/embrace-io-react-native-spans-local.tgz \
    ./artifacts/opentelemetry-instrumentation-react-native-navigation-0.1.0.tgz
fi

if [ "$skip_test_harness" = false ]; then
  # build, pack, and update the test app with the test harness
  npm --prefix test-harness run build
  ./pack.sh  test-harness/ artifacts/embrace-io-react-native-test-harness-local.tgz
  npm --prefix $test_app add ./artifacts/embrace-io-react-native-test-harness-local.tgz
fi
