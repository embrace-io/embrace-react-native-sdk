import {type ExpoConfig} from "@expo/config-types";
import {type ExportedConfigWithProps} from "@expo/config-plugins";

import {
  withIosEmbraceAddBridgingHeader,
  withIosEmbraceAddInitializer,
  withIosEmbraceAddUploadPhase,
  withIosEmbraceInvokeInitializer,
  withIosEmbracePodfile,
} from "../plugin/withIosEmbrace";
import {type EmbraceProps} from "../plugin/types";

import {getMockModConfig, readMockFile} from "./helpers/pluginTestUtils";

const path = require("path");
const os = require("os");
const fs = require("fs");

const xcode = require("xcode");

const mockWithXcodeProject = jest.fn();
const mockWithAppDelegate = jest.fn();
const mockWithDangerousMod = jest.fn();

const setupTempPodfile = (contents: string) => {
  // the Podfile gets overwritten in place so write it to a tmp dir first
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "plugin-test-"));
  const podfilePath = path.join(tmp, "Podfile");
  fs.writeFileSync(podfilePath, contents);

  return {tmp, podfilePath};
};

const embraceProps: EmbraceProps = {
  androidAppId: "android123",
  apiToken: "apiToken456",
  iOSAppId: "ios789",
};

const setupTempProjectFile = (
  originalFileName: string,
  mockUUIDs: string[] = [],
) => {
  // the iOS project file gets overwritten in place so copy the mock to a tmp dir first
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "plugin-test-"));
  fs.mkdirSync(path.join(tmp, "basictestapp.xcodeproj"));
  fs.mkdirSync(path.join(tmp, "basictestapp"));
  const projectPath = path.join(
    tmp,
    "basictestapp.xcodeproj",
    "project.pbxproj",
  );
  const originalFile = readMockFile(originalFileName);
  fs.writeFileSync(projectPath, originalFile);

  const pbx = xcode.project(projectPath);
  pbx.parseSync();

  // Project UUID is non-deterministic, override the function for testing by passing in a static list of IDs to use
  pbx.generateUuid = () => mockUUIDs.pop();

  return {pbx, tmp, projectPath, contents: originalFile};
};

jest.mock("@expo/config-plugins", () => {
  const plugins = jest.requireActual("@expo/config-plugins");
  return {
    ...plugins,
    withXcodeProject: (
      config: ExpoConfig,
      modFunc: (cfg: ExportedConfigWithProps) => ExportedConfigWithProps,
    ) => mockWithXcodeProject(modFunc),
    withAppDelegate: (
      config: ExpoConfig,
      modFunc: (cfg: ExportedConfigWithProps) => ExportedConfigWithProps,
    ) => mockWithAppDelegate(modFunc),
    withDangerousMod: (
      config: ExpoConfig,
      props: [
        string,
        (cfg: ExportedConfigWithProps) => ExportedConfigWithProps,
      ],
    ) => mockWithDangerousMod(props),
  };
});

describe("Expo Config Plugin iOS", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("withIosEmbraceAddInitializer", () => {
    it("adds the EmbraceInitializer.swift project file", async () => {
      const {pbx, tmp, projectPath} = setupTempProjectFile(
        "xcodeprojWithoutEmbrace.pbxproj",
        ["FDCB4B30CE074D9DBF3488C0", "364FBCC5B81042249FAB62DD"],
      );

      const mockConfig = getMockModConfig({
        platform: "ios",
        platformProjectRoot: tmp,
        projectName: "basictestapp",
        modResults: pbx,
      });

      withIosEmbraceAddInitializer(mockConfig, embraceProps);

      expect(mockWithXcodeProject).toHaveBeenCalled();
      const modFunc = mockWithXcodeProject.mock.lastCall[0];
      await modFunc(mockConfig);

      const expectedEmbraceInitializer = readMockFile(
        "EmbraceInitializer.swift",
      );

      expect(
        fs
          .readFileSync(
            path.join(tmp, "basictestapp", "EmbraceInitializer.swift"),
          )
          .toString(),
      ).toEqual(expectedEmbraceInitializer);

      const expectedAfterEmbrace = readMockFile(
        "xcodeprojWithEmbraceInitializer.pbxproj",
      );
      expect(fs.readFileSync(projectPath).toString()).toEqual(
        expectedAfterEmbrace,
      );

      // No updates should be performed when EmbraceInitializer.swift already exists
      await modFunc(mockConfig);

      expect(
        fs
          .readFileSync(
            path.join(tmp, "basictestapp", "EmbraceInitializer.swift"),
          )
          .toString(),
      ).toEqual(expectedEmbraceInitializer);
      expect(fs.readFileSync(projectPath).toString()).toEqual(
        expectedAfterEmbrace,
      );
    });
  });

  describe("withIosEmbraceInvokeInitializer", () => {
    it("adds the Embrace initialization call to AppDelegate.mm", async () => {
      const beforeEmbrace = readMockFile("AppDelegateWithoutEmbrace.mm");
      const afterEmbrace = readMockFile("AppDelegateWithEmbrace.mm");
      const mockConfig = getMockModConfig({
        platform: "ios",
        projectName: "basictestapp",
        language: "objcpp",
        contents: beforeEmbrace,
      });

      withIosEmbraceInvokeInitializer(mockConfig, embraceProps);

      expect(mockWithAppDelegate).toHaveBeenCalled();

      const modFunc = mockWithAppDelegate.mock.lastCall[0];
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

    it("uses the product module name when provided for the bridging header", async () => {
      const beforeEmbrace = readMockFile("AppDelegateWithoutEmbrace.mm");
      const afterEmbrace = readMockFile(
        "AppDelegateWithEmbraceProductModuleName.mm",
      );
      const mockConfig = getMockModConfig({
        platform: "ios",
        projectName: "basictestapp",
        language: "objcpp",
        contents: beforeEmbrace,
      });

      withIosEmbraceInvokeInitializer(mockConfig, {
        ...embraceProps,
        productModuleName: "MyProduct",
      });

      expect(mockWithAppDelegate).toHaveBeenCalled();

      const modFunc = mockWithAppDelegate.mock.lastCall[0];
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

    it("adds the Embrace initialization call to AppDelegate.swift", async () => {
      const beforeEmbrace = readMockFile("AppDelegateWithoutEmbrace.swift");
      const afterEmbrace = readMockFile("AppDelegateWithEmbrace.swift");
      const mockConfig = getMockModConfig({
        platform: "ios",
        projectName: "basictestapp",
        language: "swift",
        contents: beforeEmbrace,
      });

      withIosEmbraceInvokeInitializer(mockConfig, embraceProps);

      expect(mockWithAppDelegate).toHaveBeenCalled();

      const modFunc = mockWithAppDelegate.mock.lastCall[0];
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

    it("adds the Embrace initialization call to AppDelegate.swift from Expo 53", async () => {
      const beforeEmbrace = readMockFile("AppDelegateExpo53.swift");
      const afterEmbrace = readMockFile("AppDelegateExpo53WithEmbrace.swift");
      const mockConfig = getMockModConfig({
        platform: "ios",
        projectName: "basictestapp",
        language: "swift",
        contents: beforeEmbrace,
      });

      withIosEmbraceInvokeInitializer(mockConfig, embraceProps);

      expect(mockWithAppDelegate).toHaveBeenCalled();

      const modFunc = mockWithAppDelegate.mock.lastCall[0];
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

  describe("withIosEmbraceAddBridgingHeader", () => {
    it("adds the Swift bridging header", async () => {
      const {pbx, tmp, projectPath} = setupTempProjectFile(
        "xcodeprojNoBridgingHeader.pbxproj",
        ["A46AD91AB1474E0A94A4CACD", "16AE3E77E00D49E9B12CCBE0"],
      );

      const mockConfig = getMockModConfig({
        platform: "ios",
        platformProjectRoot: tmp,
        projectName: "basictestapp",
        modResults: pbx,
      });

      withIosEmbraceAddBridgingHeader(mockConfig, embraceProps);

      expect(mockWithXcodeProject).toHaveBeenCalled();
      const modFunc = mockWithXcodeProject.mock.lastCall[0];
      await modFunc(mockConfig);

      const expectedHeader = readMockFile("Bridging-Header.h");

      expect(
        fs
          .readFileSync(
            path.join(tmp, "basictestapp", "basictestapp-Bridging-Header.h"),
          )
          .toString(),
      ).toEqual(expectedHeader);

      const expectedAfterHeader = readMockFile(
        "xcodeprojWithBridgingHeader.pbxproj",
      );
      expect(fs.readFileSync(projectPath).toString()).toEqual(
        expectedAfterHeader,
      );

      // No updates should be performed when the bridging header already exists
      await modFunc(mockConfig);

      expect(
        fs
          .readFileSync(
            path.join(tmp, "basictestapp", "basictestapp-Bridging-Header.h"),
          )
          .toString(),
      ).toEqual(expectedHeader);
      expect(fs.readFileSync(projectPath).toString()).toEqual(
        expectedAfterHeader,
      );
    });

    it("does nothing if the Swift bridging header is already added", async () => {
      const {pbx, tmp} = setupTempProjectFile(
        "xcodeprojNoBridgingHeader.pbxproj",
      );

      const mockConfig = getMockModConfig({
        platform: "ios",
        platformProjectRoot: tmp,
        projectName: "basictestapp",
        modResults: pbx,
      });

      withIosEmbraceAddBridgingHeader(mockConfig, embraceProps);

      expect(mockWithXcodeProject).toHaveBeenCalled();
    });
  });

  describe("withIosEmbraceAddUploadPhase", () => {
    it("modifies the react native bundle phase and adds the Embrace upload phase", async () => {
      const {pbx, tmp, projectPath} = setupTempProjectFile(
        "xcodeprojWithoutEmbrace.pbxproj",
        ["86732A137C194E2FB986E7FA"],
      );

      const mockConfig = getMockModConfig({
        platform: "ios",
        platformProjectRoot: tmp,
        projectName: "basictestapp",
        modResults: pbx,
      });

      withIosEmbraceAddUploadPhase(mockConfig, embraceProps);

      expect(mockWithXcodeProject).toHaveBeenCalled();
      const modFunc = mockWithXcodeProject.mock.lastCall[0];
      await modFunc(mockConfig);

      const expectedAfterPhase = readMockFile(
        "xcodeprojWithEmbraceBuildPhase.pbxproj",
      );
      expect(fs.readFileSync(projectPath).toString()).toEqual(
        expectedAfterPhase,
      );

      // No updates should be performed when the phase has already been added
      await modFunc(mockConfig);

      expect(fs.readFileSync(projectPath).toString()).toEqual(
        expectedAfterPhase,
      );
    });
  });

  // The snippets every Podfile gets are covered by the shared transform in
  // scripts/__tests__/util.podfile.test.ts. iOSUseSPM belongs to the plugin, so it is covered here.
  describe("withIosEmbracePodfile", () => {
    const runMod = async (tmp: string) => {
      expect(mockWithDangerousMod).toHaveBeenCalled();
      const [platform, modFunc] = mockWithDangerousMod.mock.lastCall[0];
      expect(platform).toEqual("ios");

      await modFunc(
        getMockModConfig({platform: "ios", platformProjectRoot: tmp}),
      );
    };

    it("sources the SDK from CocoaPods by default", async () => {
      const {tmp, podfilePath} = setupTempPodfile(
        readMockFile("PodfileExpoWithoutEmbrace"),
      );
      const expected = readMockFile("PodfileExpoWithEmbrace");

      withIosEmbracePodfile(
        getMockModConfig({platform: "ios", platformProjectRoot: tmp}),
        embraceProps,
      );
      await runMod(tmp);

      expect(fs.readFileSync(podfilePath).toString()).toEqual(expected);

      // prebuild reuses an existing ios/ directory, so this has to be a no-op the second time
      await runMod(tmp);

      expect(fs.readFileSync(podfilePath).toString()).toEqual(expected);
    });

    it("sources the SDK from SPM when iOSUseSPM is set", async () => {
      const {tmp, podfilePath} = setupTempPodfile(
        readMockFile("PodfileExpoWithoutEmbrace"),
      );
      const expected = readMockFile("PodfileExpoWithEmbraceSPM");

      withIosEmbracePodfile(
        getMockModConfig({platform: "ios", platformProjectRoot: tmp}),
        {...embraceProps, iOSUseSPM: true},
      );
      await runMod(tmp);

      expect(fs.readFileSync(podfilePath).toString()).toEqual(expected);

      await runMod(tmp);

      expect(fs.readFileSync(podfilePath).toString()).toEqual(expected);
    });

    it("reverts to CocoaPods when iOSUseSPM is turned off", async () => {
      const {tmp, podfilePath} = setupTempPodfile(
        readMockFile("PodfileExpoWithEmbraceSPM"),
      );

      withIosEmbracePodfile(
        getMockModConfig({platform: "ios", platformProjectRoot: tmp}),
        embraceProps,
      );
      await runMod(tmp);

      expect(fs.readFileSync(podfilePath).toString()).toEqual(
        readMockFile("PodfileExpoWithEmbrace"),
      );
    });

    it("fails loudly when the Podfile has nowhere to patch", async () => {
      const {tmp} = setupTempPodfile("source 'https://cdn.cocoapods.org/'\n");

      withIosEmbracePodfile(
        getMockModConfig({platform: "ios", platformProjectRoot: tmp}),
        embraceProps,
      );

      const [, modFunc] = mockWithDangerousMod.mock.lastCall[0];
      await expect(
        modFunc(getMockModConfig({platform: "ios", platformProjectRoot: tmp})),
      ).rejects.toThrow("Could not patch the Podfile");
    });
  });
});
