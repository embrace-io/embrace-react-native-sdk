import {IOS_LANGUAGE, MAIN_CLASS_BY_LANGUAGE} from "../setup/patches/common";
import EmbraceLogger from "../../src/utils/EmbraceLogger";

import {FileUpdatable, getFileContents, Patchable} from "./file";

const osPath = require("path");
const fs = require("fs");

const xcode = require("xcode");
const glob = require("glob");

const embLogger = new EmbraceLogger(console);

export const embraceNativePod = `pod 'EmbraceIO'`;

export const bundlePhaseRE = /react-native-xcode\.sh/;

export const exportSourcemapRNVariable =
  'export SOURCEMAP_FILE="$CONFIGURATION_BUILD_DIR/main.jsbundle.map";';

export const EMBRACE_IMPORT_OBJECTIVEC = ({
  bridgingHeader,
}: {
  bridgingHeader?: string;
}) => [`#import "${bridgingHeader}"`];

export const EMBRACE_INIT_OBJECTIVEC = "[EmbraceInitializer start];";

export const embRunScript = '"${PODS_ROOT}/EmbraceIO/run.sh"';

export type ProjectFileType = "resource" | "source";

export const getAppDelegateByIOSLanguage = (
  projectName: string,
  language: IOS_LANGUAGE,
): FileUpdatable | undefined => {
  const appDelegatePathFounded: string[] = glob.sync(
    `**/${MAIN_CLASS_BY_LANGUAGE[language]}`,
    {
      ignore: ["node_modules/**", "ios/Pods/**"],
    },
  );

  let appDelegatePath: string | undefined;
  if (appDelegatePathFounded.length === 1) {
    appDelegatePath = appDelegatePathFounded[0];
  } else if (appDelegatePathFounded.length > 1) {
    appDelegatePath = appDelegatePathFounded.find((path: string) => {
      return (
        path.toLocaleLowerCase().indexOf(projectName.toLocaleLowerCase()) > -1
      );
    });
  }

  if (!appDelegatePath) {
    return undefined;
  }

  return getFileContents(appDelegatePath);
};
export const getPodFile = () => {
  const podfilePath = glob.sync("ios/Podfile")[0];
  if (!podfilePath) {
    throw new Error(
      "Could not find Podfile. Please refer to the docs at https://embrace.io/docs to update manually.",
    );
  }
  return getFileContents(podfilePath);
};
export const podfilePatchable = (): Promise<FileUpdatable> => {
  return new Promise((resolve, reject) => {
    try {
      return resolve(getPodFile());
    } catch (e: unknown) {
      if (e instanceof Error) {
        return reject(e.message);
      }
      return reject(e);
    }
  });
};

export const embracePlistPatchable = (): Promise<FileUpdatable> => {
  return new Promise<FileUpdatable>((resolve, reject) => {
    const plistPath = glob.sync("ios/**/Embrace-Info.plist")[0];
    if (!plistPath) {
      return reject(embLogger.format("Could not find Embrace-Info.plist"));
    }
    return resolve(getFileContents(plistPath));
  });
};

export const xcodePatchable = ({
  name,
}: {
  name: string;
}): Promise<XcodeProject> => {
  return new Promise((resolve, reject) => {
    const projectPathFounded: string[] = glob.sync(
      "**/*.xcodeproj/project.pbxproj",
      {ignore: ["node_modules/**", "ios/Pods/**"]},
    );

    let projectPath: string | undefined;
    if (projectPathFounded.length === 1) {
      projectPath = projectPathFounded[0];
    } else if (projectPathFounded.length > 1) {
      projectPath = projectPathFounded.find((path: string) => {
        return path.toLocaleLowerCase().indexOf(name.toLocaleLowerCase()) > -1;
      });
    }

    if (!projectPath) {
      return reject(
        embLogger.format(`Could not find xcode project file. ${docsMessage}`),
      );
    }

    return getXcodeProject(projectPath).then(resolve).catch(reject);
  });
};

const docsMessage =
  "Please refer to the docs at https://embrace.io/docs to update manually.";

export const getXcodeProject = (path: string): Promise<XcodeProject> => {
  const project = xcode.project(path);
  return new Promise((resolve, reject) => {
    project.parse((err: any) => {
      if (err) {
        return reject(err);
      }

      const proj = new XcodeProject(path, project);
      resolve(proj);
    });
  });
};

export class XcodeProject implements Patchable {
  public project: any;
  public path: string;

  constructor(path: string = "", project: any) {
    this.path = path;
    this.project = project;
  }

  public buildPhaseObj(): {[key: string]: any} {
    return this.project.hash.project.objects.PBXShellScriptBuildPhase || {};
  }

  public hasLine(key: string, line: string | RegExp): boolean {
    const buildPhaseObj = this.buildPhaseObj();
    const phase = buildPhaseObj[key];
    if (!phase) {
      return false;
    }
    if (!phase.shellScript) {
      return false;
    }
    const code = JSON.parse(phase.shellScript);
    return (
      (line instanceof RegExp ? code.search(line) : code.indexOf(line)) > -1
    );
  }

  public modifyPhase(key: string, line: string | RegExp, add: string) {
    // Doesn't include line
    if (!this.hasLine(key, line)) {
      return;
    }
    // Already has add
    if (add && this.hasLine(key, add)) {
      return;
    }
    const buildPhaseObj = this.buildPhaseObj();
    const phase = buildPhaseObj[key];
    if (!phase) {
      return;
    }
    if (!phase.shellScript) {
      return;
    }
    let code = JSON.parse(phase.shellScript);
    code = code.replace(
      line,
      (match: string) => `${add}${add === "" ? "" : match}`,
    );

    phase.shellScript = JSON.stringify(code);
  }

  public findPhase(line: string | RegExp): string {
    const buildPhaseObj = this.buildPhaseObj();
    return (
      Object.keys(buildPhaseObj).find(key => {
        return this.hasLine(key, line);
      }) || ""
    );
  }

  public findAndRemovePhase(line: string | RegExp) {
    const buildPhaseObj = this.buildPhaseObj();

    this.project.hash.project.objects.PBXShellScriptBuildPhase = Object.keys(
      buildPhaseObj,
    ).reduce((a, key) => {
      const phase = buildPhaseObj[key];
      if (!phase) {
        return a;
      }
      if (phase.shellScript) {
        const code = JSON.parse(phase.shellScript);
        if (code.search(line) > -1) {
          return a;
        }
      }

      return {...a, [key]: buildPhaseObj[key]};
    }, {});
    const nativeTargets = this.project.hash.project.objects.PBXNativeTarget;
    this.project.hash.project.objects.PBXNativeTarget = Object.keys(
      nativeTargets,
    ).reduce((a, key) => {
      const phase = nativeTargets[key];
      if (!phase) {
        return a;
      }
      if (phase.buildPhases) {
        phase.buildPhases = phase.buildPhases.filter(
          ({comment}: {comment: string}) =>
            !comment.includes("Upload Debug Symbols to Embrace"),
        );
      }
      return {...a, [key]: phase};
    }, {});
  }

  public patch() {
    fs.writeFileSync(this.path, this.writeSync());
  }

  public writeSync() {
    return this.project.writeSync();
  }

  public addFile(groupName: string, path: string, fileType?: ProjectFileType) {
    const target = this.findHash(
      this.project.hash.project.objects.PBXNativeTarget,
      groupName,
    );
    const group = this.findHash(
      this.project.hash.project.objects.PBXGroup,
      groupName,
    );
    if (target && group) {
      const file = this.project.addFile(path, group[0], {target: target[0]});
      file.target = target[0];
      file.uuid = this.project.generateUuid();
      this.project.addToPbxBuildFileSection(file);

      if (fileType === "resource") {
        this.project.addToPbxResourcesBuildPhase(file);
      } else if (fileType === "source") {
        this.project.addToPbxSourcesBuildPhase(file);
      }
    }
  }

  public getBridgingHeaderName(groupName: string) {
    const productModuleName =
      this.getBuildProperty(groupName, "PRODUCT_MODULE_NAME") || groupName;
    return projectNameToBridgingHeader(productModuleName);
  }

  private getTargetHash(name: string) {
    const target = this.project.pbxTargetByName(name);
    return target ? target.buildConfigurationList : "";
  }

  private getBuildProperty(groupName: string, propertyName: string) {
    return this.project.getBuildProperty(propertyName, undefined, groupName);
  }

  private updateBuildProperty(
    groupName: string,
    propertyName: string,
    value: string,
  ) {
    const targetHash = this.getTargetHash(groupName);
    const configurations = this.project.pbxXCBuildConfigurationSection();
    const xcConfigList = this.project.pbxXCConfigurationList();
    for (const configName in xcConfigList) {
      if (configName !== targetHash) {
        continue;
      }
      for (const item of xcConfigList[configName].buildConfigurations) {
        const config = configurations[item.value];
        if (config) {
          config.buildSettings[propertyName] = value;
        }
      }
    }
  }

  public removeResourceFile(groupName: string, path: string) {
    const target = this.findHash(
      this.project.hash.project.objects.PBXNativeTarget,
      groupName,
    );
    const group = this.findHash(
      this.project.hash.project.objects.PBXGroup,
      groupName,
    );
    if (target && group) {
      const file = this.project.removeSourceFile(
        path,
        {target: target[0]},
        group[0],
      );
      this.project.removeFromPbxResourcesBuildPhase(file);
    }
  }

  private findHash(objects: any, groupName: string) {
    return Object.entries(objects).find(([_, group]: [any, any]): boolean => {
      return group.name === groupName;
    });
  }

  public async addBridgingHeader(projectName: string) {
    const bridgingHeader = this.getBuildProperty(
      projectName,
      "SWIFT_OBJC_BRIDGING_HEADER",
    );

    if (bridgingHeader) {
      embLogger.warn("bridging header already exists");
      return true;
    }

    // Add the bridging header file
    const filename = `${projectName}-Bridging-Header.h`;
    fs.writeFileSync(
      osPath.join(this.path, "../../", projectName, filename),
      getBridgingHeaderContents(),
    );

    const nameWithCaseSensitive = findNameWithCaseSensitiveFromPath(
      this.path,
      projectName,
    );
    this.addFile(
      nameWithCaseSensitive,
      `${nameWithCaseSensitive}/${filename}`,
      "source",
    );

    this.updateBuildProperty(
      projectName,
      "SWIFT_OBJC_BRIDGING_HEADER",
      `"${nameWithCaseSensitive}/${filename}"`,
    );

    this.patch();

    return true;
  }
}

// https://developer.apple.com/documentation/swift/importing-swift-into-objective-c#Overview
export const projectNameToBridgingHeader = (projectName: string): string => {
  const alphanumericOnly = projectName.replace(/\W+/g, "_");
  const firstNumberReplaced = alphanumericOnly.replace(/^\d/, "_");
  return `${firstNumberReplaced}-Swift.h`;
};

const getBridgingHeaderContents = () => {
  return `//
//  Use this file to import your target's public headers that you would like to expose to Swift.
//
`;
};

export const findNameWithCaseSensitiveFromPath = (
  path: string,
  name: string,
) => {
  const pathSplitted = path.split("/");
  const nameInLowerCase = name.toLocaleLowerCase();

  const nameFounded = pathSplitted.find(
    element => element.toLocaleLowerCase() === `${nameInLowerCase}.xcodeproj`,
  );
  if (nameFounded) {
    return nameFounded.replace(".xcodeproj", "");
  }

  return name;
};
