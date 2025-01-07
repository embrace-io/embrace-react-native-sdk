import {type ExpoConfig} from "@expo/config-types";
import {
  type ExportedConfigWithProps,
  type ModPlatform,
} from "@expo/config-plugins";

import {
  withAndroidEmbraceJSONConfig,
  withAndroidEmbraceSwazzlerDependency,
} from "../plugin/withAndroidEmbrace";

// TODO, fails if using `import` here?
const path = require("path");
const os = require("os");
const fs = require("fs");

const mockWithProjectBuildGradle = jest.fn();
const mockWithDangerousMod = jest.fn();

const getMockExpoConfig = (): ExpoConfig => ({name: "", slug: ""});
const getMockModConfig = (props: {
  platform?: string;
  platformProjectRoot?: string;
  language?: string;
  contents?: string;
}): ExportedConfigWithProps =>
  ({
    ...getMockExpoConfig(),
    ...{
      modRequest: {
        projectRoot: "project/",
        platformProjectRoot:
          props.platformProjectRoot || `project/${props.platform || ""}`,
        modName: "",
        platform: props.platform || "",
        introspect: false,
        ignoreExistingNativeFiles: false,
      },
      modResults: {
        path: "",
        language: props.language || "",
        contents: props.contents || "",
      },
      modRawConfig: getMockExpoConfig(),
    },
  }) as ExportedConfigWithProps;

const readMockFile = (name: string) =>
  fs.readFileSync(path.join(__dirname, "__plugin_mocks__", name)).toString();

jest.mock("@expo/config-plugins", () => {
  const plugins = jest.requireActual("@expo/config-plugins");
  return {
    ...plugins,
    withProjectBuildGradle: (
      config: ExpoConfig,
      modFunc: (cfg: ExportedConfigWithProps) => ExportedConfigWithProps,
    ) => mockWithProjectBuildGradle(modFunc),
    withDangerousMod: (
      config: ExpoConfig,
      props: [
        ModPlatform,
        (cfg: ExportedConfigWithProps) => ExportedConfigWithProps,
      ],
    ) => mockWithDangerousMod(props),
  };
});

describe("Expo Config Plugin", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("withAndroidEmbraceJSONConfig", () => {
    it("writes out the embrace-config.json file", async () => {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "plugin-test-"));
      const mockConfig = getMockModConfig({
        platform: "android",
        platformProjectRoot: tmp,
      });

      const pathToConfig = path.join(tmp, "app", "src", "main");
      fs.mkdirSync(pathToConfig, {recursive: true});

      withAndroidEmbraceJSONConfig(mockConfig, {
        androidAppId: "APPID",
        apiToken: "TOKEN",
        iOSAppId: "",
        androidCustomConfig: {
          enable_network_span_forwarding: true,
        },
      });

      expect(mockWithDangerousMod).toHaveBeenCalled();

      const props = mockWithDangerousMod.mock.lastCall[0];
      expect(props[0]).toBe("android");
      await props[1](mockConfig);

      const config = fs
        .readFileSync(path.join(pathToConfig, "embrace-config.json"))
        .toString();

      expect(JSON.parse(config)).toEqual({
        app_id: "APPID",
        api_token: "TOKEN",
        enable_network_span_forwarding: true,
      });
    });
  });

  describe("withAndroidEmbraceSwazzlerDependency", () => {
    it("inserts the Swazzler dependency in a groovy gradle file", async () => {
      const beforeSwazzler = readMockFile("projectBuildWithoutSwazzler.gradle");
      const afterSwazzler = readMockFile("projectBuildWithSwazzler.gradle");
      const mockConfig = getMockModConfig({
        platform: "android",
        language: "groovy",
        contents: beforeSwazzler,
      });

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
    it("inserts the Swazzler dependency in a kotlin gradle file", async () => {
      const beforeSwazzler = readMockFile(
        "projectBuildWithoutSwazzler.gradle.kts",
      );
      const afterSwazzler = readMockFile("projectBuildWithSwazzler.gradle.kts");
      const mockConfig = getMockModConfig({
        platform: "android",
        language: "kt",
        contents: beforeSwazzler,
      });

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
