#!/bin/bash

# build required packages
pushd ..
npx lerna run build --scope=@embrace-io/react-native
npx lerna run build --scope=@embrace-io/react-native-tracer-provider
popd

# pack required packages into tarballs
./pack.sh ../packages/core/ artifacts/embrace-io-react-native-local.tgz
./pack.sh ../packages/react-native-tracer-provider/ artifacts/embrace-io-react-native-tracer-provider-local.tgz

# add tarballs as local packages to the basic-test-app
# use npm since that's what the basic-test-app is configured with
npm --prefix basic-test-app add ./artifacts/embrace-io-react-native-local.tgz ./artifacts/embrace-io-react-native-tracer-provider-local.tgz