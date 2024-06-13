import EmbraceLogger from "../../src/logger";

import {FileUpdatable, getFileContents, Patchable} from "./file";

const fs = require("fs");

const xcode = require("xcode");
const glob = require("glob");

const embLogger = new EmbraceLogger(console);

export const embraceNativePod = `
  pod 'EmbraceIO'
`;

export const embraceImport = `
#import <Embrace/Embrace.h>
`;

export const bundlePhaseRE = /react-native-xcode\.sh/;

export const bundlePhaseExtraArgs =
  'export SOURCEMAP_FILE="$CONFIGURATION_BUILD_DIR/main.jsbundle.map";';

export const embRunScript = '"${PODS_ROOT}/EmbraceIO/run.sh"';

export const appDelegatePatchable = ({
  name,
}: {
  name: string;
}): Promise<FileUpdatable> => {
  return new Promise((resolve, reject) => {
    const appDelegatePathFounded: string[] = glob.sync(
      "**/AppDelegate.*(m|mm)",
      {ignore: ["node_modules/**", "ios/Pods/**"]},
    );

    let appDelegatePath: string | undefined;
    if (appDelegatePathFounded.length === 1) {
      appDelegatePath = appDelegatePathFounded[0];
    } else if (appDelegatePathFounded.length > 1) {
      appDelegatePath = appDelegatePathFounded.find((path: string) => {
        return path.toLocaleLowerCase().indexOf(name.toLocaleLowerCase()) > -1;
      });
    }

    if (!appDelegatePath) {
      return reject(
        embLogger.format(
          "Couldn't find AppDelegate. Please refer to the docs at https://embrace.io/docs/react-native/integration/add-embrace-sdk/?rn-platform=ios&platform=ios to update manually.",
        ),
      );
    }

    const appDelegate = getFileContents(appDelegatePath);
    return resolve(appDelegate);
  });
};

export const podfilePatchable = (): Promise<FileUpdatable> => {
  return new Promise((resolve, reject) => {
    const podfilePath = glob.sync("ios/Podfile")[0];
    if (!podfilePath) {
      return reject(
        embLogger.format(
          "Could not find Podfile. Please refer to the docs at https://docs.embrace.io to update manually.",
        ),
      );
    }
    const podfile = getFileContents(podfilePath);
    return resolve(podfile);
  });
};

export const embracePlistPatchable = ({
  name,
}: {
  name: string;
}): Promise<FileUpdatable> => {
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

    return getXcodeProject(projectPath).then(resolve);
  });
};

const docsMessage =
  "Please refer to the docs at https://docs.embrace.io to update manually.";

const getXcodeProject = (path: string): Promise<XcodeProject> => {
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

class XcodeProject implements Patchable {
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
  }

  public sync() {
    this.project = this.project.writeSync();
  }

  public patch() {
    fs.writeFileSync(this.path, this.project);
  }

  public addFile(groupName: string, path: string) {
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
      this.project.addToPbxResourcesBuildPhase(file);
    }
  }

  private findHash(objects: any, groupName: string) {
    return Object.entries(objects).find(([_, group]: [any, any]): boolean => {
      return group.name === groupName;
    });
  }
}

export const formatEmbraceInitializer = (): string => `
  [[Embrace sharedInstance] startWithLaunchOptions:launchOptions framework:EMBAppFrameworkReactNative];
`;
