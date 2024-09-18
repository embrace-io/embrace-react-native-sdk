import {
  ANDROID_LANGUAGE,
  MAIN_CLASS_BY_LANGUAGE,
} from "../setup/patches/common";

import {FileUpdatable, getFileContents} from "./file";

const path = require("path");
const fs = require("fs");

interface IDirectory {
  isDirectory: () => boolean;
  name: string;
}

export const getBuildGradlePatchable = (
  paths: string[] = [],
): FileUpdatable => {
  const gradlePath = path.join(...paths);
  if (!fs.existsSync(gradlePath)) {
    throw new Error(`cannot find build.gradle file at ${gradlePath}`);
  }
  return getFileContents(gradlePath);
};

export const buildGradlePatchable = (): Promise<FileUpdatable> => {
  return new Promise((resolve, reject) => {
    try {
      return resolve(getBuildGradlePatchable(["android", "build.gradle"]));
    } catch (e: unknown) {
      if (e instanceof Error) {
        return reject(e.message);
      }
      return reject(e);
    }
  });
};

export const buildAppGradlePatchable = (): Promise<FileUpdatable> => {
  return new Promise((resolve, reject) => {
    try {
      return resolve(
        getBuildGradlePatchable(["android", "app", "build.gradle"]),
      );
    } catch (e: unknown) {
      if (e instanceof Error) {
        return reject(e.message);
      }
      return reject(e);
    }
  });
};

export const embraceJSON = (): Promise<FileUpdatable> => {
  return new Promise((resolve, reject) => {
    const p = path.join("android", "app", "src", "main", "embrace-config.json");
    if (!fs.existsSync(p)) {
      return reject(`cannot find embrace-config.json file at ${p}`);
    }
    return resolve(getFileContents(p));
  });
};

export const getMainApplicationPatchable = (platform: ANDROID_LANGUAGE) => {
  const p = path.join("android", "app", "src", "main", "java");
  const mainApp = MAIN_CLASS_BY_LANGUAGE[platform];

  if (!fs.existsSync(p)) {
    return;
  }

  const foldersInJava: IDirectory[] = fs
    .readdirSync(p, {withFileTypes: true})
    .filter((dirent: IDirectory) => dirent.isDirectory());

  if (foldersInJava.length === 0) {
    return undefined;
  }

  let mainApplicationPath: string | undefined;
  let hasFoldersToLook = true;
  let foldersToLook = foldersInJava;
  while (!mainApplicationPath && hasFoldersToLook) {
    const foldersToLookTmp: IDirectory[] = [];
    foldersToLook.forEach(dir => {
      if (fs.existsSync(`${p}/${dir.name}/${mainApp}`)) {
        mainApplicationPath = `${p}/${dir.name}/${mainApp}`;
        hasFoldersToLook = false;
        return;
      }

      if (mainApplicationPath) {
        return;
      }

      const foldersInside =
        fs
          .readdirSync(`${p}/${dir.name}`, {withFileTypes: true})
          .filter((dirent: IDirectory) => dirent.isDirectory()) || [];

      if (foldersInside.length > 0) {
        foldersToLookTmp.push(
          ...foldersInside.map((d: IDirectory) => {
            return {...d, name: `${dir.name}/${d.name}`};
          }),
        );
      }
    });

    if (!mainApplicationPath) {
      if (foldersToLookTmp.length === 0) {
        hasFoldersToLook = false;
      } else {
        foldersToLook = [...foldersToLookTmp];
      }
    }
  }

  if (!mainApplicationPath) {
    return undefined;
  }

  return getFileContents(mainApplicationPath);
};

export const mainApplicationPatchable = (
  platform: ANDROID_LANGUAGE,
): Promise<FileUpdatable> => {
  return new Promise<FileUpdatable>((resolve, reject) => {
    const file = getMainApplicationPatchable(platform);
    if (!file) {
      return reject(
        `cannot find ${MAIN_CLASS_BY_LANGUAGE[platform]} file in any folder at "android/.../com/*". Please refer to the docs at https://embrace.io/docs/react-native/integration/add-embrace-sdk/?rn-platform=android to update it manually.`,
      );
    }
    return resolve(file);
  });
};

export const embraceJSONContents = (params: {
  appID: string;
  apiToken: string;
}) => {
  return `{
    "app_id": "${params.appID}",
    "api_token": "${params.apiToken}"
}`;
};
