import {ConfigPlugin, withPlugins} from "@expo/config-plugins";

import withIosEmbrace from "./withIosEmbrace";
import withAndroidEmbrace from "./withAndroidEmbrace";
import {EmbraceProps} from "./types";

const withEmbrace: ConfigPlugin<EmbraceProps> = (config, props) => {
  if (!(props.iOSAppId && props.androidAppId && props.apiToken)) {
    throw new Error(
      "The following props are required when using the Embrace Expo config plugin: iOSAppId, androidAppId, apiToken",
    );
  }

  if (props.iOSUseSPM !== undefined && typeof props.iOSUseSPM !== "boolean") {
    throw new Error(
      `Invalid options for Embrace Expo config plugin: iOSUseSPM must be a boolean, received ${typeof props.iOSUseSPM}`,
    );
  }

  return withPlugins(config, [
    [withIosEmbrace, props],
    [withAndroidEmbrace, props],
  ]);
};

export default withEmbrace;
