import {
  EMBRACE_IMPORT_JAVA,
  EMBRACE_INIT_JAVA,
} from '../setup/patches/android/patch.java';
import Wizard from '../util/wizard';

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

const androidEmbraceSwazzler =
  /classpath(\(|\s)('|")io\.embrace:embrace-swazzler:.*('|")\)?/;

describe('Modify Build Gradle', () => {
  test('Add Android Swazzler Version If Build Does Not Have Swazzler Version', async () => {
    jest.mock('path', () => ({
      join: () =>
        './packages/core/scripts/__tests__/__mocks__/android/buildWithoutSwazzler.gradle',
    }));
    const androidUtil = require('../util/android');
    const { patchBuildGradle } = require('../setup/android');

    const wiz = new Wizard();
    const androidSteps = [patchBuildGradle];

    [...androidSteps].map((step) => wiz.registerStep(step));
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
  test('Update Android Swazzler Version', async () => {
    jest.mock('path', () => ({
      join: () =>
        './packages/core/scripts/__tests__/__mocks__/android/buildWithoutSwazzler.gradle',
    }));
    const wiz = new Wizard();
    const { patchBuildGradle } = require('../setup/android');

    const androidSteps = [patchBuildGradle];
    [...androidSteps].map((step) => wiz.registerStep(step));
    let failed = 0;
    try {
      await wiz.processSteps();
    } catch (e) {
      console.log('WE', e);
      failed = 1;
    }
    expect(failed).toBe(0);
  });
  test('Couldnt Update Android Swazzler Version', async () => {
    jest.mock('path', () => ({
      join: () =>
        './packages/core/scripts/__tests__/__mocks__/android/noExistbuild.gradle',
    }));
    const wiz = new Wizard();
    const { patchBuildGradle } = require('../setup/android');

    const androidSteps = [patchBuildGradle];
    [...androidSteps].map((step) => wiz.registerStep(step));
    let failed = 0;
    try {
      await wiz.processSteps();
    } catch {
      failed = 1;
    }
    expect(failed).toBe(1);
  });
});

describe('Patch Android', () => {
  test('Add Android java import', async () => {
    jest.mock('path', () => ({
      join: () => './packages/core/scripts/__tests__/__mocks__/android',
    }));

    const patchJavaMainApplication =
      require('../setup/patches/android/patch.java').default;
    const result = await patchJavaMainApplication();

    expect(result).toBe(true);

    const { unlinkJava } = require('../setup/patches/android/unlink.java');

    const revert = await unlinkJava('test');
    expect(revert.contents.includes(EMBRACE_IMPORT_JAVA)).toBe(false);
    expect(revert.contents.includes(EMBRACE_INIT_JAVA)).toBe(false);
    revert.patch();
  });
  test('Add Android Kotlin import', async () => {
    jest.mock('path', () => ({
      join: () => './packages/core/scripts/__tests__/__mocks__/android',
    }));

    const patchKotlinMainApplication =
      require('../setup/patches/android/patch.kotlin').default;
    const result = await patchKotlinMainApplication();

    expect(result).toBe(true);

    const { unlinkKotlin } = require('../setup/patches/android/unlink.kotlin');

    const revert = await unlinkKotlin('test');
    expect(revert.contents.includes(EMBRACE_IMPORT_JAVA)).toBe(false);
    expect(revert.contents.includes(EMBRACE_INIT_JAVA)).toBe(false);
    revert.patch();
  });
});
