RN_SDK_REPO=$1
pushd $RN_SDK_REPO/packages/core
yarn build
npm pack
popd
npm install $RN_SDK_REPO/packages/core/*.tgz
rm $RN_SDK_REPO/packages/core/*.tgz
npx expo prebuild
