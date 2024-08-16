# build required packages
pushd ..
npx lerna run build --scope=@embrace-io/react-native
popd

# pack required packages into tarballs
yarn --cwd ../packages/core pack --out ../../integration-tests/artifacts/embrace-io-react-native-local.tgz
npm --prefix basic-test-app add ./artifacts/embrace-io-react-native-local.tgz # since the basic-test-app uses npm and not yarn
