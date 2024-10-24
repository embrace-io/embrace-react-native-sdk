#!/usr/bin/env node
{
  /*
  Takes a JSON defining a set of Embrace config options and applies them to a given test app, running:

    ./set-embrace-config.js basic-test-app embrace-configs/my-config.json

  Where `embrace-configs/my-config.json` contains:

    {
      "api_token": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "android_app_id": "abcdf",
      "ios_app_id": "abcdf",
      "disable_view_capture": true,
      "endpoint": "http://localhost:8989"
    }

  Would produce `basic-test-app/android/app/src/main/embrace-config.json`:

    {
      "app_id": "abcdf",
      "api_token": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "sdk_config": {
        "base_urls": {
          "config": "http://10.0.2.2:8989",
          "data": "http://10.0.2.2:8989",
          "data_dev": "http://10.0.2.2:8989",
          "images": "http://10.0.2.2:8989"
        },
        "view_config": {
          "enable_automatic_activity_capture": false
        }
      }
    }

  And `basic-test-app/app/embrace-sdk-config.json`:
    {
      "ios": {
        "appId": "abcdf",
        "endpointBaseUrl": "http://localhost:8877",
        "disableAutomaticViewCapture": true
      }
    }
   */

  const fs = require("fs");
  const {Command} = require("commander");
  const program = new Command();
  let appPath, configPath;

  program
    .name("set-embrace-config")
    .argument("<app>", "test app to modify config for")
    .argument("<config>", "JSON file containing the config to use")
    .option(
      "--namespace <namespace>",
      "namespace value to substitute when pointing to the mock-api",
    )
    .action((app, config) => {
      appPath = app;
      configPath = config;
    })
    .parse(process.argv);
  const options = program.opts();

  /*
    interface Config {
      api_token: string;
      android_app_id: string;
      ios_app_id: string;
      disable_view_capture: boolean;
      endpoint: string;
    }
  */
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (options.namespace && config.endpoint) {
    config.endpoint = config.endpoint.replace("<namespace>", options.namespace);
  }

  /*
    interface AndroidConfig {
      app_id: string;
      api_token: string;
      sdk_config?: {
        base_urls?: {
          config: string;
          data: string;
          data_dev: string;
          images: string;
        };
        view_config?: {
          enable_automatic_activity_capture: boolean;
        };
      };
    }
   */
  const androidConfigPath = `${appPath}/android/app/src/main/embrace-config.json`;
  const androidConfig = {
    app_id: config.android_app_id,
    api_token: config.api_token,
  };

  if (config.endpoint || config.disable_view_capture) {
    androidConfig.sdk_config = {};

    if (config.endpoint) {
      // https://developer.android.com/studio/run/emulator-networking#networkaddresses
      const androidEndpoint = config.endpoint.replace("localhost", "10.0.2.2");
      androidConfig.sdk_config.base_urls = {
        config: androidEndpoint,
        data: androidEndpoint,
        data_dev: androidEndpoint,
        images: androidEndpoint,
      };
    }

    if (config.disable_view_capture) {
      androidConfig.sdk_config.view_config = {
        enable_automatic_activity_capture: false,
      };
    }
  }

  fs.writeFileSync(
    androidConfigPath,
    JSON.stringify(androidConfig, undefined, 2),
  );
  console.log(`Wrote ${androidConfigPath}`);

  /*
    interface IOSConfig {
      ios: {
        appId: string;
        endpointBaseUrl: string;
        disableAutomaticViewCapture: boolean;
      };
    }
   */
  const iOSConfigPath = `${appPath}/app/embrace-sdk-config.json`; // TODO handle non-expo app
  const iOSConfig = {
    ios: {
      appId: config.ios_app_id,
      endpointBaseUrl: config.endpoint,
      disableAutomaticViewCapture: config.disable_view_capture,
    },
  };

  fs.writeFileSync(iOSConfigPath, JSON.stringify(iOSConfig, undefined, 2));
  console.log(`Wrote ${iOSConfigPath}`);
}
