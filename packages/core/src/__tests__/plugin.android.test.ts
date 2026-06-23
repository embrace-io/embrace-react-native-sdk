import {type ExpoConfig} from "@expo/config-types";
import {
  type ExportedConfigWithProps,
  type ModPlatform,
} from "@expo/config-plugins";

import {
  withAndroidEmbraceApplyGradlePlugin,
  withAndroidEmbraceJSONConfig,
  withAndroidEmbraceOnCreate,
  withAndroidEmbraceGradlePluginDependency,
} from "../plugin/withAndroidEmbrace";

import {getMockModConfig, readMockFile} from "./helpers/pluginTestUtils";

const path = require("path");
const os = require("os");
const fs = require("fs");

const mockWithProjectBuildGradle = jest.fn();
const mockWithAppBuildGradle = jest.fn();
const mockWithDangerousMod = jest.fn();
const mockWithMainApplication = jest.fn();

jest.mock("@expo/config-plugins", () => {
  const plugins = jest.requireActual("@expo/config-plugins");
  return {
    ...plugins,
    withProjectBuildGradle: (
      config: ExpoConfig,
      modFunc: (cfg: ExportedConfigWithProps) => ExportedConfigWithProps,
    ) => mockWithProjectBuildGradle(modFunc),
    withAppBuildGradle: (
      config: ExpoConfig,
      modFunc: (cfg: ExportedConfigWithProps) => ExportedConfigWithProps,
    ) => mockWithAppBuildGradle(modFunc),
    withMainApplication: (
      config: ExpoConfig,
      modFunc: (cfg: ExportedConfigWithProps) => ExportedConfigWithProps,
    ) => mockWithMainApplication(modFunc),
    withDangerousMod: (
      config: ExpoConfig,
      props: [
        ModPlatform,
        (cfg: ExportedConfigWithProps) => ExportedConfigWithProps,
      ],
    ) => mockWithDangerousMod(props),
  };
});

describe("Expo Config Plugin Android", () => {
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
        androidSDKConfig: {
          networking: {
            enable_network_span_forwarding: true,
          },
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
        sdk_config: {
          app_framework: "react_native",
          networking: {
            enable_network_span_forwarding: true,
          },
        },
      });
    });
  });

  describe("withAndroidEmbraceGradlePluginDependency", () => {
    it("inserts the Embrace Gradle plugin dependency in a groovy project gradle file", async () => {
      const beforeEmbrace = readMockFile("projectBuildWithoutEmbrace.gradle");
      const afterEmbrace = readMockFile("projectBuildWithEmbrace.gradle");
      const mockConfig = getMockModConfig({
        platform: "android",
        language: "groovy",
        contents: beforeEmbrace,
      });

      withAndroidEmbraceGradlePluginDependency(mockConfig, {
        androidAppId: "",
        apiToken: "",
        iOSAppId: "",
      });

      expect(mockWithProjectBuildGradle).toHaveBeenCalled();

      const modFunc = mockWithProjectBuildGradle.mock.lastCall[0];
      const updatedConfig = (await modFunc(
        mockConfig,
      )) as ExportedConfigWithProps;

      expect(updatedConfig.modResults.contents).toEqual(afterEmbrace);

      // Running again should not do any more modification
      const updatedAgainConfig = (await modFunc(
        updatedConfig,
      )) as ExportedConfigWithProps;
      expect(updatedAgainConfig.modResults.contents).toEqual(afterEmbrace);
    });

    it("inserts the Embrace Gradle plugin dependency in a kotlin project gradle file", async () => {
      const beforeEmbrace = readMockFile(
        "projectBuildWithoutEmbrace.gradle.kts",
      );
      const afterEmbrace = readMockFile("projectBuildWithEmbrace.gradle.kts");
      const mockConfig = getMockModConfig({
        platform: "android",
        language: "kt",
        contents: beforeEmbrace,
      });

      withAndroidEmbraceGradlePluginDependency(mockConfig, {
        androidAppId: "",
        apiToken: "",
        iOSAppId: "",
      });

      expect(mockWithProjectBuildGradle).toHaveBeenCalled();

      const modFunc = mockWithProjectBuildGradle.mock.lastCall[0];
      const updatedConfig = (await modFunc(
        mockConfig,
      )) as ExportedConfigWithProps;

      expect(updatedConfig.modResults.contents).toEqual(afterEmbrace);

      // Running again should not do any more modification
      const updatedAgainConfig = (await modFunc(
        updatedConfig,
      )) as ExportedConfigWithProps;
      expect(updatedAgainConfig.modResults.contents).toEqual(afterEmbrace);
    });

    it("migrates a legacy embrace-swazzler classpath to embrace-gradle-plugin", async () => {
      const afterEmbrace = readMockFile("projectBuildWithEmbrace.gradle");
      // Simulate a project that was set up before the plugin was renamed
      const legacy = afterEmbrace.replace(
        /embrace-gradle-plugin/g,
        "embrace-swazzler",
      );
      const mockConfig = getMockModConfig({
        platform: "android",
        language: "groovy",
        contents: legacy,
      });

      withAndroidEmbraceGradlePluginDependency(mockConfig, {
        androidAppId: "",
        apiToken: "",
        iOSAppId: "",
      });

      const modFunc = mockWithProjectBuildGradle.mock.lastCall[0];
      const updatedConfig = (await modFunc(
        mockConfig,
      )) as ExportedConfigWithProps;

      expect(updatedConfig.modResults.contents).not.toContain(
        "embrace-swazzler",
      );
      expect(updatedConfig.modResults.contents).toEqual(afterEmbrace);
    });
  });

  describe("withAndroidEmbraceApplyGradlePlugin", () => {
    it("applies the Embrace Gradle plugin in a groovy app gradle file", async () => {
      const beforeEmbrace = readMockFile("appBuildWithoutEmbrace.gradle");
      const afterEmbrace = readMockFile("appBuildWithEmbrace.gradle");
      const mockConfig = getMockModConfig({
        platform: "android",
        language: "groovy",
        contents: beforeEmbrace,
      });

      withAndroidEmbraceApplyGradlePlugin(mockConfig, {
        androidAppId: "",
        apiToken: "",
        iOSAppId: "",
      });

      expect(mockWithAppBuildGradle).toHaveBeenCalled();

      const modFunc = mockWithAppBuildGradle.mock.lastCall[0];
      const updatedConfig = (await modFunc(
        mockConfig,
      )) as ExportedConfigWithProps;

      expect(updatedConfig.modResults.contents).toEqual(afterEmbrace);

      // Running again should not do any more modification
      const updatedAgainConfig = (await modFunc(
        updatedConfig,
      )) as ExportedConfigWithProps;
      expect(updatedAgainConfig.modResults.contents).toEqual(afterEmbrace);
    });

    it("applies the Embrace Gradle plugin in a kotlin app gradle file", async () => {
      const beforeEmbrace = readMockFile("appBuildWithoutEmbrace.gradle.kts");
      const afterEmbrace = readMockFile("appBuildWithEmbrace.gradle.kts");
      const mockConfig = getMockModConfig({
        platform: "android",
        language: "kt",
        contents: beforeEmbrace,
      });

      withAndroidEmbraceApplyGradlePlugin(mockConfig, {
        androidAppId: "",
        apiToken: "",
        iOSAppId: "",
      });

      expect(mockWithAppBuildGradle).toHaveBeenCalled();

      const modFunc = mockWithAppBuildGradle.mock.lastCall[0];
      const updatedConfig = (await modFunc(
        mockConfig,
      )) as ExportedConfigWithProps;

      expect(updatedConfig.modResults.contents).toEqual(afterEmbrace);

      // Running again should not do any more modification
      const updatedAgainConfig = (await modFunc(
        updatedConfig,
      )) as ExportedConfigWithProps;
      expect(updatedAgainConfig.modResults.contents).toEqual(afterEmbrace);
    });

    it("migrates a legacy embrace-swazzler apply line in a groovy app gradle file", async () => {
      const afterEmbrace = readMockFile("appBuildWithEmbrace.gradle");
      // Simulate a project that was set up before the plugin was renamed
      const legacy = afterEmbrace.replace(
        /embrace-gradle-plugin/g,
        "embrace-swazzler",
      );
      const mockConfig = getMockModConfig({
        platform: "android",
        language: "groovy",
        contents: legacy,
      });

      withAndroidEmbraceApplyGradlePlugin(mockConfig, {
        androidAppId: "",
        apiToken: "",
        iOSAppId: "",
      });

      const modFunc = mockWithAppBuildGradle.mock.lastCall[0];
      const updatedConfig = (await modFunc(
        mockConfig,
      )) as ExportedConfigWithProps;

      expect(updatedConfig.modResults.contents).not.toContain(
        "embrace-swazzler",
      );
      expect(updatedConfig.modResults.contents).toEqual(afterEmbrace);
    });

    it("migrates a legacy embrace-swazzler apply line in a kotlin app gradle file", async () => {
      const afterEmbrace = readMockFile("appBuildWithEmbrace.gradle.kts");
      // Simulate a project that was set up before the plugin was renamed
      const legacy = afterEmbrace.replace(
        /embrace-gradle-plugin/g,
        "embrace-swazzler",
      );
      const mockConfig = getMockModConfig({
        platform: "android",
        language: "kt",
        contents: legacy,
      });

      withAndroidEmbraceApplyGradlePlugin(mockConfig, {
        androidAppId: "",
        apiToken: "",
        iOSAppId: "",
      });

      const modFunc = mockWithAppBuildGradle.mock.lastCall[0];
      const updatedConfig = (await modFunc(
        mockConfig,
      )) as ExportedConfigWithProps;

      expect(updatedConfig.modResults.contents).not.toContain(
        "embrace-swazzler",
      );
      expect(updatedConfig.modResults.contents).toEqual(afterEmbrace);
    });
  });

  describe("withAndroidEmbraceOnCreate", () => {
    it("adds the Embrace initialization call to MainApplication.java", async () => {
      const beforeEmbrace = readMockFile("MainApplicationWithoutEmbrace.java");
      const afterEmbrace = readMockFile("MainApplicationWithEmbrace.java");
      const mockConfig = getMockModConfig({
        platform: "android",
        language: "java",
        contents: beforeEmbrace,
      });

      withAndroidEmbraceOnCreate(mockConfig, {
        androidAppId: "",
        apiToken: "",
        iOSAppId: "",
      });

      expect(mockWithMainApplication).toHaveBeenCalled();

      const modFunc = mockWithMainApplication.mock.lastCall[0];
      const updatedConfig = (await modFunc(
        mockConfig,
      )) as ExportedConfigWithProps;

      expect(updatedConfig.modResults.contents).toEqual(afterEmbrace);

      // Running again should not do any more modification
      const updatedAgainConfig = (await modFunc(
        updatedConfig,
      )) as ExportedConfigWithProps;
      expect(updatedAgainConfig.modResults.contents).toEqual(afterEmbrace);
    });

    it("adds the Embrace initialization call to MainApplication.kt", async () => {
      const beforeEmbrace = readMockFile("MainApplicationWithoutEmbrace.kt");
      const afterEmbrace = readMockFile("MainApplicationWithEmbrace.kt");
      const mockConfig = getMockModConfig({
        platform: "android",
        language: "kotlin",
        contents: beforeEmbrace,
      });

      withAndroidEmbraceOnCreate(mockConfig, {
        androidAppId: "",
        apiToken: "",
        iOSAppId: "",
      });

      expect(mockWithMainApplication).toHaveBeenCalled();

      const modFunc = mockWithMainApplication.mock.lastCall[0];
      const updatedConfig = (await modFunc(
        mockConfig,
      )) as ExportedConfigWithProps;

      expect(updatedConfig.modResults.contents).toEqual(afterEmbrace);

      // Running again should not do any more modification
      const updatedAgainConfig = (await modFunc(
        updatedConfig,
      )) as ExportedConfigWithProps;
      expect(updatedAgainConfig.modResults.contents).toEqual(afterEmbrace);
    });
  });
});
