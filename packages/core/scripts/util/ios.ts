const glob = require('glob');
const xcode = require('xcode');
const fs = require('fs');
import { FileUpdatable, getFileContents, Patchable } from './file';

import EmbraceLogger from '../../src/logger';
import { IOS_LANGUAGE, MAIN_CLASS_BY_LANGUAGE } from '../setup/patches/common';

const embLogger = new EmbraceLogger(console);

export const embraceNativePod = `pod 'EmbraceIO'`;

export const bundlePhaseRE = /react-native-xcode\.sh/;

export const exportSourcemapRNVariable =
  'export SOURCEMAP_FILE="$CONFIGURATION_BUILD_DIR/main.jsbundle.map";';

export const EMBRACE_IMPORT_OBJECTIVEC = `
#import <Embrace/Embrace.h>
`;
export const EMBRACE_INIT_OBJECTIVEC =
  '[[Embrace sharedInstance] startWithLaunchOptions:launchOptions framework:EMBAppFrameworkReactNative];';

export const embRunScript = '"${PODS_ROOT}/EmbraceIO/run.sh"';

export const getAppDelegateByIOSLanguage = (
  projectName: string,
  language: IOS_LANGUAGE
): FileUpdatable | undefined => {
  const appDelegatePathFounded: string[] = glob.sync(
    `**/${MAIN_CLASS_BY_LANGUAGE[language]}`,
    {
      ignore: ['node_modules/**', 'ios/Pods/**'],
    }
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
  const podfilePath = glob.sync('ios/Podfile')[0];
  if (!podfilePath) {
    throw new Error(
      'Could not find Podfile. Please refer to the docs at https://docs.embrace.io to update manually.'
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

export const embracePlistPatchable = ({
  name,
}: {
  name: string;
}): Promise<FileUpdatable> => {
  return new Promise<FileUpdatable>((resolve, reject) => {
    const plistPath = glob.sync('ios/**/Embrace-Info.plist')[0];
    if (!plistPath) {
      return reject(embLogger.format('Could not find Embrace-Info.plist'));
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
      '**/*.xcodeproj/project.pbxproj',
      { ignore: ['node_modules/**', 'ios/Pods/**'] }
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
        embLogger.format(`Could not find xcode project file. ${docsMessage}`)
      );
    }

    return getXcodeProject(projectPath).then(resolve).catch(reject);
  });
};

const docsMessage =
  'Please refer to the docs at https://docs.embrace.io to update manually.';

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

export class XcodeProject implements Patchable {
  public project: any;
  public path: string;

  constructor(path: string = '', project: any) {
    this.path = path;
    this.project = project;
  }

  public buildPhaseObj(): { [key: string]: any } {
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
      (match: string) => `${add}${add === '' ? '' : match}`
    );

    phase.shellScript = JSON.stringify(code);
  }

  public findPhase(line: string | RegExp): string {
    const buildPhaseObj = this.buildPhaseObj();
    return (
      Object.keys(buildPhaseObj).find((key) => {
        return this.hasLine(key, line);
      }) || ''
    );
  }

  public findAndRemovePhase(line: string | RegExp) {
    const buildPhaseObj = this.buildPhaseObj();
    this.project.hash.project.objects.PBXShellScriptBuildPhase = Object.keys(
      buildPhaseObj
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

      return { ...a, [key]: buildPhaseObj[key] };
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
      groupName
    );
    const group = this.findHash(
      this.project.hash.project.objects.PBXGroup,
      groupName
    );
    if (target && group) {
      const file = this.project.addFile(path, group[0], { target: target[0] });
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
