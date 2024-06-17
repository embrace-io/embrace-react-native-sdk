import {
  EMBRACE_IMPORT_SWIFT,
  EMBRACE_INIT_SWIFT,
} from '../setup/patches/patch';
import {
  EMBRACE_IMPORT_OBJECTIVEC,
  EMBRACE_INIT_OBJECTIVEC,
  embraceNativePod,
} from '../util/ios';

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

describe('Uninstall Script iOS', () => {
  test('Patch AppDelegate.mm', async () => {
    jest.mock('glob', () => ({
      sync: () => [
        './packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithoutEmbrace.mm',
      ],
    }));
    jest.mock(
      '../../../../../../package.json',
      () => ({
        name: 'test',
      }),
      { virtual: true }
    );
    const patchAppDelegate = require('../setup/patches/patch').default;
    const result = await patchAppDelegate('objectivec', { name: 'test' });

    expect(result).toBe(true);

    const {
      unlinkObjectiveC,
    } = require('../setup/patches/ios/unlink.objectivec');

    const resultUnpatch = await unlinkObjectiveC('test');

    expect(resultUnpatch.contents.includes(EMBRACE_IMPORT_OBJECTIVEC)).toBe(
      false
    );
    expect(resultUnpatch.contents.includes(EMBRACE_INIT_OBJECTIVEC)).toBe(
      false
    );

    resultUnpatch.patch();
  });
  test('Patch AppDelegate.swift', async () => {
    jest.mock('glob', () => ({
      sync: (pattern: string) => {
        if (pattern.includes('swift')) {
          return [
            './packages/core/scripts/__tests__/__mocks__/ios/AppDelegateWithoutEmbrace.swift',
          ];
        }
        return [];
      },
    }));
    jest.mock(
      '../../../../../../package.json',
      () => ({
        name: 'test',
      }),
      { virtual: true }
    );
    const patchAppDelegate = require('../setup/patches/patch').default;
    const result = await patchAppDelegate('swift', { name: 'test' });

    expect(result).toBe(true);

    const { unlinkSwift } = require('../setup/patches/ios/unlink.swift');

    const resultUnpatch = await unlinkSwift('test');

    expect(resultUnpatch.contents.includes(EMBRACE_IMPORT_SWIFT)).toBe(false);
    expect(resultUnpatch.contents.includes(EMBRACE_INIT_SWIFT)).toBe(false);

    resultUnpatch.patch();
  });
  test('Patch Podfile', async () => {
    jest.mock('glob', () => ({
      sync: () => [
        './packages/core/scripts/__tests__/__mocks__/ios/PodfileWithoutEmbrace',
      ],
    }));
    jest.mock('semver/functions/gte', () => () => false);

    const { patchPodfile } = require('../setup/ios');
    const mockPackageJson = {
      name: 'Test',
      dependencies: {
        'react-native': '0.0.0',
      },
    };
    await patchPodfile(mockPackageJson);

    const iosUninstaller = require('../postunlink/ios');

    const result = await iosUninstaller.unpatchPodfile();

    expect(result.contents.includes(embraceNativePod)).toBe(false);
    result.patch();
  });
});
