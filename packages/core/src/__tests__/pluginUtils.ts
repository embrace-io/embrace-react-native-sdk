import {type ExpoConfig} from "@expo/config-types";
import {type ExportedConfigWithProps} from "@expo/config-plugins";

const path = require("path");
const fs = require("fs");

const getMockExpoConfig = (): ExpoConfig => ({name: "", slug: ""});
const getMockModConfig = (props: {
  platform?: string;
  platformProjectRoot?: string;
  projectName?: string;
  language?: string;
  contents?: string;
  modResults?: object;
}): ExportedConfigWithProps =>
  ({
    ...getMockExpoConfig(),
    ...{
      modRequest: {
        projectRoot: "project/",
        projectName: props.projectName || "",
        platformProjectRoot:
          props.platformProjectRoot || `project/${props.platform || ""}`,
        modName: "",
        platform: props.platform || "",
        introspect: false,
        ignoreExistingNativeFiles: false,
      },
      modResults: props.modResults || {
        path: "",
        language: props.language || "",
        contents: props.contents || "",
      },
      modRawConfig: getMockExpoConfig(),
    },
  }) as ExportedConfigWithProps;

const mockFilePath = (name: string) =>
  path.join(__dirname, "__plugin_mocks__", name);

const readMockFile = (name: string) =>
  fs.readFileSync(mockFilePath(name)).toString();

export {getMockModConfig, mockFilePath, readMockFile};
