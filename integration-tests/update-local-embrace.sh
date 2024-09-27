#!/bin/bash

# build required packages
pushd ..
npx lerna run build --scope=@embrace-io/react-native
npx lerna run build --scope=@embrace-io/react-native-otlp
popd

# pack required packages into tarballs
./pack.sh ../packages/core/ artifacts/embrace-io-react-native-local.tgz
./pack.sh ../packages/react-native-otlp/ artifacts/embrace-io-react-native-otlp-local.tgz

# install
npm --prefix basic-test-app add ./artifacts/embrace-io-react-native-local.tgz
npm --prefix basic-test-app add ./artifacts/embrace-io-react-native-otlp-local.tgz
