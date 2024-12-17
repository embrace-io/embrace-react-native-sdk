import {ConfigPlugin, withPlugins} from "@expo/config-plugins";

import withIosEmbrace from "./withIosEmbrace";
import withAndroidEmbrace from "./withAndroidEmbrace";
import {EmbraceProps} from "./types";

const withEmbrace: ConfigPlugin<EmbraceProps> = (config, props) => {
  // TODO, should be a flag to allow these to be blank for the case that we aren't sending to Embrace
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
