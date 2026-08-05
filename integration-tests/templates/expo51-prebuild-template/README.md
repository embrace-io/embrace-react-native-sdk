This app was created using the expo-test-app-template which provides a basic expo app integrated with the Embrace RN SDK
to be used within integration tests. See [this guide](../integration-tests/README.md) for instructions on how to setup
and run this app.

After making changes to the template run `npm pack` in this directory to regenerate the local package artifact.

This particular template is designed to help test our Expo config plugin, the `android` and `ios` folders have been
gitignored and are intended to be regenerated from scratch using `./test-plugin.sh <local-sdk-path>`.

The properties passed to the plugin can be modified in `app.json`.