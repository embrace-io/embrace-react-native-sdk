pushd ../../packages/expo-config-plugin
yarn build
npm pack
popd
npm install ../../packages/expo-config-plugin/embrace-io-expo-config-plugin-5.1.0.tgz
npx expo prebuild
