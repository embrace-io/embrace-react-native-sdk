# build required packages
pushd ..
npx lerna run build --scope=@embrace-io/react-native
npx lerna run build --scope=@embrace-io/react-native-spans
popd

# pack required packages into tarballs
yarn --cwd ../packages/core pack --out ../../integration-tests/artifacts/embrace-io-react-native-local.tgz
yarn --cwd ../packages/spans pack --out ../../integration-tests/artifacts/embrace-io-react-native-spans-local.tgz

npm --prefix basic-test-app add ./artifacts/embrace-io-react-native-local.tgz
npm --prefix basic-test-app add ./artifacts/embrace-io-react-native-spans-local.tgz
