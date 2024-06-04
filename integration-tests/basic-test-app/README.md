A basic test app integrated with the Embrace RN SDK to be used within integration tests. If other apps are required,
e.g. for testing particular versions of RN, then follow the setup steps here and update `integration-tests/wdio.conf.ts`
with the appropriate capabilities.

## Steps to create a new test app

   ```bash
   npx create-expo-app@latest
   npx expo install expo-dev-client
   ```

### Android

Follow the [Embrace docs](https://embrace.io/docs/react-native/integration/add-embrace-sdk/)

Use the following when creating `./android/app/src/main/embrace-config.json`:

    ```json
    {
      "app_id": "abcdf",
      "api_token": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "sdk_config": {
        "base_urls": {
          "config": "http://10.0.2.2:8877",
          "data": "http://10.0.2.2:8877",
          "data_dev": "http://10.0.2.2:8877",
          "images": "http://10.0.2.2:8877"
        }
      }
    }
    ```

NOTE that 10.0.2.2 is required to hit localhost on an Android emulator [see here](https://developer.android.com/studio/run/emulator-networking.html)

Then build:

   ```bash
    npx expo run:android
   ```

### iOS

Follow the [Embrace docs](https://embrace.io/docs/react-native/integration/add-embrace-sdk/)

Use the following when creating `./ios/Embrace-Info.plist`:

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
      <dict>
        <key>API_KEY</key>
        <string>abcdf</string>
        <key>CRASH_REPORT_ENABLED</key>
        <true/>
        <key>CONFIG_BASE_URL</key>
        <string>http://localhost:8877</string>
        <key>DATA_BASE_URL</key>
        <string>http://localhost:8877</string>
        <key>DATA_DEV_BASE_URL</key>
        <string>http://localhost:8877</string>
        <key>IMAGES_BASE_URL</key>
        <string>http://localhost:8877</string>
        <key>TEST_BASE_URL</key>
        <string>http://localhost:8877</string>
      </dict>
    </plist>
    ```

Then build:

   ```bash
    npx expo run:ios
   ```

## Pull in local @embrace-io/react-native changes

Because RN doesn't support symlinked packages whenever any changes are made under
packages/core (or any other local package that the test app depends on) they need to be copied into
the app's node_modules/, there is a script in integration-tests that manages this