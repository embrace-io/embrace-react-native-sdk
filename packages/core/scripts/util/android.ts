import {FileUpdatable, getFileContents} from "./file";

const path = require("path");
const fs = require("fs");

interface IDirectory {
  isDirectory: () => boolean;
  name: string;
}

export const buildGradlePatchable = (): Promise<FileUpdatable> => {
  return new Promise((resolve, reject) => {
    const gradlePath = path.join("android", "build.gradle");
    if (!fs.existsSync(gradlePath)) {
      return reject(`cannot find build.gradle file at ${gradlePath}`);
    }
    return resolve(getFileContents(gradlePath));
  });
};

export const buildAppGradlePatchable = (): Promise<FileUpdatable> => {
  return new Promise((resolve, reject) => {
    const appGradlePath = path.join("android", "app", "build.gradle");
    if (!fs.existsSync(appGradlePath)) {
      return reject(`cannot find build.gradle file at ${appGradlePath}`);
    }
    return resolve(getFileContents(appGradlePath));
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

export const mainApplicationPatchable = ({
  name = "",
}): Promise<FileUpdatable> => {
  return new Promise<FileUpdatable>((resolve, reject) => {
    const p = path.join("android", "app", "src", "main", "java", "com");
    const mainApp = "MainApplication.java";

    const foldersInJava: IDirectory[] = fs
      .readdirSync(p, {withFileTypes: true})
      .filter((dirent: IDirectory) => dirent.isDirectory());

    if (foldersInJava.length === 0) {
      return reject(
        `cannot find any folder at ${p}, ${mainApp} patch was skipped. Please refer to the docs at https://embrace.io/docs/react-native/integration/add-embrace-sdk/?rn-platform=android to update it manually.`,
      );
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
      return reject(
        `cannot find MainApplication.java file in any folder at ${p}. Please refer to the docs at https://embrace.io/docs/react-native/integration/add-embrace-sdk/?rn-platform=android to update it manually.`,
      );
    }
    return resolve(getFileContents(mainApplicationPath));
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
