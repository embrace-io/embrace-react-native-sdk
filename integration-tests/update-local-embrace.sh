# build required packages
pushd ..
npx lerna run build --scope=@embrace-io/react-native
npx lerna run build --scope=@embrace-io/react-native-otlp
popd

# pack required packages into tarballs
yarn --cwd ../packages/core pack --out ../../integration-tests/artifacts/embrace-io-react-native-local.tgz
yarn --cwd ../packages/react-native-otlp pack --out ../../integration-tests/artifacts/embrace-io-react-native-otlp-local.tgz

# install
npm --prefix basic-test-app add ./artifacts/embrace-io-react-native-local.tgz ./artifacts/embrace-io-react-native-otlp-local.tgz
