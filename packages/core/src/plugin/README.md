# Embrace Expo Config Plugin

Allows our SDK to be automatically setup using Expo's Prebuild system, see Expo's documentation for more information on
how [Config plugins](https://docs.expo.dev/config-plugins/introduction/) work.

To apply this in your project include the following in your `app.json`:

```json
{
  "expo": {
    ...
    "plugins": [
      [
        "@embrace-io/react-native/lib/app.plugin.js",
        {
          "androidAppId": "android123",
          "apiToken": "apiToken456",
          "iOSAppId": "ios789"
        }
      ],
      ...
    ],
    ...
  }
}
```

Refer to [EmbraceProps](./types.ts) for a description of the properties available to configure
the plugin.

## Sourcing the Embrace iOS SDK from SPM

By default the Embrace iOS SDK is installed as a CocoaPods dependency. To source it from Swift Package Manager instead,
set `iOSUseSPM` and add [expo-build-properties](https://docs.expo.dev/versions/latest/sdk/build-properties/) with
`ios.useFrameworks: "dynamic"`:

```json
{
  "expo": {
    ...
    "plugins": [
      ["expo-build-properties", {"ios": {"useFrameworks": "dynamic"}}],
      [
        "@embrace-io/react-native/lib/app.plugin.js",
        {
          "androidAppId": "android123",
          "apiToken": "apiToken456",
          "iOSAppId": "ios789",
          "iOSUseSPM": true
        }
      ],
      ...
    ],
    ...
  }
}
```

SPM mode uses React Native's `spm_dependency` helper, which requires React Native >= 0.75 and `USE_FRAMEWORKS=dynamic`.

For more details and troubleshooting see [Adding the React Native Embrace SDK](https://embrace.io/docs/react-native/integration/add-embrace-sdk/)
in our docs.