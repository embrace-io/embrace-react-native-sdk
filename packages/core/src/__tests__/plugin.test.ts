import {withAndroidEmbraceSwazzlerDependency} from "../plugin/withAndroidEmbrace";

const mockWithProjectBuildGradle = jest.fn();
import {type ExpoConfig} from "@expo/config-types";
import {type ExportedConfigWithProps} from "@expo/config-plugins";

const path = require("path");
const fs = require("fs");

const getMockExpoConfig = (): ExpoConfig => ({name: "", slug: ""});
const getMockModConfig = (
  platform: string,
  language: string,
  contents: string,
): ExportedConfigWithProps =>
  ({
    ...getMockExpoConfig(),
    ...{
      modRequest: {
        projectRoot: "project/",
        platformProjectRoot: `project/${platform}`,
        modName: "",
        platform,
        introspect: false,
        ignoreExistingNativeFiles: false,
      },
      modResults: {
        path: "",
        language,
        contents,
      },
      modRawConfig: getMockExpoConfig(),
    },
  }) as ExportedConfigWithProps;

const readMockFile = (name: string) =>
  fs.readFileSync(path.join(__dirname, "__mocks__", name)).toString();

jest.mock("@expo/config-plugins", () => {
  const plugins = jest.requireActual("@expo/config-plugins");
  return {
    ...plugins,
    withProjectBuildGradle: (
      config: ExpoConfig,
      modFunc: (cfg: ExportedConfigWithProps) => ExportedConfigWithProps,
    ) => mockWithProjectBuildGradle(modFunc),
  };
});

describe("Expo Config Plugin", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("withAndroidEmbraceSwazzlerDependency", () => {
    it("inserts the Swazzler dependency in a groovy gradle file", async () => {
      const beforeSwazzler = readMockFile("projectWithoutSwazzler.gradle");
      const afterSwazzler = readMockFile("projectWithSwazzler.gradle");
      const mockConfig = getMockModConfig("android", "groovy", beforeSwazzler);

      withAndroidEmbraceSwazzlerDependency(mockConfig, {
        androidAppId: "",
        apiToken: "",
        iOSAppId: "",
      });

      expect(mockWithProjectBuildGradle).toHaveBeenCalled();

      const modFunc = mockWithProjectBuildGradle.mock.lastCall[0];
      const updatedConfig = (await modFunc(
        mockConfig,
      )) as ExportedConfigWithProps;

      expect(updatedConfig.modResults.contents).toEqual(afterSwazzler);

      // Running again should not do any more modification
      const updatedAgainConfig = (await modFunc(
        updatedConfig,
      )) as ExportedConfigWithProps;
      expect(updatedAgainConfig.modResults.contents).toEqual(afterSwazzler);
    });
  });
});
