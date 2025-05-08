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
        "@embrace-io/react-native",
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

For more details and troubleshooting see [Adding the React Native Embrace SDK](https://embrace.io/docs/react-native/integration/add-embrace-sdk/)
in our docs.