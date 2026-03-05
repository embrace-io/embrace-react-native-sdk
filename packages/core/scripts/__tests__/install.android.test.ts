import Wizard from "../util/wizard";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

const androidEmbraceGradlePlugin = new RegExp(
  /\s*classpath(\(|\s)('|")io\.embrace:embrace-gradle-plugin:.*('|")\)?/,
  "m",
);

describe("Modify Build Gradle", () => {
  test("Add Android Gradle Plugin Version If Build Does Not Have It", async () => {
    jest.mock("path", () => ({
      join: () =>
        "./packages/core/scripts/__tests__/__mocks__/android/buildWithoutGradlePlugin.gradle",
    }));
    const androidUtil = require("../util/android");
    const {patchBuildGradle} = require("../setup/android");

    // Confirm the file does not have the gradle plugin line to begin with
    const originalFile = await androidUtil.buildGradlePatchable();
    expect(originalFile.hasLine(androidEmbraceGradlePlugin)).toBe(false);

    const wiz = new Wizard();
    const androidSteps = [patchBuildGradle];

    [...androidSteps].map(step => wiz.registerStep(step));
    let failed = 0;
    try {
      await wiz.processSteps();
    } catch (e) {
      failed = 1;
    }
    expect(failed).toBe(0);

    const fileUpdated = await androidUtil.buildGradlePatchable();
    expect(fileUpdated.hasLine(androidEmbraceGradlePlugin)).toBe(true);

    // Deleting gradle plugin added to the mock
    const file = await androidUtil.buildGradlePatchable();
    file.deleteLine(androidEmbraceGradlePlugin);
    file.patch();
    expect(file.hasLine(androidEmbraceGradlePlugin)).toBe(false);
  });
  test("Couldnt Update Android Gradle Plugin Version", async () => {
    jest.mock("path", () => ({
      join: () =>
        "./packages/core/scripts/__tests__/__mocks__/android/noExistbuild.gradle",
    }));
    const wiz = new Wizard();
    const {patchBuildGradle} = require("../setup/android");

    const androidSteps = [patchBuildGradle];
    [...androidSteps].map(step => wiz.registerStep(step));
    let failed = 0;
    try {
      await wiz.processSteps();
    } catch {
      failed = 1;
    }
    expect(failed).toBe(1);
  });
});

describe("Patch Android", () => {
  test("Add Android java import", async () => {
    jest.mock("path", () => ({
      join: () => "./packages/core/scripts/__tests__/__mocks__/android",
    }));
    jest.mock(
      "../../../../../../package.json",
      () => ({
        name: "test",
      }),
      {virtual: true},
    );
    const patchMainApplication = require("../setup/patches/patch").default;
    const result = await patchMainApplication("java");

    expect(result).toBe(true);

    const {removeEmbraceImportAndStartFromFile} = require("../setup/uninstall");

    const resultUnpatch = await removeEmbraceImportAndStartFromFile("java");

    expect(resultUnpatch).toBe(true);
  });
  test("Add Android Kotlin import", async () => {
    jest.mock("path", () => ({
      join: () => "./packages/core/scripts/__tests__/__mocks__/android",
    }));
    jest.mock(
      "../../../../../../package.json",
      () => ({
        name: "test",
      }),
      {virtual: true},
    );
    const patchMainApplication = require("../setup/patches/patch").default;
    const result = await patchMainApplication("kotlin");

    expect(result).toBe(true);

    const {removeEmbraceImportAndStartFromFile} = require("../setup/uninstall");

    const resultUnpatch = await removeEmbraceImportAndStartFromFile("kotlin");

    expect(resultUnpatch).toBe(true);
  });
});
