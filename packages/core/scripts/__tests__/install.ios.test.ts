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
    jest.mock("glob", () => ({
      sync: () => [
        "./packages/core/scripts/__tests__/__mocks__/ios/PodfileWithoutEmbrace",
      ],
    }));
    jest.mock("semver/functions/gte", () => () => false);

    const {patchPodfile} = require("../setup/ios");
    const mockPackageJson = {
      name: "Test",
      dependencies: {
        "react-native": "0.0.0",
      },
    };
    await patchPodfile(mockPackageJson);

    const {removeEmbraceLinkFromFile} = require("../setup/uninstall");

    const resultUnpatch = await removeEmbraceLinkFromFile("podFileImport");

    expect(resultUnpatch).toBe(true);
  });
});
