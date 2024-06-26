import Wizard from "../util/wizard";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

const androidEmbraceSwazzler = new RegExp(
  /\s*classpath(\(|\s)('|")io\.embrace:embrace-swazzler:.*('|")\)?/,
  "m",
);

describe("Modify Build Gradle", () => {
  test("Add Android Swazzler Version If Build Does Not Have Swazzler Version", async () => {
    jest.mock("path", () => ({
      join: () =>
        "./packages/core/scripts/__tests__/__mocks__/buildWithoutSwazzler.gradle",
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
    } catch {
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
        "./packages/core/scripts/__tests__/__mocks__/noExistbuild.gradle",
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
