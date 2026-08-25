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

// setup/uninstall requires package.json at module scope, so loading it needs this
jest.mock("../../../../../../package.json", () => ({name: "test"}), {
  virtual: true,
});

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

const TMP = "./packages/core/scripts/__tests__/tmp";
const MOCKS = "./packages/core/scripts/__tests__/__mocks__/ios";

const copyMock = (from: string, to: string) => {
  if (!fs.existsSync(TMP)) {
    fs.mkdirSync(TMP);
  }
  fs.copyFileSync(from, to);
};

const readTmp = (name: string) => fs.readFileSync(`${TMP}/${name}`).toString();

describe("Uninstall Script iOS", () => {
  jest
    .spyOn(Wizard.prototype, "fieldValueList")
    .mockResolvedValueOnce(["t3st4", {name: "io.embrace.testapp"}]);

  test("Remove the Embrace patches from Podfile", async () => {
    copyMock(`${MOCKS}/PodfileWithEmbrace`, `${TMP}/UnpatchPodfilePatches`);

    jest.mock("glob", () => ({
      sync: () => [
        "./packages/core/scripts/__tests__/tmp/UnpatchPodfilePatches",
      ],
    }));

    const {removeEmbraceLinkFromFile} = require("../setup/uninstall");

    expect(await removeEmbraceLinkFromFile("podfilePatches")).toBe(true);

    // Removal is an exact inverse of the install patches
    expect(readTmp("UnpatchPodfilePatches")).toEqual(
      fs.readFileSync(`${MOCKS}/PodfileWithoutEmbrace`).toString(),
    );
  });

  test("Remove the Embrace patches from a Podfile that has none", async () => {
    copyMock(`${MOCKS}/PodfileWithoutEmbrace`, `${TMP}/UnpatchPodfileClean`);

    jest.mock("glob", () => ({
      sync: () => ["./packages/core/scripts/__tests__/tmp/UnpatchPodfileClean"],
    }));

    const {removeEmbraceLinkFromFile} = require("../setup/uninstall");

    // Reports that there was nothing to do rather than rewriting the file regardless
    expect(await removeEmbraceLinkFromFile("podfilePatches")).toBe(false);
    expect(readTmp("UnpatchPodfileClean")).toEqual(
      fs.readFileSync(`${MOCKS}/PodfileWithoutEmbrace`).toString(),
    );
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
    const {removeEmbraceImportAndStartFromFile} = require("../setup/uninstall");

    const crash = jest.fn();
    try {
      await removeEmbraceImportAndStartFromFile("objectivec");
    } catch (_) {
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
    const {removeEmbraceImportAndStartFromFile} = require("../setup/uninstall");

    const crash = jest.fn();
    try {
      await removeEmbraceImportAndStartFromFile("swift");
    } catch (_) {
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
