# build required packages
pushd ..
npx lerna run build --scope=@embrace-io/react-native
popd

# pack required packages into tarballs
./pack.sh ../packages/core/ artifacts/embrace-io-react-native-local.tgz

# install
npm --prefix basic-test-app add ./artifacts/embrace-io-react-native-local.tgz
