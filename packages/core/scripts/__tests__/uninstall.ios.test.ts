import {EMBRACE_IMPORT_OBJECTIVEC, EMBRACE_INIT_OBJECTIVEC} from "../util/ios";
import {
  EMBRACE_IMPORT_OBJECTIVEC_5X,
  EMBRACE_IMPORT_SWIFT_5X,
  EMBRACE_INIT_OBJECTIVEC_5X,
  EMBRACE_INIT_SWIFT_5X,
} from "../setup/patches/patch_ios_5x";
import {EMBRACE_IMPORT_SWIFT, EMBRACE_INIT_SWIFT} from "../setup/patches/patch";

const fs = require("fs");

jest.useFakeTimers();

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
    jest.mock("glob", () => ({
      sync: () => [
        "./packages/core/scripts/__tests__/__mocks__/ios/testMock.xcodeproj/project.pbxproj",
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

    expect(!!xcode.findPhase("EmbraceIO")).toBe(true);
    expect(!!xcode.findPhase("SOURCEMAP_FILE")).toBe(true);

    const {removeEmbraceFromXcode} = require("../setup/uninstall");

    const result = await removeEmbraceFromXcode();
    expect(result.project.includes("EmbraceIO")).toBe(false);
    expect(result.project.includes("SOURCEMAP_FILE")).toBe(false);

    xcode.sync();
    xcode.patch();

    const xcodeAfterPatch = await xcodePatchable(packageJsonMock);

    expect(!!xcodeAfterPatch.findPhase("EmbraceIO")).toBe(true);
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
    const appDelegate = await getAppDelegateByIOSLanguage(
      "test",
      "objectivec",
      "app123",
    );

    const initLines = EMBRACE_INIT_OBJECTIVEC({appId: "app123"});
    expect(appDelegate.contents.includes(EMBRACE_IMPORT_OBJECTIVEC)).toBe(true);
    initLines.forEach(line => {
      expect(appDelegate.contents.includes(line)).toBe(true);
    });

    const {removeEmbraceImportAndStartFromFile} = require("../setup/uninstall");
    const resultUnpatch = removeEmbraceImportAndStartFromFile(
      "objectivec",
      "app123",
    );

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
    const appDelegate = await getAppDelegateByIOSLanguage(
      "test",
      "swift",
      "app123",
    );

    const initLines = EMBRACE_INIT_SWIFT({appId: "app123"});
    expect(appDelegate.contents.includes(EMBRACE_IMPORT_SWIFT)).toBe(true);
    initLines.forEach(line => {
      expect(appDelegate.contents.includes(line)).toBe(true);
    });

    const {removeEmbraceImportAndStartFromFile} = require("../setup/uninstall");
    const resultUnpatch = removeEmbraceImportAndStartFromFile(
      "swift",
      "app123",
    );

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
    const appDelegate = await getAppDelegateByIOSLanguage(
      "test",
      "objectivec",
      "app123",
    );

    expect(appDelegate.contents.includes(EMBRACE_IMPORT_OBJECTIVEC_5X)).toBe(
      true,
    );
    expect(appDelegate.contents.includes(EMBRACE_INIT_OBJECTIVEC_5X)).toBe(
      true,
    );

    const {removeEmbraceImportAndStartFromFile} = require("../setup/uninstall");
    const resultUnpatch = removeEmbraceImportAndStartFromFile(
      "objectivec5x",
      "app123",
    );

    expect(resultUnpatch).toBe(true);
    const afterRemoval = fs.readFileSync(unlinkedPath);
    const mockWithoutEmbrace = fs.readFileSync(
      "./packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithoutEmbrace.mm",
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
    const appDelegate = await getAppDelegateByIOSLanguage(
      "test",
      "swift5x",
      "app123",
    );

    expect(appDelegate.contents.includes(EMBRACE_IMPORT_SWIFT_5X)).toBe(true);
    expect(appDelegate.contents.includes(EMBRACE_INIT_SWIFT_5X)).toBe(true);

    const {removeEmbraceImportAndStartFromFile} = require("../setup/uninstall");
    const resultUnpatch = removeEmbraceImportAndStartFromFile(
      "swift5x",
      "app123",
    );

    expect(resultUnpatch).toBe(true);
    const afterRemoval = fs.readFileSync(unlinkedPath);
    const mockWithoutEmbrace = fs.readFileSync(
      "./packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithoutEmbrace.swift",
    );
    expect(afterRemoval.toString()).toEqual(mockWithoutEmbrace.toString());
  });
});
