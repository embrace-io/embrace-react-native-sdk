This app was created using the rn74-wix-navigation-template which provides a basic React Native app integrated with the Embrace RN SDK and a Native navigation using `wix/react-native-navigation` to be used within integration tests. See [this guide](../integration-tests/README.md) for instructions on how to setup
and run this app.

## Create a new App from templates/rn74-wix-navigation-template

These steps applies ONLY for testing [react-native-navigation](https://github.com/wix/react-native-navigation) and `iOS`. [expo-router](https://github.com/expo/expo/tree/main/packages/expo-router) and [@react-navigation/native](https://github.com/react-navigation/react-navigation) can be tested as usual using the other existent templates.
NOTE: Android was not tested yet.

1. create the app using [the integration tests guide](../integration-tests/README.md) as usual

```sh
npx @react-native-community/cli init WixNavApp --package-name wixNavApp --skip-git-init --skip-install --pm yarn --template $(pwd)/templates/rn74-wix-navigation-template
```

2. update `test-harness` package + Embrace config files

3. at the root of the created app (install dependencies not related to Embrace + all iOS Pods)

```sh
npm i
cd ios && pod install
cd ..
```

4. open `node_modules/react-native-navigation/autolink/postlink/run.js` and `node_modules/react-native-navigation/autolink/postlink/path.js`
5. from `node_modules/react-native-navigation/autolink/postlink/run.js` comment out all related to android (it's not prepared for kotlin, it's trying to get java files and it doesn't work at least at the moment of writing thi README.md)
6. from `node_modules/react-native-navigation/autolink/postlink/path.js` comment out line 

```javascript
exports.rootGradle = mainApplicationJava.replace(/android\/app\/.*\.java/, 'android/build.gradle');
```

7. after all run 

```sh
node node_modules/react-native-navigation/autolink/postlink/run.js
```

8. build the app as usual

```sh
npm run start // starting metro server
```

and run the iOS workspace as usual