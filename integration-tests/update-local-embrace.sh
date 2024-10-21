#!/bin/bash

# Default variable values
test_harness_only=false

# https://medium.com/@wujido20/handling-flags-in-bash-scripts-4b06b4d0ed04
usage() {
 echo "Usage: $0 [OPTIONS]"
 echo "Options:"
 echo " -h, --help               Display this help message"
 echo " -t, --test-harness-only  Only update the test harness package"
}

handle_options() {
  while [ $# -gt 0 ]; do
    case $1 in
      -h | --help)
        usage
        exit 0
        ;;
      -t | --test-harness-only)
        test_harness_only=true
        ;;
    esac
    shift
  done
}

handle_options "$@"

if [ "$test_harness_only" = false ]; then
  # build required packages
  pushd ..
  npx lerna run build --scope=@embrace-io/react-native
  npx lerna run build --scope=@embrace-io/react-native-tracer-provider
  popd

  # pack required packages into tarballs
  ./pack.sh ../packages/core/ artifacts/embrace-io-react-native-local.tgz
  ./pack.sh ../packages/react-native-tracer-provider/ artifacts/embrace-io-react-native-tracer-provider-local.tgz
fi

# build and pack the test harness
npm --prefix test-harness run build
./pack.sh  test-harness/ artifacts/embrace-io-react-native-test-harness-local.tgz

# update all test apps with the sdk packages and the test harness
# TODO EMBR-4923 put test apps within a common folder and use lerna to run this command across all of them
npm --prefix basic-test-app add \
  ./artifacts/embrace-io-react-native-local.tgz \
  ./artifacts/embrace-io-react-native-tracer-provider-local.tgz \
  ./artifacts/opentelemetry-instrumentation-react-native-navigation-0.1.0.tgz \
  ./artifacts/embrace-io-react-native-test-harness-local.tgz