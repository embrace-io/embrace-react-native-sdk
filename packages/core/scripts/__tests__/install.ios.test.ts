import Wizard, {type Field, type Step} from "../util/wizard";
import {getXcodeProject, UPLOAD_SYMBOLS_PHASE} from "../util/ios";
import {
  apiToken,
  iosAppID,
  iosProjectFolderName,
  packageJSON,
} from "../setup/common";

const fs = require("fs");

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

const TMP = "./packages/core/scripts/__tests__/tmp";
const MOCKS = "./packages/core/scripts/__tests__/__mocks__/ios";

const ensureTmp = () => {
  if (!fs.existsSync(TMP)) {
    fs.mkdirSync(TMP);
  }
};

const copyMock = (from: string, to: string) => {
  ensureTmp();

  fs.copyFileSync(from, to);
};

const writeTmp = (name: string, contents: string) => {
  ensureTmp();

  fs.writeFileSync(`${TMP}/${name}`, contents);
};

const readTmp = (name: string) => fs.readFileSync(`${TMP}/${name}`).toString();

const readFile = (filePath: string) => fs.readFileSync(filePath).toString();

const APP = `${TMP}/ios-setup-app`;
const IOS = `${APP}/ios`;
const APP_FOLDER = `${IOS}/EmbraceTestSuite`;
const PROJECT = `${IOS}/EmbraceTestSuite.xcodeproj/project.pbxproj`;
const EMBRACE_PROJECT = `${MOCKS}/testMock.xcodeproj/project.pbxproj`;
const BUNDLE_PHASE = "Bundle React Native code and images";

const ANSWERS: {[field: string]: unknown} = {
  [iosProjectFolderName.name]: "",
  [packageJSON.name]: {name: "EmbraceTestSuite"},
  [iosAppID.name]: "abcde",
  [apiToken.name]: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
};

// Answers the wizard's questions without prompting; defaults match testMock's app ID and token
const answerWizard = (overrides: {[field: string]: unknown} = {}) => {
  const answers = {...ANSWERS, ...overrides};

  jest
    .spyOn(Wizard.prototype, "fieldValue")
    .mockImplementation(async (field: Field) => answers[field.name]);
  jest
    .spyOn(Wizard.prototype, "fieldValueList")
    .mockImplementation(async (fields: Field[]) =>
      fields.map(field => answers[field.name]),
    );
};

// Creates a fake app under tmp from an Xcode project fixture and, optionally, an AppDelegate
const setUpApp = ({
  project,
  appDelegate,
}: {
  project: string;
  appDelegate?: "mm" | "swift";
}) => {
  fs.rmSync(APP, {recursive: true, force: true});
  fs.mkdirSync(`${IOS}/EmbraceTestSuite.xcodeproj`, {recursive: true});
  fs.mkdirSync(APP_FOLDER);
  fs.copyFileSync(`${MOCKS}/${project}.xcodeproj/project.pbxproj`, PROJECT);

  if (appDelegate) {
    fs.copyFileSync(
      `${MOCKS}/AppDelegateWithoutEmbrace.${appDelegate}`,
      `${APP_FOLDER}/AppDelegate.${appDelegate}`,
    );
  }
};

// Loads setup/ios with its file lookups and "ios/..." paths pointed at the fake app instead of the repo root
const requireSetupIos = () => {
  jest.doMock("glob", () => {
    const actualGlob = jest.requireActual("glob");

    return {
      sync: (pattern: string, options: object = {}) =>
        actualGlob
          .sync(pattern, {...options, cwd: APP})
          .map((match: string) => `${APP}/${match}`),
    };
  });
  jest.doMock("path", () => {
    const actualPath = jest.requireActual("path");

    return {
      ...actualPath,
      join: (first: string, ...rest: string[]) =>
        first === "ios"
          ? actualPath.join(IOS, ...rest)
          : actualPath.join(first, ...rest),
    };
  });

  return require("../setup/ios");
};

// Maps build phase names to their scripts, for comparing a patched project with testMock
const shellScripts = async (pbxPath: string) => {
  const phases = (await getXcodeProject(pbxPath)).buildPhaseObj();

  return Object.keys(phases)
    .filter(key => !key.endsWith("_comment"))
    .reduce(
      (scripts, key) => ({
        ...scripts,
        [phases[`${key}_comment`]]: phases[key].shellScript,
      }),
      {} as {[phase: string]: string},
    );
};

// Lists a target's build phases, to check which target a phase was added to
const targetBuildPhases = async (targetName: string) => {
  const {project} = await getXcodeProject(PROJECT);

  return project
    .pbxTargetByName(targetName)
    .buildPhases.map(({comment}: {comment: string}) => comment);
};

// Lists the files a target compiles, to check the initializer was added to the app
const targetSources = async (targetName: string) => {
  const {project} = await getXcodeProject(PROJECT);

  return project
    .pbxSourcesBuildPhaseObj(project.findTargetKey(targetName))
    .files.map(({comment}: {comment: string}) => comment);
};

// Runs a step the way the wizard does, so the step's own wiring is covered too
const runStep = (step: Step) => {
  const wizard = new Wizard();
  wizard.registerStep(step);

  return wizard.processSteps();
};

describe("Install Script iOS", () => {
  test("Patch AppDelegate.mm", async () => {
    const originalMockPath =
      "./packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithoutEmbrace.mm";
    const patchPath =
      "./packages/core/scripts/__tests__/tmp/PatchAppDelegate.mm";

    copyMock(originalMockPath, patchPath);

    jest.mock("glob", () => ({
      sync: () => ["./packages/core/scripts/__tests__/tmp/PatchAppDelegate.mm"],
    }));

    jest.mock(
      "../../../../../../package.json",
      () => ({
        name: "test",
      }),
      {virtual: true},
    );
    const patchAppDelegate = require("../setup/patches/patch").default;
    const result = await patchAppDelegate("objectivec", "test", {
      bridgingHeader: "MyProductModuleName-Swift.h",
    });

    expect(result).toBe(true);
    const afterPatch = fs.readFileSync(patchPath);
    const mockWithEmbrace = fs.readFileSync(
      "./packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithEmbrace.mm",
    );
    expect(afterPatch.toString()).toEqual(mockWithEmbrace.toString());

    const {removeEmbraceImportAndStartFromFile} = require("../setup/uninstall");
    const resultUnpatch = removeEmbraceImportAndStartFromFile(
      "objectivec",
      "app123",
    );

    expect(resultUnpatch).toBe(true);
    const afterRemoval = fs.readFileSync(patchPath);
    const mockWithoutEmbrace = fs.readFileSync(
      "./packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithoutEmbrace.mm",
    );
    expect(afterRemoval.toString()).toEqual(mockWithoutEmbrace.toString());
  });

  test("Patch AppDelegate.swift", async () => {
    const originalMockPath =
      "./packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithoutEmbrace.swift";
    const patchPath =
      "./packages/core/scripts/__tests__/tmp/PatchAppDelegate.swift";

    copyMock(originalMockPath, patchPath);

    jest.mock("glob", () => ({
      sync: () => [
        "./packages/core/scripts/__tests__/tmp/PatchAppDelegate.swift",
      ],
    }));
    jest.mock(
      "../../../../../../package.json",
      () => ({
        name: "test",
      }),
      {virtual: true},
    );
    const patchAppDelegate = require("../setup/patches/patch").default;
    const result = await patchAppDelegate("swift", "test", "app123");

    expect(result).toBe(true);
    const afterPatch = fs.readFileSync(patchPath);
    const mockWithEmbrace = fs.readFileSync(
      "./packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithEmbrace.swift",
    );
    expect(afterPatch.toString()).toEqual(mockWithEmbrace.toString());

    const {removeEmbraceImportAndStartFromFile} = require("../setup/uninstall");
    const resultUnpatch = await removeEmbraceImportAndStartFromFile(
      "swift",
      "app123",
    );

    expect(resultUnpatch).toBe(true);
    const afterRemoval = fs.readFileSync(patchPath);
    const mockWithoutEmbrace = fs.readFileSync(
      "./packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithoutEmbrace.swift",
    );
    expect(afterRemoval.toString()).toEqual(mockWithoutEmbrace.toString());
  });

  test("Patch Podfile", async () => {
    copyMock(`${MOCKS}/PodfileWithoutEmbrace`, `${TMP}/PatchPodfileEmbrace`);

    jest.mock("glob", () => ({
      sync: () => ["./packages/core/scripts/__tests__/tmp/PatchPodfileEmbrace"],
    }));

    const {patchPodfile} = require("../setup/ios");

    await runStep(patchPodfile);

    const expected = fs.readFileSync(`${MOCKS}/PodfileWithEmbrace`).toString();
    expect(readTmp("PatchPodfileEmbrace")).toEqual(expected);

    // Re-running the wizard shouldn't duplicate any of it
    await runStep(patchPodfile);

    expect(readTmp("PatchPodfileEmbrace")).toEqual(expected);
  });

  test("Patch Podfile that has nowhere to patch", async () => {
    const contents = "source 'https://cdn.cocoapods.org/'\n";
    writeTmp("PatchPodfileNoAnchors", contents);

    jest.mock("glob", () => ({
      sync: () => [
        "./packages/core/scripts/__tests__/tmp/PatchPodfileNoAnchors",
      ],
    }));

    const {patchPodfile} = require("../setup/ios");

    await runStep(patchPodfile);

    // The wizard reports and moves on rather than throwing, and leaves the Podfile alone
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Could not patch the Podfile"),
    );
    expect(readTmp("PatchPodfileNoAnchors")).toEqual(contents);
  });

  describe("steps that patch the Xcode project", () => {
    test("getIOSProjectName uses the iOS folder name when one is given", async () => {
      answerWizard({[iosProjectFolderName.name]: "CustomFolder"});

      const {getIOSProjectName} = require("../setup/ios");

      expect(await getIOSProjectName(new Wizard())).toBe("CustomFolder");
    });

    test("iosInitializeEmbrace patches an Objective-C AppDelegate and adds a bridging header", async () => {
      setUpApp({project: "hasProductModuleName", appDelegate: "mm"});
      answerWizard();

      const {iosInitializeEmbrace} = requireSetupIos();

      expect(await runStep(iosInitializeEmbrace)).toEqual([true]);

      const appDelegate = readFile(`${APP_FOLDER}/AppDelegate.mm`);
      expect(appDelegate).toContain('#import "MyProductModule-Swift.h"');
      expect(appDelegate).toContain("[EmbraceInitializer start];");

      expect(
        fs.existsSync(`${APP_FOLDER}/EmbraceTestSuite-Bridging-Header.h`),
      ).toBe(true);
      expect(readFile(PROJECT)).toContain(
        'SWIFT_OBJC_BRIDGING_HEADER = "EmbraceTestSuite/EmbraceTestSuite-Bridging-Header.h";',
      );
    });

    test("iosInitializeEmbrace patches a Swift AppDelegate without adding a bridging header", async () => {
      setUpApp({project: "noEmbrace", appDelegate: "swift"});
      answerWizard();

      const {iosInitializeEmbrace} = requireSetupIos();

      expect(await runStep(iosInitializeEmbrace)).toEqual([true]);
      expect(readFile(`${APP_FOLDER}/AppDelegate.swift`)).toEqual(
        readFile(`${MOCKS}/AppDelegateWithEmbrace.swift`),
      );
      expect(
        fs.existsSync(`${APP_FOLDER}/EmbraceTestSuite-Bridging-Header.h`),
      ).toBe(false);
      expect(readFile(PROJECT)).not.toContain("SWIFT_OBJC_BRIDGING_HEADER");
    });

    test("iosInitializeEmbrace reports when there is no AppDelegate to patch", async () => {
      setUpApp({project: "noEmbrace"});
      answerWizard();

      const {iosInitializeEmbrace} = requireSetupIos();

      expect(await runStep(iosInitializeEmbrace)).toEqual([false]);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("The file to be patched not found"),
      );
    });

    test("patchXcodeBundlePhase exports the source map from the bundle phase", async () => {
      setUpApp({project: "noEmbrace"});
      answerWizard();

      const {patchXcodeBundlePhase} = requireSetupIos();

      await runStep(patchXcodeBundlePhase);

      expect((await shellScripts(PROJECT))[BUNDLE_PHASE]).toEqual(
        (await shellScripts(EMBRACE_PROJECT))[BUNDLE_PHASE],
      );
    });

    test("patchXcodeBundlePhase leaves an already patched bundle phase alone", async () => {
      setUpApp({project: "testMock"});
      answerWizard();
      const original = readFile(PROJECT);

      const {patchXcodeBundlePhase} = requireSetupIos();

      await runStep(patchXcodeBundlePhase);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "Already patched Xcode React Native bundle phase",
        ),
      );
      expect(readFile(PROJECT)).toEqual(original);
    });

    test("patchXcodeBundlePhase reports a project without a React Native bundle phase", async () => {
      setUpApp({project: "noEmbrace"});
      fs.writeFileSync(
        PROJECT,
        readFile(PROJECT).replace("react-native-xcode.sh", "bundle.sh"),
      );
      answerWizard();
      const original = readFile(PROJECT);

      const {patchXcodeBundlePhase} = requireSetupIos();

      await runStep(patchXcodeBundlePhase);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(
          "Could not find Xcode React Native bundle phase",
        ),
      );
      expect(readFile(PROJECT)).toEqual(original);
    });

    test("addUploadBuildPhase adds the upload phase to the app target", async () => {
      setUpApp({project: "noEmbrace"});
      answerWizard();

      const {addUploadBuildPhase} = requireSetupIos();

      await runStep(addUploadBuildPhase);

      expect((await shellScripts(PROJECT))[UPLOAD_SYMBOLS_PHASE]).toEqual(
        (await shellScripts(EMBRACE_PROJECT))[UPLOAD_SYMBOLS_PHASE],
      );
      expect(await targetBuildPhases("EmbraceTestSuite")).toContain(
        UPLOAD_SYMBOLS_PHASE,
      );
      expect(await targetBuildPhases("EmbraceTestSuiteTests")).not.toContain(
        UPLOAD_SYMBOLS_PHASE,
      );
    });

    test("addUploadBuildPhase does not add a second upload phase", async () => {
      setUpApp({project: "testMock"});
      answerWizard();
      const original = readFile(PROJECT);

      const {addUploadBuildPhase} = requireSetupIos();

      await runStep(addUploadBuildPhase);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          `Already added '${UPLOAD_SYMBOLS_PHASE}' phase`,
        ),
      );
      expect(readFile(PROJECT)).toEqual(original);
    });

    test("addEmbraceInitializerSwift writes the initializer and adds it to the app target", async () => {
      setUpApp({project: "noEmbrace"});
      answerWizard();

      const {addEmbraceInitializerSwift} = requireSetupIos();

      await runStep(addEmbraceInitializerSwift);

      expect(readFile(`${APP_FOLDER}/EmbraceInitializer.swift`)).toEqual(
        readFile(`${MOCKS}/EmbraceInitializer.swift`),
      );
      expect(await targetSources("EmbraceTestSuite")).toContain(
        "EmbraceInitializer.swift in Sources",
      );
      expect(readFile(PROJECT)).toContain(
        'path = "EmbraceTestSuite/EmbraceInitializer.swift"',
      );
    });
  });
});
