# build required packages
pushd ..
npx lerna run build --scope=@embrace-io/react-native
popd

# pack required packages into tarballs
yarn --cwd ../packages/core pack --out ../../integration-tests/artifacts/embrace-io-react-native-local.tgz

# install
npm --prefix basic-test-app add ./artifacts/embrace-io-react-native-local.tgz
