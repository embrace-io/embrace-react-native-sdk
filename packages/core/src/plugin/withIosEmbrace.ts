import {
  ConfigPlugin,
  WarningAggregator,
  // withDangerousMod,
  withXcodeProject,
} from "@expo/config-plugins";

import {addFile} from "./xcodeproj";
import {EmbraceProps} from "./types";

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

const withIosEmbraceAddInitializer: ConfigPlugin<EmbraceProps> = (
  expoConfig,
  props,
) => {
  return withXcodeProject(expoConfig, async config => {
    const project = config.modResults;
    const projectName = config.modRequest.projectName || "";

    const filePath = path.join(
      config.modRequest.platformProjectRoot,
      "EmbraceInitializer.swift",
    );

    try {
      const fd = fs.openSync(filePath, "wx");
      fs.writeFileSync(fd, getEmbraceInitializerContents(props.iOSAppId));
    } catch (e) {
      if (e instanceof Error && e.message.includes("EEXIST")) {
        // Don't try and overwrite the file if it already exists
      } else {
        console.error(
          ` withIosEmbraceWriteInitializer failed to write ${filePath}: ${e}`,
        );
      }
    }

    const projectRelativePath = path.join(
      projectName,
      "EmbraceInitializer.swift",
    );

    if (project.hasFile(projectRelativePath)) {
      console.warn("has file already");
      return config;
    }

    addFile(project, projectName, projectRelativePath, "source");

    fs.writeFileSync(project.filepath, project.writeSync());

    return config;
  });
};

const withIosEmbrace: ConfigPlugin<EmbraceProps> = (config, props) => {
  try {
    config = withIosEmbraceAddInitializer(config, props);
    /*
  TODO
  - invoke EmbraceInitializer.swift in AppDelegate start, add bridging header if needed
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

export {withIosEmbraceAddInitializer};
