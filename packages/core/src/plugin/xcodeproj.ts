/**
 * This file provides helpers on top of https://github.com/apache/cordova-node-xcode/tree/3.0.1 to perform a handful
 * of operations not directly supported by that library.
 *
 * This is a subset and duplicates some functionality from packages/core/scripts/util/ios.ts, once our automated install
 * script is fully replaced by our Expo Config plugin that file can be removed
 */
import {type XcodeProject} from "@expo/config-plugins";

import {hasMatch} from "./textUtils";

type ProjectFileType = "resource" | "source";

type BuildPhase = {
  key: string;
  code: string[];
};

const buildPhaseObj = (project: XcodeProject): {[key: string]: any} => {
  return project.hash.project.objects.PBXShellScriptBuildPhase || {};
};

const findPhase = (
  project: XcodeProject,
  matcher: string,
): BuildPhase | null => {
  const phases = buildPhaseObj(project);
  const phaseKeys = Object.keys(phases);

  for (let i = 0; i < phaseKeys.length; i++) {
    const key = phaseKeys[i];
    const phase = phases[key];
    const code = phase.shellScript && [phase.shellScript];

    if (code && hasMatch(code, matcher)) {
      return {key, code};
    }
  }

  return null;
};

const modifyPhase = (
  project: XcodeProject,
  phaseKey: string,
  matcher: RegExp,
  addBefore: string,
) => {
  const phase = buildPhaseObj(project)[phaseKey];
  let code = JSON.parse(phase.shellScript);
  code = code.replace(
    matcher,
    (match: string) => `${addBefore}${addBefore === "" ? "" : match}`,
  );

  phase.shellScript = JSON.stringify(code);
};

const addFile = (
  project: XcodeProject,
  groupName: string,
  path: string,
  fileType?: ProjectFileType,
) => {
  const target = findHash(
    project.hash.project.objects.PBXNativeTarget,
    groupName,
  );
  const group = findHash(project.hash.project.objects.PBXGroup, groupName);

  if (target && group) {
    const file = project.addFile(path, group[0], {target: target[0]});

    if (!file) {
      return;
    }

    file.target = target[0];
    file.uuid = project.generateUuid();
    project.addToPbxBuildFileSection(file);

    if (fileType === "resource") {
      project.addToPbxResourcesBuildPhase(file);
    } else if (fileType === "source") {
      project.addToPbxSourcesBuildPhase(file);
    }
  }
};

const updateBuildProperty = (
  project: XcodeProject,
  groupName: string,
  propertyName: string,
  value: string,
) => {
  const targetHash = getTargetHash(project, groupName);
  const configurations = project.pbxXCBuildConfigurationSection();
  const xcConfigList = project.pbxXCConfigurationList();
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
};

const getTargetHash = (project: XcodeProject, name: string) => {
  const target = project.pbxTargetByName(name);
  return target ? target.buildConfigurationList : "";
};

const findHash = (objects: any, groupName: string) => {
  return Object.entries(objects).find(([_, group]: [any, any]): boolean => {
    return group.name === groupName;
  });
};

export {addFile, updateBuildProperty, findPhase, modifyPhase};
