#!/bin/bash

# Default variable values
update_sdk_packages=false
update_test_harness=false
embrace_config=false
rn_version=false

# https://medium.com/@wujido20/handling-flags-in-bash-scripts-4b06b4d0ed04
usage() {
 echo "Usage: $0 <test-app> [OPTIONS]"
 echo "Options:"
 echo " -h, --help               Display this help message"
 echo " --update-sdk-packages    Update the sdk packages"
 echo " --update-test-harness    Update the test harness package"
 echo " --embrace-config         Specify the Embrace config to use"
 echo " --rn-version             Specify the React Native version to use"
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
      --update-sdk-packages)
        update_sdk_packages=true
        ;;
      --update-test-harness)
        update_test_harness=true
        ;;
      --embrace-config*)
        if ! has_argument $@; then
          echo "Embrace config not specified." >&2
          usage
          exit 1
        fi

        embrace_config=$(extract_argument $@)

        shift
        ;;
      --rn-version*)
        if ! has_argument $@; then
          echo "React Native version not specified." >&2
          usage
          exit 1
        fi

        rn_version=$(extract_argument $@)

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

if [ "$update_sdk_packages" = true ]; then
  # build required packages
  pushd ..
  npx lerna run build --scope=@embrace-io/react-native
  popd

  # pack required packages into tarballs
  ./pack.sh ../packages/core/ artifacts/embrace-io-react-native-local.tgz
fi

if [ "$update_update_test_harness" = true ]; then
  # build and pack the test harness
  npm --prefix test-harness run build
  ./pack.sh  test-harness/ artifacts/embrace-io-react-native-test-harness-local.tgz
fi

if [ "$update_sdk_packages" = true ] || [  "$update_update_test_harness" = true ]; then
  # update the test app with the sdk packages and the test harness
  npm --prefix $test_app add ./artifacts/embrace-io-react-native-local.tgz ./artifacts/embrace-io-react-native-test-harness-local.tgz
fi

if [ "$embrace_config" = true ]; then
  # TODO
fi

if [ "$rn_version" = true ]; then
  # TODO
fi
