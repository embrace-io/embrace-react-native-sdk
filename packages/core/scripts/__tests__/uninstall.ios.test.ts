import {
  EMBRACE_IMPORT_SWIFT,
  EMBRACE_INIT_SWIFT,
} from '../setup/patches/patch';
import {
  EMBRACE_IMPORT_OBJECTIVEC,
  EMBRACE_INIT_OBJECTIVEC,
} from '../util/ios';

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});
const flushPromises = () => new Promise((resolve) => process.nextTick(resolve));
describe('Uninstall Script iOS', () => {
  test('Remove Embrace From Podfile', async () => {
    jest.mock('glob', () => ({
      sync: () => ['./packages/core/scripts/__tests__/__mocks__/ios/Podfile'],
    }));

    jest.mock('semver/functions/gte', () => () => false);
    jest.mock(
      '../../../../../../package.json',
      () => ({
        name: 'test',
      }),
      { virtual: true }
    );
    const {
      removeEmbraceImportAndStartFromFile,
    } = require('../setup/uninstall');

    const resultUnpatch = await removeEmbraceImportAndStartFromFile(
      'podFileImport'
    );

    expect(resultUnpatch).toBe(true);

    const { patchPodfile } = require('../setup/ios');
    const mockPackageJson = {
      name: 'Test',
      dependencies: {
        'react-native': '0.0.0',
      },
    };
    await patchPodfile(mockPackageJson);
  });
  test('Remove Embrace From Xcode', async () => {
    jest.mock('glob', () => ({
      sync: () => [
        './packages/core/scripts/__tests__/__mocks__/ios/testMock.xcodeproj/project.pbxproj',
      ],
    }));

    jest.mock(
      '../../../../../../package.json',
      () => ({
        name: 'testMock',
      }),
      {
        virtual: true,
      }
    );
    const { xcodePatchable } = require('../util/ios');
    const packageJsonMock = {
      name: 'testMock',
    };

    const xcode = await xcodePatchable(packageJsonMock);

    expect(!!xcode.findPhase('EmbraceIO')).toBe(true);
    expect(!!xcode.findPhase('SOURCEMAP_FILE')).toBe(true);

    const { removeEmbraceFromXcode } = require('../setup/uninstall');

    const result = await removeEmbraceFromXcode();
    expect(result.project.includes('EmbraceIO')).toBe(false);
    expect(result.project.includes('SOURCEMAP_FILE')).toBe(false);

    xcode.sync();
    xcode.patch();

    const xcodeAfterPatch = await xcodePatchable(packageJsonMock);

    expect(!!xcodeAfterPatch.findPhase('EmbraceIO')).toBe(true);
    expect(!!xcodeAfterPatch.findPhase('SOURCEMAP_FILE')).toBe(true);
  });
  test('Unlink Embrace From AppDelegate.mm - TEST FAILS', async () => {
    jest.mock('glob', () => ({
      sync: () => [
        './packages/core/scripts/__tests__/__mocks__/ios/NoAppDelegate.mm',
      ],
    }));
    jest.mock(
      '../../../../../../package.json',
      () => ({
        name: 'test',
      }),
      { virtual: true }
    );
    const {
      removeEmbraceImportAndStartFromFile,
    } = require('../setup/uninstall');

    const crash = jest.fn();
    try {
      await removeEmbraceImportAndStartFromFile('objectivecImportStart');
    } catch (e) {
      crash();
    }

    expect(crash).toBeCalled();
  });
  test('Unlink Embrace From AppDelegate.swift - TEST FAILS', async () => {
    jest.mock('glob', () => ({
      sync: () => [
        './packages/core/scripts/__tests__/__mocks__/ios/NoAppDelegate.swift',
      ],
    }));
    jest.mock(
      '../../../../../../package.json',
      () => ({
        name: 'test',
      }),
      { virtual: true }
    );
    const {
      removeEmbraceImportAndStartFromFile,
    } = require('../setup/uninstall');

    const crash = jest.fn();
    try {
      await removeEmbraceImportAndStartFromFile('swiftImportStart');
    } catch (e) {
      crash();
    }

    expect(crash).toBeCalled();
  });

  test('Unlink Embrace From AppDelegate.mm', async () => {
    jest.mock('glob', () => ({
      sync: () => [
        './packages/core/scripts/__tests__/__mocks__/ios/AppDelegate.mm',
      ],
    }));
    jest.mock(
      '../../../../../../package.json',
      () => ({
        name: 'test',
      }),
      { virtual: true }
    );
    const { getAppDelegateByIOSLanguage } = require('../util/ios');
    const appDelegate = await getAppDelegateByIOSLanguage('test', 'objectivec');

    expect(appDelegate.contents.includes(EMBRACE_IMPORT_OBJECTIVEC)).toBe(true);
    expect(appDelegate.contents.includes(EMBRACE_INIT_OBJECTIVEC)).toBe(true);

    const {
      removeEmbraceImportAndStartFromFile,
    } = require('../setup/uninstall');

    const resultUnpatch = await removeEmbraceImportAndStartFromFile(
      'objectivecImportStart'
    );

    expect(resultUnpatch).toBe(true);

    const patchAppDelegate = require('../setup/patches/patch').default;
    const result = await patchAppDelegate('objectivec', { name: 'test' });

    expect(result).toBe(true);
  });

  test('Unlink Embrace From AppDelegate.swift', async () => {
    jest.mock('glob', () => ({
      sync: () => [
        './packages/core/scripts/__tests__/__mocks__/ios/AppDelegate.swift',
      ],
    }));
    jest.mock(
      '../../../../../../package.json',
      () => ({
        name: 'test',
      }),
      { virtual: true }
    );
    const { getAppDelegateByIOSLanguage } = require('../util/ios');
    const appDelegate = await getAppDelegateByIOSLanguage('test', 'swift');

    expect(appDelegate.contents.includes(EMBRACE_IMPORT_SWIFT)).toBe(true);
    expect(appDelegate.contents.includes(EMBRACE_INIT_SWIFT)).toBe(true);

    const {
      removeEmbraceImportAndStartFromFile,
    } = require('../setup/uninstall');

    const resultUnpatch = await removeEmbraceImportAndStartFromFile(
      'swiftImportStart'
    );

    expect(resultUnpatch).toBe(true);

    await flushPromises();
    const patchAppDelegate = require('../setup/patches/patch').default;
    const result = await patchAppDelegate('swift', { name: 'test' });

    expect(result).toBe(true);
  });
});
