npx lerna run tsc --scope=@embrace-io/react-native
yarn --cwd ../packages/core pack -f ./artifacts/embrace-io-react-native-local.tgz
npm --prefix basic-test-app add ./artifacts/embrace-io-react-native-local.tgz  # since the basic-test-app uses npm and not yarn

npx lerna run tsc --scope=@embrace.io/react-native-tracer-provider
yarn --cwd ../packages/react-native-tracer-provider pack -f ./artifacts/embrace-io-react-native-tracer-provider-local.tgz
npm --prefix basic-test-app add ./artifacts/embrace-io-react-native-tracer-provider-local.tgz
