import {
  ConfigPlugin,
  WarningAggregator,
  withAppDelegate,
  withXcodeProject,
  withDangerousMod,
} from "@expo/config-plugins";

import {applyEmbracePatches} from "../../scripts/util/podfile";

import {
  addFile,
  findPhase,
  modifyPhase,
  updateBuildProperty,
} from "./xcodeproj";
import {EmbraceProps} from "./types";
import {addAfter, hasMatch} from "./textUtils";
import {writeIfNotExists} from "./fileUtils";

const path = require("path");
const fs = require("fs");

const importAppDelegateHeaderRE = /(\s*)#import "AppDelegate\.h"/;
const objcAppLaunchRE = /(\s*)self.moduleName = @"main"/;
const swifthAppLaunchRE = /(\s*)func\s+application\(\s*_\s*[^}]*\{/;
const swifthUpdatedAppLaunchRE = /(\s*)let.*ExpoReactNativeFactory.*/;
const rnBundleScript = "react-native-xcode.sh";
const sourceMapPath =
  "$CONFIGURATION_BUILD_DIR/embrace-assets/main.jsbundle.map";
const exportSourcemapLine = `export SOURCEMAP_FILE="${sourceMapPath}"`;
const embraceLegacyRunScriptPath = "EmbraceIO/run.sh";
const embraceRunScriptPath =
  "${SRCROOT}/../node_modules/@embrace-io/react-native/ios/scripts/run.sh";

// Pins the dependency manager in the Podfile so it doesn't depend on the shell environment reaching
// `pod install`. `||=` leaves an explicit EMBRACE_USE_SPM in charge either way.
const spmEnvBlock = `# Source the Embrace iOS SDK from SPM instead of CocoaPods.
# SPM only links against dynamic frameworks, see https://embrace.io/docs/react-native/integration/add-embrace-sdk/
ENV['EMBRACE_USE_SPM'] ||= '1'

`;

const withIosEmbracePodfile: ConfigPlugin<EmbraceProps> = (
  expoConfig,
  props,
) => {
  return withDangerousMod(expoConfig, [
    "ios",
    async config => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile",
      );
      const original = fs.readFileSync(podfilePath, "utf8");

      const patch = applyEmbracePatches(original);

      if (patch.error) {
        throw new Error(patch.error);
      }

      let contents = patch.contents.replace(spmEnvBlock, "");

      if (props.iOSUseSPM) {
        contents = spmEnvBlock + contents;
      }

      if (contents !== original) {
        fs.writeFileSync(podfilePath, contents);
      }

      return config;
    },
  ]);
};

const getEmbraceInitializerContents = (appId: string) => {
  return `import Foundation
import EmbraceIO

@objcMembers class EmbraceInitializer: NSObject {
    // Start the EmbraceSDK with the minimum required settings, for more advanced configuration options see:
    // https://embrace.io/docs/ios/open-source/integration/embrace-options/
    static func start() -> Void {
        do {
            try Embrace
                .setup(
                    options: Embrace.Options(
                        appId: "${appId}",
                        platform: .reactNative
                    )
                )
                .start()
        } catch let e {
            print("Error starting Embrace \\(e.localizedDescription)")
        }
    }
}
`;
};

const getBridgingHeaderContents = () => {
  return `//
//  Use this file to import your target's public headers that you would like to expose to Swift.
//
`;
};

const withIosEmbraceAddInitializer: ConfigPlugin<EmbraceProps> = (
  expoConfig,
  props,
) => {
  return withXcodeProject(expoConfig, async config => {
    const project = config.modResults;
    const projectName = config.modRequest.projectName || "";

    const filePath = path.join(
      config.modRequest.platformProjectRoot,
      projectName,
      "EmbraceInitializer.swift",
    );

    writeIfNotExists(
      filePath,
      getEmbraceInitializerContents(props.iOSAppId),
      "withIosEmbraceAddInitializer",
    );

    const projectRelativePath = path.join(
      projectName,
      "EmbraceInitializer.swift",
    );

    if (!project.hasFile(projectRelativePath)) {
      addFile(project, projectName, projectRelativePath, "source");
      fs.writeFileSync(project.filepath, project.writeSync());
    }

    return config;
  });
};

const withIosEmbraceInvokeInitializer: ConfigPlugin<EmbraceProps> = (
  expoConfig,
  props,
) => {
  return withAppDelegate(expoConfig, config => {
    const lines = config.modResults.contents.split("\n");
    const language = config.modResults.language;

    // Don't add the Embrace initialize line again if it's already there
    if (hasMatch(lines, "Embrace")) {
      return config;
    }

    // Add the objective-c bridging header import if required
    if (language === "objcpp") {
      // https://developer.apple.com/documentation/swift/importing-swift-into-objective-c#Overview
      const headerName =
        props.productModuleName || config.modRequest.projectName || "";
      const alphanumericOnly = headerName.replace(/\W+/g, "_");
      const firstNumberReplaced = alphanumericOnly.replace(/^\d/, "_");
      const bridgingHeaderName = `${firstNumberReplaced}-Swift.h`;

      if (!bridgingHeaderName) {
        throw new Error(
          "failed to determine bridging header name for the AppDelegate file",
        );
      }

      const addedImport = addAfter(
        lines,
        // Look for the import of AppDelegate.h and add the import underneath
        importAppDelegateHeaderRE,
        `#import "${bridgingHeaderName}"`,
      );

      if (!addedImport) {
        throw new Error(
          "failed to add the bridging header import to the AppDelegate file",
        );
      }

      const addedExpoModulesImport = addAfter(
        lines,
        // Look for the import of AppDelegate.h and add the import underneath
        importAppDelegateHeaderRE,
        `#import "ExpoModulesCore-Swift.h"`,
      );

      if (!addedExpoModulesImport) {
        throw new Error(
          "failed to add the expo modules import to the AppDelegate file",
        );
      }
    }

    const addedInit = addAfter(
      lines,
      // Want the Embrace SDK initialization to happen right after at the start of the AppDelegate application method
      language === "swift" ? swifthAppLaunchRE : objcAppLaunchRE,
      language === "swift"
        ? "    EmbraceInitializer.start()" // Add indentation since we're matching on the method signature's whitespace
        : "[EmbraceInitializer start];",
    );

    if (!addedInit) {
      if (language !== "swift") {
        throw new Error(
          "failed to add the Embrace initialization to the AppDelegate application method",
        );
      }

      // Default AppDelegate.swift changed on later versions of expo, try one more time with a different regex
      const addedInitUpdatedSwift = addAfter(
        lines,
        swifthUpdatedAppLaunchRE,
        "EmbraceInitializer.start()",
      );

      if (!addedInitUpdatedSwift) {
        throw new Error(
          "failed to add the Embrace initialization to the AppDelegate application method",
        );
      }
    }

    config.modResults.contents = lines.join("\n");

    return config;
  });
};

const withIosEmbraceAddBridgingHeader: ConfigPlugin<
  EmbraceProps
> = expoConfig => {
  return withXcodeProject(expoConfig, async config => {
    const project = config.modResults;
    const projectName = config.modRequest.projectName || "";

    const bridgingHeader = project.getBuildProperty(
      "SWIFT_OBJC_BRIDGING_HEADER",
      undefined,
      projectName,
    );

    if (bridgingHeader) {
      // Nothing to do if the bridging header already exists;
      return config;
    }

    const filename = `${projectName}-Bridging-Header.h`;
    const filePath = path.join(
      config.modRequest.platformProjectRoot,
      projectName,
      filename,
    );
    const projectRelativePath = path.join(projectName, filename);
    writeIfNotExists(
      filePath,
      getBridgingHeaderContents(),
      "withIosEmbraceAddBridgingHeader",
    );

    if (!project.hasFile(projectRelativePath)) {
      addFile(project, projectName, projectRelativePath, "resource");

      updateBuildProperty(
        project,
        projectName,
        "SWIFT_OBJC_BRIDGING_HEADER",
        `"${projectRelativePath}"`,
      );

      fs.writeFileSync(project.filepath, project.writeSync());
    }

    return config;
  });
};

const withIosEmbraceAddUploadPhase: ConfigPlugin<EmbraceProps> = (
  expoConfig,
  props,
) => {
  return withXcodeProject(expoConfig, async config => {
    let modified = false;
    const project = config.modResults;

    const bundlePhase = findPhase(project, rnBundleScript);
    if (!bundlePhase) {
      throw new Error("Could not find React Native bundle phase to modify");
    }

    if (!hasMatch(bundlePhase.code, "embrace-assets")) {
      modifyPhase(
        project,
        bundlePhase.key,
        /^.*?\/(packager|scripts)\/react-native-xcode\.sh\s*/m,
        `mkdir -p "$CONFIGURATION_BUILD_DIR/embrace-assets"\n` +
          `${exportSourcemapLine}\n`,
      );
      modified = true;
    }

    /*
    shellScript = "REACT_NATIVE_MAP_PATH=\"$CONFIGURATION_BUILD_DIR/embrace-assets/main.jsbundle.map\" EMBRACE_ID=ios789 EMBRACE_TOKEN=apiToken456 \"${SRCROOT}/../node_modules/@embrace-io/react-native/ios/scripts/run.sh\"\nrm \"$CONFIGURATION_BUILD_DIR/embrace-assets/main.jsbundle.map\"";
     */
    if (
      !findPhase(project, embraceLegacyRunScriptPath) &&
      !findPhase(project, embraceRunScriptPath)
    ) {
      project.addBuildPhase(
        [],
        "PBXShellScriptBuildPhase",
        "Upload Debug Symbols to Embrace",
        null,
        {
          shellPath: "/bin/sh",
          shellScript: `REACT_NATIVE_MAP_PATH="${sourceMapPath}" EMBRACE_ID=${props.iOSAppId} EMBRACE_TOKEN=${props.apiToken} "${embraceRunScriptPath}"`,
        },
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(project.filepath, project.writeSync());
    }

    return config;
  });
};

const withIosEmbrace: ConfigPlugin<EmbraceProps> = (config, props) => {
  try {
    config = withIosEmbracePodfile(config, props);
    config = withIosEmbraceAddInitializer(config, props);
    config = withIosEmbraceInvokeInitializer(config, props);
    config = withIosEmbraceAddBridgingHeader(config, props);
    config = withIosEmbraceAddUploadPhase(config, props);
  } catch (e) {
    WarningAggregator.addWarningIOS(
      "@embrace-io/expo-config-plugin",
      e instanceof Error ? e.message : "",
      "https://embrace.io/docs/react-native/integration/add-embrace-sdk/",
    );
  }

  return config;
};

export default withIosEmbrace;

export {
  withIosEmbracePodfile,
  withIosEmbraceAddInitializer,
  withIosEmbraceInvokeInitializer,
  withIosEmbraceAddBridgingHeader,
  withIosEmbraceAddUploadPhase,
};
