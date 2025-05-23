See [Expo's config plugin docs](https://docs.expo.dev/config-plugins/development-and-debugging/) for a general
overview of plugin development.

It's easiest to see the available helpers by looking at the [@expo/config-plugins package in github](https://github.com/expo/expo/tree/814867fd9d0adbd56580eb09be1e81134bb7466e/packages/%40expo/config-plugins/src/plugins).

Unit tests are defined in `../__tests__/plugin.test.ts`. To test the behaviour in an actual app:

```shell
cd ../../integration-tests
npx create-expo <app-path> --no-install  --template ./templates/expo-rn74-prebuild-template/expo-rn74-prebuild-template-1.0.0.tgz
./update-embrace-packages.sh <app-path>
./set-embrace-config.js <app-path>  ./embrace-configs/<config>.json --prebuild
cd <app-path>
./test-plugin.sh <path>/embrace-react-native-sdk
```
Use `../../integration-tests/expo-app-with-prebuild` to test
the behaviour of the plugin in an actual app.

NOTE: because we end up with `package.json` in `lib/` when building this package the [resolver](https://github.com/expo/expo/blob/814867fd9d0adbd56580eb09be1e81134bb7466e/packages/%40expo/config-plugins/src/utils/plugin-resolver.ts)
used by @expo/config-plugins gets confused and thinks that is the module root so we need to make sure `app.plugin.js`
exists in that folder rather than the actual package root.