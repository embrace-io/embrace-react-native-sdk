import {ConfigPlugin} from "@expo/config-plugins";

const withNewName: ConfigPlugin<{name?: string}> = (
  config,
  {name = "my-terrible-app"} = {},
) => {
  config.name = name;
  return config;
};

export default withNewName;
