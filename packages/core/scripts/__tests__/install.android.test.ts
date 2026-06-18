import Wizard from "../util/wizard";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

const androidEmbraceSwazzler = new RegExp(
  /\s*classpath(\(|\s)('|")io\.embrace:embrace-gradle-plugin:.*('|")\)?/,
  "m",
);

describe("Modify Build Gradle", () => {
  test("Add Android Swazzler Version If Build Does Not Have Swazzler Version", async () => {
    jest.mock("path", () => ({
      join: () =>
        "./packages/core/scripts/__tests__/__mocks__/android/buildWithoutSwazzler.gradle",
    }));
    const androidUtil = require("../util/android");
    const {patchBuildGradle} = require("../setup/android");

    // Confirm the file does not have the swazzler line to begin with
    const originalFile = await androidUtil.buildGradlePatchable();
    expect(originalFile.hasLine(androidEmbraceSwazzler)).toBe(false);

    const wiz = new Wizard();
    const androidSteps = [patchBuildGradle];

    [...androidSteps].map(step => wiz.registerStep(step));
    let failed = 0;
    try {
      await wiz.processSteps();
    } catch (_) {
      failed = 1;
    }
    expect(failed).toBe(0);

    const fileUpdated = await androidUtil.buildGradlePatchable();
    expect(fileUpdated.hasLine(androidEmbraceSwazzler)).toBe(true);

    // Deleting swazzler added to the mock
    const file = await androidUtil.buildGradlePatchable();
    file.deleteLine(androidEmbraceSwazzler);
    file.patch();
    expect(file.hasLine(androidEmbraceSwazzler)).toBe(false);
  });
  test("Couldnt Update Android Swazzler Version", async () => {
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

describe("Migrate legacy embrace-swazzler plugin name", () => {
  test("Replaces the legacy embrace-swazzler classpath in build.gradle", async () => {
    jest.mock("path", () => ({
      join: () =>
        "./packages/core/scripts/__tests__/__mocks__/android/buildWithLegacySwazzler.gradle",
    }));
    const androidUtil = require("../util/android");
    const {
      patchBuildGradle,
      androidEmbraceLegacySwazzler,
    } = require("../setup/android");

    // Confirm the fixture starts with the legacy classpath
    const originalFile = await androidUtil.buildGradlePatchable();
    expect(originalFile.hasLine(androidEmbraceLegacySwazzler)).toBe(true);

    const wiz = new Wizard();
    [patchBuildGradle].map(step => wiz.registerStep(step));
    await wiz.processSteps();

    const fileUpdated = await androidUtil.buildGradlePatchable();
    expect(fileUpdated.hasLine(androidEmbraceSwazzler)).toBe(true);
    expect(fileUpdated.hasLine(androidEmbraceLegacySwazzler)).toBe(false);

    // Restore the fixture to its legacy state
    const restore = await androidUtil.buildGradlePatchable();
    restore.contents = restore.contents.replace(
      "embrace-gradle-plugin",
      "embrace-swazzler",
    );
    restore.patch();
  });

  test("Replaces the legacy embrace-swazzler apply line in app/build.gradle", async () => {
    jest.mock("path", () => ({
      join: () =>
        "./packages/core/scripts/__tests__/__mocks__/android/appBuildWithLegacySwazzler.gradle",
    }));
    const androidUtil = require("../util/android");
    const {
      patchAppBuildGradle,
      androidEmbraceSwazzlerPluginRE,
      androidEmbraceLegacyPluginRE,
    } = require("../setup/android");

    // Confirm the fixture starts with the legacy apply line
    const originalFile = await androidUtil.buildAppGradlePatchable();
    expect(originalFile.hasLine(androidEmbraceLegacyPluginRE)).toBe(true);

    const wiz = new Wizard();
    [patchAppBuildGradle].map(step => wiz.registerStep(step));
    await wiz.processSteps();

    const fileUpdated = await androidUtil.buildAppGradlePatchable();
    expect(fileUpdated.hasLine(androidEmbraceSwazzlerPluginRE)).toBe(true);
    expect(fileUpdated.hasLine(androidEmbraceLegacyPluginRE)).toBe(false);

    // Restore the fixture to its legacy state
    const restore = await androidUtil.buildAppGradlePatchable();
    restore.contents = restore.contents.replace(
      "embrace-gradle-plugin",
      "embrace-swazzler",
    );
    restore.patch();
  });
});
