import {type ExpoConfig} from "@expo/config-types";
import {type ExportedConfigWithProps} from "@expo/config-plugins";

import {withIosEmbraceAddInitializer} from "../plugin/withIosEmbrace";

// TODO, fails if using `import` here?
const path = require("path");
const os = require("os");
const fs = require("fs");

const xcode = require("xcode");

const mockWithXcodeProject = jest.fn();

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

jest.mock("@expo/config-plugins", () => {
  const plugins = jest.requireActual("@expo/config-plugins");
  return {
    ...plugins,
    withXcodeProject: (
      config: ExpoConfig,
      modFunc: (cfg: ExportedConfigWithProps) => ExportedConfigWithProps,
    ) => mockWithXcodeProject(modFunc),
  };
});

describe("Expo Config Plugin iOS", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("withIosEmbraceAddInitializer", () => {
    it("adds the EmbraceInitializer.swift project file", async () => {
      // withIosEmbraceAddInitializer overwrites the file in place so copy the mock to a tmp dir first
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "plugin-test-"));
      fs.mkdirSync(path.join(tmp, "basictestapp.xcodeproj"));
      const projectPath = path.join(
        tmp,
        "basictestapp.xcodeproj",
        "project.pbxproj",
      );
      const beforeEmbrace = readMockFile("xcodeprojWithoutEmbrace.pbxproj");
      fs.writeFileSync(projectPath, beforeEmbrace);

      const pbx = xcode.project(projectPath);
      pbx.parseSync();

      // Project UUID is non-deterministic, override the function for testing passing in the static IDs
      // from the mock file
      const mockUUIDs = [
        "FDCB4B30CE074D9DBF3488C0",
        "364FBCC5B81042249FAB62DD",
      ];
      pbx.generateUuid = () => mockUUIDs.pop();

      const mockConfig = getMockModConfig({
        platform: "ios",
        platformProjectRoot: tmp,
        projectName: "basictestapp",
        modResults: pbx,
      });

      withIosEmbraceAddInitializer(mockConfig, {
        androidAppId: "",
        apiToken: "",
        iOSAppId: "ios789",
      });

      expect(mockWithXcodeProject).toHaveBeenCalled();
      const modFunc = mockWithXcodeProject.mock.lastCall[0];
      await modFunc(mockConfig);

      const expectedEmbraceInitializer = readMockFile(
        "EmbraceInitializer.swift",
      );

      expect(
        fs.readFileSync(path.join(tmp, "EmbraceInitializer.swift")).toString(),
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
        fs.readFileSync(path.join(tmp, "EmbraceInitializer.swift")).toString(),
      ).toEqual(expectedEmbraceInitializer);
      expect(fs.readFileSync(projectPath).toString()).toEqual(
        expectedAfterEmbrace,
      );
    });
  });
});
