import {
  ConfigPlugin,
  WarningAggregator,
  withAppDelegate,
  // withDangerousMod,
  withXcodeProject,
} from "@expo/config-plugins";

import {addFile, updateBuildProperty} from "./xcodeproj";
import {EmbraceProps} from "./types";
import {addAfter, hasMatch} from "./textUtils";

// TODO, fails if using `import` here?
const path = require("path");
const fs = require("fs");

const getEmbraceInitializerContents = (appId: string) => {
  return `import Foundation
import EmbraceIO

@objcMembers class EmbraceInitializer: NSObject {
    // Start the EmbraceSDK with the minimum required settings, for more advanced configuration options see:
    // https://embrace.io/docs/ios/open-source/embrace-options/
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

    try {
      const fd = fs.openSync(filePath, "wx");
      fs.writeFileSync(fd, getEmbraceInitializerContents(props.iOSAppId));
    } catch (e) {
      if (e instanceof Error && e.message.includes("EEXIST")) {
        // Don't try and overwrite the file if it already exists
      } else {
        throw new Error(
          `withIosEmbraceAddInitializer failed to write ${filePath}: ${e}`,
        );
      }
    }

    const projectRelativePath = path.join(
      projectName,
      "EmbraceInitializer.swift",
    );

    if (project.hasFile(projectRelativePath)) {
      return config;
    }

    addFile(project, projectName, projectRelativePath, "source");

    fs.writeFileSync(project.filepath, project.writeSync());

    return config;
  });
};

const importAppDelegateHeaderRE = /(\s*)#import "AppDelegate\.h"/;
const objcAppLaunchRE = /(\s*)self.moduleName = @"main"/;
const swifthAppLaunchRE = /(\s*)func\s+application\(\s*_\s*[^}]*\{/;

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
      throw new Error(
        "failed to add the Embrace initialization to the AppDelegate application method",
      );
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

    try {
      const fd = fs.openSync(filePath, "wx");
      fs.writeFileSync(fd, getBridgingHeaderContents());
    } catch (e) {
      if (e instanceof Error && e.message.includes("EEXIST")) {
        // Don't try and overwrite the file if it already exists
        return config;
      } else {
        throw new Error(
          `withIosEmbraceAddBridgingHeader failed to write ${filePath}: ${e}`,
        );
      }
    }

    const projectRelativePath = path.join(projectName, filename);

    if (project.hasFile(projectRelativePath)) {
      return config;
    }

    addFile(project, projectName, projectRelativePath, "source");

    updateBuildProperty(
      project,
      projectName,
      "SWIFT_OBJC_BRIDGING_HEADER",
      projectRelativePath,
    );

    fs.writeFileSync(project.filepath, project.writeSync());

    return config;
  });
};

const withIosEmbrace: ConfigPlugin<EmbraceProps> = (config, props) => {
  try {
    config = withIosEmbraceAddInitializer(config, props);
    config = withIosEmbraceInvokeInitializer(config, props);
    config = withIosEmbraceAddBridgingHeader(config, props);
    /*
  TODO
  - add build phase for uploading source maps
   */
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
  withIosEmbraceAddInitializer,
  withIosEmbraceInvokeInitializer,
  withIosEmbraceAddBridgingHeader,
};
