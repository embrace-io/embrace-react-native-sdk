#!/usr/bin/env node
{
  /*
  Takes a JSON defining a set of Embrace config options and applies them to a given test app, running:

    ./set-embrace-config.js rn82 embrace-configs/my-config.json

  Where `embrace-configs/my-config.json` contains:

    {
      "api_token": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "android_app_id": "abcdf",
      "ios_app_id": "abcdf",
      "disable_view_capture": true,
      "endpoint": "http://localhost:8989",
      "enable_network_span_forwarding": true,
      "disabled_url_patterns": ["*.api.com"]
    }

  Would produce `rn82/android/app/src/main/embrace-config.json`:

    {
      "app_id": "abcdf",
      "api_token": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "sdk_config": {
        "app_framework": "react_native",
        "base_urls": {
          "config": "http://10.0.2.2:8989",
          "data": "http://10.0.2.2:8989"
        },
        "view_config": {
          "enable_automatic_activity_capture": false
        },
        "networking": {
          "disabled_url_patterns": ["*.api.com"],
          "enable_network_span_forwarding": true
        }
      }
    }
   */

  const fs = require("fs");
  const {Command} = require("commander");
  const program = new Command();
  const loadEnvVar = require("../config/env");
  let appPath, configPath;

  program
    .name("set-embrace-config")
    .argument("<app>", "test app to modify config for")
    .argument("<config>", "JSON file containing the config to use")
    .option(
      "--namespace <namespace>",
      "namespace value to substitute when pointing to the mock-api",
    )
    .option(
      "--prebuild",
      "writes config to the app.json expo config instead of native directories",
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
      enable_network_span_forwarding: boolean;
      disabled_url_patterns: string[];
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
      sdk_config: {
        app_framework: "react_native";
        base_urls?: {
          config: string;
          data: string;
        };
        view_config?: {
          enable_automatic_activity_capture: boolean;
        };
        networking?: {
          disabled_url_patterns: string[],
          enable_network_span_forwarding: boolean;
        }
      };
    }
   */
  const androidConfigPath = `${appPath}/android/app/src/main/embrace-config.json`;
  const androidConfig = {
    app_id: config.android_app_id,
    api_token: loadEnvVar("EMBRACE_ORG_TOKEN", configPath),
    sdk_config: {
      app_framework: "react_native",
    },
  };

  if (
    config.endpoint ||
    config.disable_view_capture ||
    config.enable_network_span_forwarding ||
    config.disabled_url_patterns
  ) {
    if (config.enable_network_span_forwarding || config.disabled_url_patterns) {
      androidConfig.sdk_config.networking = {};

      if (config.enable_network_span_forwarding) {
        androidConfig.sdk_config.networking = {
          enable_network_span_forwarding: true,
        };
      }

      if (config.disabled_url_patterns) {
        androidConfig.sdk_config.networking = {
          ...androidConfig.sdk_config.networking,
          // the emulator reaches the host machine on 10.0.2.2, so patterns aimed at a local
          // server need the same rewrite base_urls gets below
          disabled_url_patterns: config.disabled_url_patterns.map(pattern =>
            pattern.replace("localhost", "10.0.2.2"),
          ),
        };
      }
    }

    if (config.endpoint) {
      // https://developer.android.com/studio/run/emulator-networking#networkaddresses
      const androidEndpoint = config.endpoint.replace("localhost", "10.0.2.2");
      androidConfig.sdk_config.base_urls = {
        config: androidEndpoint,
        data: androidEndpoint,
      };
    }

    if (config.disable_view_capture) {
      androidConfig.sdk_config.view_config = {
        enable_automatic_activity_capture: false,
      };
    }
  }

  const findIOSInitializerPath = () => {
    const iosPath = `${appPath}/ios`;
    const initializerPaths = fs.existsSync(iosPath)
      ? fs
          .readdirSync(iosPath)
          .map(dir => `${iosPath}/${dir}/EmbraceInitializer.swift`)
          .filter(initializerPath => fs.existsSync(initializerPath))
      : [];

    if (initializerPaths.length !== 1) {
      throw new Error(
        `Expected exactly one ios/*/EmbraceInitializer.swift in ${appPath}, found ${initializerPaths.length}. The app template is missing the Embrace native initialization.`,
      );
    }

    return initializerPaths[0];
  };

  const iosInitializerProperties = {
    appId: JSON.stringify(config.ios_app_id),
    endpointBaseUrl: config.endpoint ? JSON.stringify(config.endpoint) : "nil",
    disableViewCapture: String(!!config.disable_view_capture),
    enableNetworkSpanForwarding: String(!!config.enable_network_span_forwarding),
    disabledUrlPatterns: JSON.stringify(config.disabled_url_patterns || []),
  };

  const setIOSInitializerProperties = (initializerPath, contents) =>
    Object.entries(iosInitializerProperties).reduce((updated, [name, value]) => {
      const property = new RegExp(`^(\\s*private static let ${name}\\b[^=]*= ).*$`, "m");

      if (!property.test(updated)) {
        throw new Error(`Could not find the ${name} property in ${initializerPath}`);
      }

      return updated.replace(property, (_, declaration) => `${declaration}${value}`);
    }, contents);

  if (!options.prebuild) {
    fs.writeFileSync(
      androidConfigPath,
      JSON.stringify(androidConfig, undefined, 2),
    );

    console.log(`Wrote ${androidConfigPath}`);

    const iosInitializerPath = findIOSInitializerPath();
    fs.writeFileSync(
      iosInitializerPath,
      setIOSInitializerProperties(
        iosInitializerPath,
        fs.readFileSync(iosInitializerPath, "utf8"),
      ),
    );

    console.log(`Wrote ${iosInitializerPath}`);
  }

  if (options.prebuild) {
    const appJSONPath = `${appPath}/app.json`;
    const appJSONConfig = JSON.parse(fs.readFileSync(appJSONPath, "utf8"));

    const embracePluginIndex = appJSONConfig.expo.plugins.findIndex(
      plugin =>
        plugin.length &&
        plugin[0] === "@embrace-io/react-native",
    );

    // Remove the existing entry
    if (embracePluginIndex >= 0) {
      appJSONConfig.expo.plugins.splice(embracePluginIndex, 1);
    }

    // Add the updated plugin entry
    appJSONConfig.expo.plugins.push([
      "@embrace-io/react-native",
      {
        androidAppId: config.android_app_id,
        iOSAppId: config.ios_app_id,
        apiToken: androidConfig.api_token,
        androidSDKConfig: androidConfig.sdk_config,
      },
    ]);

    // Overwrite the file
    fs.writeFileSync(appJSONPath, JSON.stringify(appJSONConfig, undefined, 2));

    console.log(`Wrote ${appJSONPath}`);
  }
}
