// See: https://docs.expo.dev/config-plugins/development-and-debugging/
// Available helpers: https://github.com/expo/expo/tree/814867fd9d0adbd56580eb09be1e81134bb7466e/packages/%40expo/config-plugins/src/plugins

import {
  ConfigPlugin,
  withPlugins,
  withDangerousMod,
} from "@expo/config-plugins";

const path = require("path");
const fs = require("fs");

type EmbraceProps = {
  androidAppId: string;
  iOSAppId: string;
  apiToken: string;
  androidCustomConfig?: object;
};

const withAndroidEmbraceJSONConfig: ConfigPlugin<EmbraceProps> = (
  config,
  props,
) => {
  return withDangerousMod(config, [
    "android",
    async config => {
      const filePath = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "embrace-config.json",
      );

      try {
        fs.writeFileSync(
          filePath,
          JSON.stringify(
            {
              app_id: props.androidAppId,
              api_token: props.apiToken,
              ...props.androidCustomConfig,
            },
            null,
            2,
          ),
        );
      } catch (e) {
        console.error(
          `withAndroidEmbraceJSONConfig failed to write ${filePath}: ${e}`,
        );
      }

      return config;
    },
  ]);
};

const withAndroidEmbrace: ConfigPlugin<EmbraceProps> = (config, props) => {
  /*
  - update android/build.gradle to include Swazzler dependency
  - update android/app/build.gradle to run swazzler plugin
  - invoke Embrace SDK in MainApplication OnCreate
   */

  config = withAndroidEmbraceJSONConfig(config, props);

  return config;
};

const withIosEmbrace: ConfigPlugin<EmbraceProps> = (config, props) => {
  /*
  - invoke EmbraceInitializer.swift in AppDelegate start
  - add build phase for uploading source maps
   */
  return config;
};

const withEmbrace: ConfigPlugin<EmbraceProps> = (config, props) => {
  if (!(props.iOSAppId && props.androidAppId && props.apiToken)) {
    throw new Error(
      "The following props are required when using the Embrace Expo config plug: iOSAppId, androidAppId, apiToken",
    );
  }

  return withPlugins(config, [
    [withIosEmbrace, props],
    [withAndroidEmbrace, props],
  ]);
};

export default withEmbrace;
