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
      removeEmbraceImportAndStartFromFile,
    } = require('../setup/uninstall');

    const resultUnpatch = await removeEmbraceImportAndStartFromFile(
      'objectivecImportStart'
    );

    expect(resultUnpatch).toBe(true);
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

    const {
      removeEmbraceImportAndStartFromFile,
    } = require('../setup/uninstall');

    const resultUnpatch = await removeEmbraceImportAndStartFromFile(
      'swiftImportStart'
    );

    expect(resultUnpatch).toBe(true);
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

    const {
      removeEmbraceImportAndStartFromFile,
    } = require('../setup/uninstall');

    const resultUnpatch = await removeEmbraceImportAndStartFromFile(
      'podFileImport'
    );

    expect(resultUnpatch).toBe(true);
  });
});
