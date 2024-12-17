pushd ../../packages/core
yarn build
npm pack
popd
npm install ../../packages/core/*.tgz
rm ../../packages/core/*.tgz
npx expo prebuild
