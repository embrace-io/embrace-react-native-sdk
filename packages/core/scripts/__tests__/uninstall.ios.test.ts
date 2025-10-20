import Wizard from "../util/wizard";
import {
  EMBR_RUN_SCRIPT,
  EMBRACE_IMPORT_OBJECTIVEC,
  EMBRACE_INIT_OBJECTIVEC,
} from "../util/ios";
import {
  EMBRACE_IMPORT_OBJECTIVEC_5X,
  EMBRACE_IMPORT_SWIFT_5X,
  EMBRACE_INIT_OBJECTIVEC_5X,
  EMBRACE_INIT_SWIFT_5X,
} from "../setup/patches/patch_ios_5x";
import {EMBRACE_INIT_SWIFT} from "../setup/patches/patch";

const fs = require("fs");

jest.useFakeTimers();

// avoiding real logs in unit tests
beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

const copyMock = (from: string, to: string) => {
  const dir = "./packages/core/scripts/__tests__/tmp/";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  fs.copyFile(from, to, () => {});
};

describe("Uninstall Script iOS", () => {
  jest
    .spyOn(Wizard.prototype, "fieldValueList")
    .mockResolvedValueOnce(["t3st4", {name: "io.embrace.testapp"}]);

  test("Remove Embrace From Podfile", async () => {
    jest.mock("glob", () => ({
      sync: () => ["./packages/core/scripts/__tests__/__mocks__/ios/Podfile"],
    }));

    jest.mock("semver/functions/gte", () => () => false);
    jest.mock(
      "../../../../../../package.json",
      () => ({
        name: "test",
      }),
      {virtual: true},
    );
    const {removeEmbraceLinkFromFile} = require("../setup/uninstall");

    const resultUnpatch = await removeEmbraceLinkFromFile("podFileImport");

    expect(resultUnpatch).toBe(true);

    const {patchPodfile} = require("../setup/ios");
    const mockPackageJson = {
      name: "Test",
      dependencies: {
        "react-native": "0.0.0",
      },
    };

    await patchPodfile(mockPackageJson);
  });

  test("Remove Embrace From Xcode", async () => {
    const tmp = "./packages/core/scripts/__tests__/tmp/";
    const xcodeProj = `${tmp}/removeTest.xcodeproj`;

    fs.existsSync(xcodeProj) && fs.rmdirSync(xcodeProj, {recursive: true});
    fs.mkdirSync(xcodeProj, {recursive: true});

    fs.copyFileSync(
      "./packages/core/scripts/__tests__/__mocks__/ios/testMock.xcodeproj/project.pbxproj",
      `${xcodeProj}/project.pbxproj`,
    );

    jest.mock("glob", () => ({
      sync: () => [
        "./packages/core/scripts/__tests__/tmp/removeTest.xcodeproj/project.pbxproj",
      ],
    }));

    jest.mock(
      "../../../../../../package.json",
      () => ({
        name: "testMock",
      }),
      {
        virtual: true,
      },
    );
    const {xcodePatchable} = require("../util/ios");
    const packageJsonMock = {
      name: "testMock",
    };

    const xcode = await xcodePatchable(packageJsonMock);

    expect(!!xcode.findPhase(EMBR_RUN_SCRIPT)).toBe(true);
    expect(!!xcode.findPhase("SOURCEMAP_FILE")).toBe(true);

    const {removeEmbraceFromXcode} = require("../setup/uninstall");

    const wizard = new Wizard();
    const result = await removeEmbraceFromXcode(wizard);
    expect(result.includes(EMBR_RUN_SCRIPT)).toBe(false);
    expect(result.includes("SOURCEMAP_FILE")).toBe(false);

    xcode.patch();

    const xcodeAfterPatch = await xcodePatchable(packageJsonMock);

    expect(!!xcodeAfterPatch.findPhase(EMBR_RUN_SCRIPT)).toBe(true);
    expect(!!xcodeAfterPatch.findPhase("SOURCEMAP_FILE")).toBe(true);
  });

  test("Unlink Embrace From AppDelegate.mm - TEST FAILS", async () => {
    jest.mock("glob", () => ({
      sync: () => [
        "./packages/core/scripts/__tests__/__mocks__/ios/NoAppDelegate.mm",
      ],
    }));
    jest.mock(
      "../../../../../../package.json",
      () => ({
        name: "test",
      }),
      {virtual: true},
    );
    const {removeEmbraceImportAndStartFromFile} = require("../setup/uninstall");

    const crash = jest.fn();
    try {
      await removeEmbraceImportAndStartFromFile("objectivec");
    } catch (e) {
      crash();
    }

    expect(crash).toHaveBeenCalled();
  });
  test("Unlink Embrace From AppDelegate.swift - TEST FAILS", async () => {
    jest.mock("glob", () => ({
      sync: () => [
        "./packages/core/scripts/__tests__/__mocks__/ios/NoAppDelegate.swift",
      ],
    }));
    jest.mock(
      "../../../../../../package.json",
      () => ({
        name: "test",
      }),
      {virtual: true},
    );
    const {removeEmbraceImportAndStartFromFile} = require("../setup/uninstall");

    const crash = jest.fn();
    try {
      await removeEmbraceImportAndStartFromFile("swift");
    } catch (e) {
      crash();
    }

    expect(crash).toHaveBeenCalled();
  });

  test("Unlink Embrace From AppDelegate.mm", async () => {
    const originalMockPath =
      "./packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithEmbrace.mm";
    const unlinkedPath =
      "./packages/core/scripts/__tests__/tmp/UnlinkedAppDelegate.mm";

    copyMock(originalMockPath, unlinkedPath);

    jest.mock("glob", () => ({
      sync: () => [
        "./packages/core/scripts/__tests__/tmp/UnlinkedAppDelegate.mm",
      ],
    }));
    jest.mock(
      "../../../../../../package.json",
      () => ({
        name: "test",
      }),
      {virtual: true},
    );
    const {getAppDelegateByIOSLanguage} = require("../util/ios");
    const appDelegate = await getAppDelegateByIOSLanguage("test", "objectivec");

    expect(appDelegate.contents.includes(EMBRACE_INIT_OBJECTIVEC)).toBe(true);
    expect(
      appDelegate.contents.includes(
        EMBRACE_IMPORT_OBJECTIVEC({
          bridgingHeader: "MyProductModuleName-Swift.h",
        }),
      ),
    ).toBe(true);

    const {removeEmbraceImportAndStartFromFile} = require("../setup/uninstall");
    const resultUnpatch = removeEmbraceImportAndStartFromFile("objectivec");

    expect(resultUnpatch).toBe(true);
    const afterRemoval = fs.readFileSync(unlinkedPath);
    const mockWithoutEmbrace = fs.readFileSync(
      "./packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithoutEmbrace.mm",
    );
    expect(afterRemoval.toString()).toEqual(mockWithoutEmbrace.toString());
  });

  test("Unlink Embrace From AppDelegate.swift", async () => {
    const originalMockPath =
      "./packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithEmbrace.swift";
    const unlinkedPath =
      "./packages/core/scripts/__tests__/tmp/UnlinkedAppDelegate.swift";

    copyMock(originalMockPath, unlinkedPath);

    jest.mock("glob", () => ({
      sync: () => [
        "./packages/core/scripts/__tests__/tmp/UnlinkedAppDelegate.swift",
      ],
    }));
    jest.mock(
      "../../../../../../package.json",
      () => ({
        name: "test",
      }),
      {virtual: true},
    );
    const {getAppDelegateByIOSLanguage} = require("../util/ios");
    const appDelegate = await getAppDelegateByIOSLanguage("test", "swift");

    expect(appDelegate.contents.includes(EMBRACE_INIT_SWIFT)).toBe(true);

    const {removeEmbraceImportAndStartFromFile} = require("../setup/uninstall");
    const resultUnpatch = removeEmbraceImportAndStartFromFile("swift");

    expect(resultUnpatch).toBe(true);
    const afterRemoval = fs.readFileSync(unlinkedPath);
    const mockWithoutEmbrace = fs.readFileSync(
      "./packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithoutEmbrace.swift",
    );
    expect(afterRemoval.toString()).toEqual(mockWithoutEmbrace.toString());
  });

  test("Unlink Embrace From AppDelegate5x.mm", async () => {
    const originalMockPath =
      "./packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithEmbrace5x.mm";
    const unlinkedPath =
      "./packages/core/scripts/__tests__/tmp/UnlinkedAppDelegate5x.mm";

    copyMock(originalMockPath, unlinkedPath);

    jest.mock("glob", () => ({
      sync: () => [
        "./packages/core/scripts/__tests__/tmp/UnlinkedAppDelegate5x.mm",
      ],
    }));
    jest.mock(
      "../../../../../../package.json",
      () => ({
        name: "test",
      }),
      {virtual: true},
    );
    const {getAppDelegateByIOSLanguage} = require("../util/ios");
    const appDelegate = await getAppDelegateByIOSLanguage("test", "objectivec");

    expect(appDelegate.contents.includes(EMBRACE_IMPORT_OBJECTIVEC_5X)).toBe(
      true,
    );
    expect(appDelegate.contents.includes(EMBRACE_INIT_OBJECTIVEC_5X)).toBe(
      true,
    );

    const {removeEmbraceImportAndStartFromFile} = require("../setup/uninstall");
    const resultUnpatch = removeEmbraceImportAndStartFromFile("objectivec5x");

    expect(resultUnpatch).toBe(true);
    const afterRemoval = fs.readFileSync(unlinkedPath);
    const mockWithoutEmbrace = fs.readFileSync(
      "./packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithoutEmbrace5x.mm",
    );
    expect(afterRemoval.toString()).toEqual(mockWithoutEmbrace.toString());
  });

  test("Unlink Embrace From AppDelegate5x.swift", async () => {
    const originalMockPath =
      "./packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithEmbrace5x.swift";
    const unlinkedPath =
      "./packages/core/scripts/__tests__/tmp/UnlinkedAppDelegate5x.swift";

    copyMock(originalMockPath, unlinkedPath);

    jest.mock("glob", () => ({
      sync: () => [
        "./packages/core/scripts/__tests__/tmp/UnlinkedAppDelegate5x.swift",
      ],
    }));
    jest.mock(
      "../../../../../../package.json",
      () => ({
        name: "test",
      }),
      {virtual: true},
    );
    const {getAppDelegateByIOSLanguage} = require("../util/ios");
    const appDelegate = await getAppDelegateByIOSLanguage("test", "swift5x");

    expect(appDelegate.contents.includes(EMBRACE_IMPORT_SWIFT_5X)).toBe(true);
    expect(appDelegate.contents.includes(EMBRACE_INIT_SWIFT_5X)).toBe(true);

    const {removeEmbraceImportAndStartFromFile} = require("../setup/uninstall");
    const resultUnpatch = removeEmbraceImportAndStartFromFile("swift5x");

    expect(resultUnpatch).toBe(true);
    const afterRemoval = fs.readFileSync(unlinkedPath);
    const mockWithoutEmbrace = fs.readFileSync(
      "./packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithoutEmbrace.swift",
    );
    expect(afterRemoval.toString()).toEqual(mockWithoutEmbrace.toString());
  });
});
