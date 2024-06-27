// const fs = require("fs");
// const path = require("path");

// import {
//   EMBRACE_IMPORT_JAVA,
//   EMBRACE_IMPORT_KOTLIN,
//   EMBRACE_INIT_JAVA,
//   EMBRACE_INIT_KOTLIN,
// } from "../setup/patches/patch";

import Wizard from '../util/wizard';

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

describe('Uninstall Script Android', () => {
  // test("Remove Android Swazzler Dependency", async () => {
  //   jest.mock("path", () => ({
  //     join: () =>
  //       "./packages/core/scripts/__tests__/__mocks__/android/buildWithSwazzler.gradle",
  //   }));
  //   jest.mock(
  //     "../../../../../../package.json",
  //     () => ({
  //       name: "test",
  //     }),
  //     { virtual: true }
  //   );
  //   const { removeEmbraceLinkFromFile } = require("../setup/uninstall");

  //   const result = removeEmbraceLinkFromFile("swazzlerImport");
  //   expect(result).toBe(true);

  //   const wiz = new Wizard();
  //   const { patchBuildGradle } = require("../setup/android");

  //   const androidSteps = [patchBuildGradle];
  //   [...androidSteps].map((step) => wiz.registerStep(step));
  //   let failed = 0;
  //   try {
  //     await wiz.processSteps();
  //   } catch (e) {
  //     failed = 1;
  //   }
  //   expect(failed).toBe(0);
  // });
  test('Remove Android Swazzler Apply', async () => {
    jest.mock('path', () => ({
      join: () =>
        './packages/core/scripts/__tests__/__mocks__/android/appBuildWithSwazzler.gradle',
    }));
    jest.mock(
      '../../../../../../package.json',
      () => ({
        name: 'test',
      }),
      { virtual: true }
    );
    const { removeEmbraceLinkFromFile } = require('../setup/uninstall');

    const result = removeEmbraceLinkFromFile('swazzlerApply');
    expect(result).toBe(true);
    const flushPromises = () =>
      new Promise((resolve) => process.nextTick(resolve));
    await flushPromises();

    const wiz = new Wizard();
    const {
      patchAppBuildGradle,
      androidEmbraceSwazzlerPlugin,
    } = require('../setup/android');

    const androidSteps = [patchAppBuildGradle];
    [...androidSteps].map((step) => wiz.registerStep(step));
    let failed = 0;
    try {
      await wiz.processSteps();
    } catch (e) {
      failed = 1;
    }
    expect(failed).toBe(0);

    const { buildAppGradlePatchable } = require('../util/android');
    const buildAppGradleFile = await buildAppGradlePatchable();
    expect(buildAppGradleFile.hasLine(androidEmbraceSwazzlerPlugin)).toBe(true);
  });
  // test("Remove Embrace Config File", async () => {
  //   jest.mock("path", () => ({
  //     join: () =>
  //       "./packages/core/scripts/__tests__/__mocks__/android/embrace-config.json",
  //   }));
  //   jest.mock(
  //     "../../../../../../package.json",
  //     () => ({
  //       name: "test",
  //     }),
  //     { virtual: true }
  //   );
  //   const p = path.join(
  //     "packages/core/scripts/__tests__/__mocks__/android/embrace-config.json"
  //   );
  //   if (!fs.existsSync(p)) {
  //     fs.closeSync(fs.openSync(p, "a"));
  //   }

  //   expect(fs.existsSync(p)).toBe(true);

  //   const { removeEmbraceConfigFileAndroid } = require("../setup/uninstall");
  //   await removeEmbraceConfigFileAndroid();

  //   expect(fs.existsSync(p)).toBe(false);
  // });
  // test("Unlink Embrace From MainApplication.java", async () => {
  //   jest.mock("path", () => ({
  //     join: () => "./packages/core/scripts/__tests__/__mocks__/",
  //   }));
  //   jest.mock(
  //     "../../../../../../package.json",
  //     () => ({
  //       name: "test",
  //     }),
  //     { virtual: true }
  //   );
  //   const { mainApplicationPatchable } = require("../util/android");
  //   const mainApplication = await mainApplicationPatchable("java");

  //   expect(mainApplication.contents.includes(EMBRACE_IMPORT_JAVA)).toBe(true);
  //   expect(mainApplication.contents.includes(EMBRACE_INIT_JAVA)).toBe(true);

  //   const {
  //     removeEmbraceImportAndStartFromFile,
  //   } = require("../setup/uninstall");

  //   removeEmbraceImportAndStartFromFile("java");

  //   const mainApplicationAfterRemove = await mainApplicationPatchable("java");

  //   expect(
  //     mainApplicationAfterRemove.contents.includes(EMBRACE_IMPORT_JAVA)
  //   ).toBe(false);
  //   expect(
  //     mainApplicationAfterRemove.contents.includes(EMBRACE_INIT_JAVA)
  //   ).toBe(false);

  //   const patchMainApplication = require("../setup/patches/patch").default;
  //   const result = await patchMainApplication("java");

  //   expect(result).toBe(true);
  // });
  // test("Unlink Embrace From MainApplication.kt", async () => {
  //   jest.mock("path", () => ({
  //     join: () => "./packages/core/scripts/__tests__/__mocks__/",
  //   }));
  //   jest.mock(
  //     "../../../../../../package.json",
  //     () => ({
  //       name: "test",
  //     }),
  //     { virtual: true }
  //   );
  //   const { mainApplicationPatchable } = require("../util/android");
  //   const mainApplication = await mainApplicationPatchable("kotlin");

  //   expect(mainApplication.contents.includes(EMBRACE_IMPORT_KOTLIN)).toBe(true);
  //   expect(mainApplication.contents.includes(EMBRACE_INIT_KOTLIN)).toBe(true);
  //   const {
  //     removeEmbraceImportAndStartFromFile,
  //   } = require("../setup/uninstall");

  //   const result = removeEmbraceImportAndStartFromFile("kotlin");
  //   expect(result).toBe(true);

  //   const mainApplicationAfterRemove = await mainApplicationPatchable("kotlin");

  //   expect(
  //     mainApplicationAfterRemove.contents.includes(EMBRACE_IMPORT_KOTLIN)
  //   ).toBe(false);
  //   expect(
  //     mainApplicationAfterRemove.contents.includes(EMBRACE_INIT_KOTLIN)
  //   ).toBe(false);

  //   const patchMainApplication = require("../setup/patches/patch").default;
  //   const patchResult = await patchMainApplication("kotlin");

  //   expect(patchResult).toBe(true);
  // });
  // test("Unlink Embrace From MainApplication.java - TEST FAILS", async () => {
  //   jest.mock("path", () => ({
  //     join: () =>
  //       "./packages/core/scripts/__tests__/__mocks__/android/main-without-embrace",
  //   }));
  //   jest.mock(
  //     "../../../../../../package.json",
  //     () => ({
  //       name: "test",
  //     }),
  //     { virtual: true }
  //   );
  //   const {
  //     removeEmbraceImportAndStartFromFile,
  //   } = require("../setup/uninstall");

  //   const result = await removeEmbraceImportAndStartFromFile("java");

  //   expect(result).toBe(false);
  // });
  // test("Unlink Embrace From MainApplication.kt - TEST FAILS", async () => {
  //   jest.mock("path", () => ({
  //     join: () =>
  //       "./packages/core/scripts/__tests__/__mocks__/android/main-without-embrace",
  //   }));
  //   jest.mock(
  //     "../../../../../../package.json",
  //     () => ({
  //       name: "test",
  //     }),
  //     { virtual: true }
  //   );
  //   const {
  //     removeEmbraceImportAndStartFromFile,
  //   } = require("../setup/uninstall");

  //   const result = await removeEmbraceImportAndStartFromFile("kotlin");

  //   expect(result).toBe(false);
  // });
});
