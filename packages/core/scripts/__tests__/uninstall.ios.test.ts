import {
  EMBRACE_IMPORT_OBJECTIVEC,
  EMBRACE_INIT_OBJECTIVEC,
} from '../setup/patches/ios/ios.objectivec';
import {
  EMBRACE_IMPORT_SWIFT,
  EMBRACE_INIT_SWIFT,
} from '../setup/patches/ios/ios.swift';

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

describe('Uninstall Script iOS', () => {
  test('Remove Embrace From Podfile', async () => {
    jest.mock('glob', () => ({
      sync: () => ['./packages/core/scripts/__tests__/__mocks__/ios/Podfile'],
    }));
    jest.mock(
      '../../../../../../package.json',
      () => ({
        name: 'test',
      }),
      { virtual: true }
    );
    const iosUninstaller = require('../postunlink/ios');
    const result = await iosUninstaller.unpatchPodfile();
    const embracePodRegex = /pod\s*['"]EmbraceIO['"]/;
    expect(embracePodRegex.test(result.contents)).toBe(false);
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
    const iosUninstaller = require('../postunlink/ios');
    const { xcodePatchable } = require('../util/ios');
    const packageJsonMock = {
      name: 'testMock',
    };

    const xcode = await xcodePatchable(packageJsonMock);

    expect(!!xcode.findPhase('EmbraceIO')).toBe(true);
    expect(!!xcode.findPhase('SOURCEMAP_FILE')).toBe(true);

    const result = await iosUninstaller.unpatchXcode();
    expect(result.project.includes('EmbraceIO')).toBe(false);
    expect(result.project.includes('SOURCEMAP_FILE')).toBe(false);
  });
  test('Unlink Embrace From AppDelegate.mm - TEST FAILS', async () => {
    jest.mock('glob', () => ({
      sync: () => [
        './packages/core/scripts/__tests__/__mocks__/ios/NoAppDelegate.mm',
      ],
    }));
    const {
      unlinkObjectiveC,
    } = require('../setup/patches/ios/unlink.objectivec');
    const failed = jest.fn();
    await unlinkObjectiveC('test').catch(failed);
    expect(failed).toBeCalled();
  });
  test('Unlink Embrace From AppDelegate.swift - TEST FAILS', async () => {
    jest.mock('glob', () => ({
      sync: () => [
        './packages/core/scripts/__tests__/__mocks__/ios/NoAppDelegate.swift',
      ],
    }));

    const { unlinkSwift } = require('../setup/patches/ios/unlink.swift');

    const failed = jest.fn();
    await unlinkSwift('test').catch(failed);
    expect(failed).toBeCalled();
  });

  test('Unlink Embrace From AppDelegate.mm', async () => {
    jest.mock('glob', () => ({
      sync: () => [
        './packages/core/scripts/__tests__/__mocks__/ios/AppDelegate.mm',
      ],
    }));

    const { getAppDelegateByIOSLanguage } = require('../util/ios');
    const appDelegate = await getAppDelegateByIOSLanguage('test', 'objectivec');

    expect(appDelegate.contents.includes(EMBRACE_IMPORT_OBJECTIVEC)).toBe(true);
    expect(appDelegate.contents.includes(EMBRACE_INIT_OBJECTIVEC)).toBe(true);

    const {
      unlinkObjectiveC,
    } = require('../setup/patches/ios/unlink.objectivec');

    const result = await unlinkObjectiveC('test');

    expect(result.contents.includes(EMBRACE_IMPORT_OBJECTIVEC)).toBe(false);
    expect(result.contents.includes(EMBRACE_INIT_OBJECTIVEC)).toBe(false);
  });

  test('Unlink Embrace From AppDelegate.swift', async () => {
    jest.mock('glob', () => ({
      sync: () => [
        './packages/core/scripts/__tests__/__mocks__/ios/AppDelegate.swift',
      ],
    }));

    const { getAppDelegateByIOSLanguage } = require('../util/ios');
    const appDelegate = await getAppDelegateByIOSLanguage('test', 'swift');

    expect(appDelegate.contents.includes(EMBRACE_IMPORT_SWIFT)).toBe(true);
    expect(appDelegate.contents.includes(EMBRACE_INIT_SWIFT)).toBe(true);

    const { unlinkSwift } = require('../setup/patches/ios/unlink.swift');

    const result = await unlinkSwift('test');

    expect(result.contents.includes(EMBRACE_IMPORT_SWIFT)).toBe(false);
    expect(result.contents.includes(EMBRACE_INIT_SWIFT)).toBe(false);
  });
});
