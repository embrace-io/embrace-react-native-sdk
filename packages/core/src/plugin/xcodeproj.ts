type ProjectFileType = "resource" | "source";

type XCodeProject = any;

/*

// TODO, fails if using `import` here?
const path = require("path");
const fs = require("fs");

const buildPhaseObj = (project: XCodeProject): {[key: string]: any} => {
  return project.hash.project.objects.PBXShellScriptBuildPhase || {};
};


const hasLine = (key: string, line: string | RegExp): boolean => {
  const buildPhaseObj = buildPhaseObj();
  const phase = buildPhaseObj[key];
  if (!phase) {
    return false;
  }
  if (!phase.shellScript) {
    return false;
  }
  const code = JSON.parse(phase.shellScript);
  return (line instanceof RegExp ? code.search(line) : code.indexOf(line)) > -1;
};

const modifyPhase = (key: string, line: string | RegExp, add: string) => {
  // Doesn't include line
  if (!hasLine(key, line)) {
    return;
  }
  // Already has add
  if (add && hasLine(key, add)) {
    return;
  }
  const buildPhaseObj = buildPhaseObj();
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
};
const findPhase = (line: string | RegExp): string => {
  const buildPhaseObj = buildPhaseObj();
  return (
    Object.keys(buildPhaseObj).find(key => {
      return hasLine(key, line);
    }) || ""
  );
};

const findAndRemovePhase = (project: XCodeProject, line: string | RegExp) => {
  const buildPhaseObj = buildPhaseObj();

  project.hash.project.objects.PBXShellScriptBuildPhase = Object.keys(
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
  const nativeTargets = project.hash.project.objects.PBXNativeTarget;
  project.hash.project.objects.PBXNativeTarget = Object.keys(
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
};

 */

const addFile = (
  project: XCodeProject,
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

/*
const getBridgingHeaderName = (project: XCodeProject, groupName: string) => {
  const productModuleName =
    getBuildProperty(project, groupName, "PRODUCT_MODULE_NAME") || groupName;
  return projectNameToBridgingHeader(productModuleName);
};


const getTargetHash = (project: XCodeProject, name: string) => {
  const target = project.pbxTargetByName(name);
  return target ? target.buildConfigurationList : "";
};

const getBuildProperty = (
  project: XCodeProject,
  groupName: string,
  propertyName: string,
) => {
  return project.getBuildProperty(propertyName, undefined, groupName);
};

const updateBuildProperty = (
  project: XCodeProject,
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

const removeResourceFile = (
  project: XCodeProject,
  groupName: string,
  path: string,
) => {
  const target = findHash(
    project.hash.project.objects.PBXNativeTarget,
    groupName,
  );
  const group = findHash(project.hash.project.objects.PBXGroup, groupName);
  if (target && group) {
    const file = project.removeSourceFile(path, {target: target[0]}, group[0]);
    project.removeFromPbxResourcesBuildPhase(file);
  }
};

 */

const findHash = (objects: any, groupName: string) => {
  return Object.entries(objects).find(([_, group]: [any, any]): boolean => {
    return group.name === groupName;
  });
};

/*
const addBridgingHeader = (
  project: XCodeProject,
  projectName: string,
  filePath: string,
) => {
  const bridgingHeader = getBuildProperty(
    project,
    projectName,
    "SWIFT_OBJC_BRIDGING_HEADER",
  );

  if (bridgingHeader) {
    return;
  }

  // Add the bridging header file
  const filename = `${projectName}-Bridging-Header.h`;
  fs.writeFileSync(
    path.join(filePath, "../../", projectName, filename),
    getBridgingHeaderContents(),
  );

  const nameWithCaseSensitive = findNameWithCaseSensitiveFromPath(
    filePath,
    projectName,
  );
  addFile(
    nameWithCaseSensitive,
    `${nameWithCaseSensitive}/${filename}`,
    "source",
  );

  updateBuildProperty(
    project,
    projectName,
    "SWIFT_OBJC_BRIDGING_HEADER",
    `"${nameWithCaseSensitive}/${filename}"`,
  );
};

// https://developer.apple.com/documentation/swift/importing-swift-into-objective-c#Overview
const projectNameToBridgingHeader = (projectName: string): string => {
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


const findNameWithCaseSensitiveFromPath = (path: string, name: string) => {
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
 */

export {addFile};
