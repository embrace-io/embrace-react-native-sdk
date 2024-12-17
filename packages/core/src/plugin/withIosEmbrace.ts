import {ConfigPlugin} from "@expo/config-plugins";

import {EmbraceProps} from "./types";

const withIosEmbrace: ConfigPlugin<EmbraceProps> = (config, props) => {
  /*
  TODO
  - invoke EmbraceInitializer.swift in AppDelegate start
  - add build phase for uploading source maps
   */
  return config;
};

export default withIosEmbrace;
