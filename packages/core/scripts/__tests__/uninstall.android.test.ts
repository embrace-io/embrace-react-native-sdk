const fs = require('fs');
const path = require('path');
import {
  androidEmbraceSwazzler,
  androidEmbraceSwazzlerPluginRE,
} from '../setup/android';
import {
  EMBRACE_IMPORT_JAVA,
  EMBRACE_INIT_JAVA,
} from '../setup/patches/android/patch.java';
import {
  EMBRACE_IMPORT_KOTLIN,
  EMBRACE_INIT_KOTLIN,
} from '../setup/patches/android/patch.kotlin';

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

describe('Uninstall Script Android', () => {
  test('Remove Android Swazzler Dependency', async () => {
    jest.mock('path', () => ({
      join: () =>
        './packages/core/scripts/__tests__/__mocks__/android/buildWithSwazzler.gradle',
    }));
    const androidUninstaller = require('../postunlink/android');
    const result = await androidUninstaller.unlinkSwazzlerImport();

    expect(androidEmbraceSwazzler.test(result.contents)).toBe(false);
  });
  test('Remove Android Swazzler Apply', async () => {
    jest.mock('path', () => ({
      join: () =>
        './packages/core/scripts/__tests__/__mocks__/android/appBuildWithSwazzler.gradle',
    }));
    const androidUninstaller = require('../postunlink/android');
    const result = await androidUninstaller.unlinkSwazzlerApply();

    expect(androidEmbraceSwazzlerPluginRE.test(result.contents)).toBe(false);
  });
  test('Remove Android Swazzler Apply', async () => {
    jest.mock('path', () => ({
      join: () =>
        './packages/core/scripts/__tests__/__mocks__/android/embrace-config.json',
    }));
    const p = path.join(
      'packages/core/scripts/__tests__/__mocks__/android/embrace-config.json'
    );
    if (!fs.existsSync(p)) {
      fs.closeSync(fs.openSync(p, 'a'));
    }

    expect(fs.existsSync(p)).toBe(true);

    const androidUninstaller = require('../postunlink/android');
    await androidUninstaller.removeEmbraceConfigFile();

    expect(fs.existsSync(p)).toBe(false);
  });
  test('Unlink Embrace From MainApplication.java', async () => {
    jest.mock('path', () => ({
      join: () => './packages/core/scripts/__tests__/__mocks__/',
    }));

    const { mainApplicationPatchable } = require('../util/android');
    const mainApplication = await mainApplicationPatchable('java');

    expect(mainApplication.contents.includes(EMBRACE_IMPORT_JAVA)).toBe(true);
    expect(mainApplication.contents.includes(EMBRACE_INIT_JAVA)).toBe(true);

    const { unlinkJava } = require('../setup/patches/android/unlink.java');

    const result = await unlinkJava('test');
    expect(result.contents.includes(EMBRACE_IMPORT_JAVA)).toBe(false);
    expect(result.contents.includes(EMBRACE_INIT_JAVA)).toBe(false);
  });
  test('Unlink Embrace From MainApplication.kt', async () => {
    jest.mock('path', () => ({
      join: () => './packages/core/scripts/__tests__/__mocks__/',
    }));

    const { mainApplicationPatchable } = require('../util/android');
    const mainApplication = await mainApplicationPatchable('kotlin');

    expect(mainApplication.contents.includes(EMBRACE_IMPORT_KOTLIN)).toBe(true);
    expect(mainApplication.contents.includes(EMBRACE_INIT_KOTLIN)).toBe(true);

    const { unlinkKotlin } = require('../setup/patches/android/unlink.kotlin');
    const result = await unlinkKotlin('test');
    expect(result.contents.includes(EMBRACE_IMPORT_KOTLIN)).toBe(false);
    expect(result.contents.includes(EMBRACE_INIT_KOTLIN)).toBe(false);
  });
  test('Unlink Embrace From MainApplication.java - TEST FAILS', async () => {
    jest.mock('path', () => ({
      join: () => './packages/core/scripts/__tests__/__mocks__/android',
    }));
    const { unlinkJava } = require('../setup/patches/android/unlink.java');

    const failed = jest.fn();
    await unlinkJava('test').catch(failed);
    expect(failed).toBeCalled();
  });
  test('Unlink Embrace From MainApplication.kt - TEST FAILS', async () => {
    jest.mock('path', () => ({
      join: () => './packages/core/scripts/__tests__/__mocks__/android',
    }));
    const { unlinkKotlin } = require('../setup/patches/android/unlink.kotlin');
    const failed = jest.fn();
    await unlinkKotlin('test').catch(failed);
    expect(failed).toBeCalled();
  });
});
