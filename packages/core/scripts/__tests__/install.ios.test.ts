import Wizard, {type Step} from "../util/wizard";

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
});
