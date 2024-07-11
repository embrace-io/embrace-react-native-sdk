# build required packages
pushd ..
npx lerna run build --scope=@embrace-io/react-native
npx lerna run build --scope=@embrace-io/react-native-tracer-provider
popd

# pack required packages into tarballs
yarn --cwd ../packages/core pack --out ../../integration-tests/artifacts/embrace-io-react-native-local.tgz
yarn --cwd ../packages/react-native-tracer-provider pack --out ../../integration-tests/artifacts/embrace-io-react-native-tracer-provider-local.tgz

# add tarballs as local packages to the basic-test-app
# use npm since that's what the basic-test-app is configured with
npm --prefix basic-test-app add ./artifacts/embrace-io-react-native-local.tgz ./artifacts/embrace-io-react-native-tracer-provider-local.tgz
