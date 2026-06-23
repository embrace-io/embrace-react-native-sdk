import {
  ConfigPlugin,
  WarningAggregator,
  withAppDelegate,
  withXcodeProject,
  withDangerousMod,
} from "@expo/config-plugins";

import {
  addFile,
  findPhase,
  modifyPhase,
  updateBuildProperty,
} from "./xcodeproj";
import {EmbraceProps} from "./types";
import {ExporterConfig, OTLPExporterConfig} from "../interfaces";
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
const ksCrashConfig = `pod 'KSCrash', :modular_headers => true`;
const embraceLegacyRunScriptPath = "EmbraceIO/run.sh";
const embraceRunScriptPath =
  "${SRCROOT}/../node_modules/@embrace-io/react-native/ios/scripts/run.sh";

const withIosEmbraceAddKSCrashPod: ConfigPlugin = expoConfig => {
  return withDangerousMod(expoConfig, [
    "ios",
    async config => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile",
      );
      const contents = fs.readFileSync(podfilePath, "utf8");

      // do nothing if already present
      if (contents.includes(ksCrashConfig)) {
        return config;
      }

      // Find first "target '...' do"
      const targetRe = /^\s*target\s+'[^']+'\s+do/m;
      const match = contents.match(targetRe);
      if (!match || match.index == null) {
        throw new Error("Could not find a `target '...' do` block in Podfile.");
      }

      const insertAt = match.index;
      const before = contents.slice(0, insertAt).replace(/\s*$/, "\n");
      const after = contents.slice(insertAt);

      const comment = "# [Embrace] Make KSCrash modular so Swift can import it";
      const injected = `${before}${comment} \n${ksCrashConfig}\n\n${after}`;

      fs.writeFileSync(podfilePath, injected);
      return config;
    },
  ]);
};

const escapeSwift = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

// Emits Swift that builds a single OTLP HTTP exporter (trace or log) from config.
const getHttpExporterSwift = (
  varName: string,
  typeName: "OtlpHttpTraceExporter" | "OtlpHttpLogExporter",
  exporter: ExporterConfig,
) => {
  const headersLiteral = (exporter.headers || [])
    .map(h => `("${escapeSwift(h.key)}", "${escapeSwift(h.token)}")`)
    .join(", ");
  const timeoutExpr =
    typeof exporter.timeout === "number"
      ? String(exporter.timeout)
      : "OtlpConfiguration.DefaultTimeoutInterval";

  return `        let ${varName}Headers: [(String, String)] = [${headersLiteral}]
        let ${varName}URLConfig = URLSessionConfiguration.default
        ${varName}URLConfig.httpAdditionalHeaders = Dictionary(uniqueKeysWithValues: ${varName}Headers)
        let ${varName} = ${typeName}(
            endpoint: URL(string: "${escapeSwift(exporter.endpoint)}")!,
            config: OtlpConfiguration(timeout: ${timeoutExpr}, headers: ${varName}Headers),
            httpClient: BaseHTTPClient(session: URLSession(configuration: ${varName}URLConfig)),
            envVarHeaders: ${varName}Headers
        )`;
};

// Initializer that wires custom OTLP exporters into the *native* Embrace start. The native start
// pre-empts the JS `useEmbrace({exporters})` path on Expo iOS, so exporters must be attached here to
// take effect (while keeping native crash capture). See issue #653.
const getExportingInitializerContents = (
  appId: string,
  exporters: OTLPExporterConfig,
) => {
  const traceSetup = exporters.traceExporter
    ? getHttpExporterSwift(
        "spanExporter",
        "OtlpHttpTraceExporter",
        exporters.traceExporter,
      )
    : "";
  const logSetup = exporters.logExporter
    ? getHttpExporterSwift(
        "logExporter",
        "OtlpHttpLogExporter",
        exporters.logExporter,
      )
    : "";
  const spanArg = exporters.traceExporter ? "spanExporter" : "nil";
  const logArg = exporters.logExporter ? "logExporter" : "nil";

  // Hosts of the OTLP endpoints — excluded from URLSession capture so the exporter's own upload
  // requests aren't instrumented into spans (which would feed back into the exporter). This is the
  // native equivalent of the JS `iOSConfig.disabledUrlPatterns`.
  const ignoredHosts = Array.from(
    new Set(
      [exporters.traceExporter, exporters.logExporter]
        .filter((e): e is ExporterConfig => !!e)
        .map(e => {
          try {
            return new URL(e.endpoint).host;
          } catch {
            return "";
          }
        })
        .filter(Boolean),
    ),
  );
  const ignoredURLsLiteral = ignoredHosts
    .map(h => `"${escapeSwift(h)}"`)
    .join(", ");

  return `import Foundation
import EmbraceIO
import OpenTelemetrySdk
import OpenTelemetryProtocolExporterCommon
import OpenTelemetryProtocolExporterHttp

@objcMembers class EmbraceInitializer: NSObject {
    // Start the EmbraceSDK natively WITH custom OTLP exporters. Wiring exporters here (rather than via
    // JS useEmbrace) is required on Expo iOS because the native start runs at launch and pre-empts the
    // JS start. See https://github.com/embrace-io/embrace-react-native-sdk/issues/653
    static func start() -> Void {
${traceSetup}
${logSetup}
        let export = OpenTelemetryExport(spanExporter: ${spanArg}, logExporter: ${logArg})

        let servicesBuilder = CaptureServiceBuilder()
        servicesBuilder.add(.urlSession(options: URLSessionCaptureService.Options(
            injectTracingHeader: true,
            requestsDataSource: nil,
            ignoredURLs: [${ignoredURLsLiteral}]
        )))
        servicesBuilder.addDefaults()

        do {
            try Embrace
                .setup(
                    options: Embrace.Options(
                        appId: "${appId}",
                        appGroupId: nil,
                        platform: .reactNative,
                        endpoints: nil,
                        captureServices: servicesBuilder.build(),
                        crashReporter: KSCrashReporter(),
                        export: export
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

const getEmbraceInitializerContents = (
  appId: string,
  exporters?: OTLPExporterConfig,
) => {
  if (exporters && (exporters.traceExporter || exporters.logExporter)) {
    return getExportingInitializerContents(appId, exporters);
  }

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
      getEmbraceInitializerContents(props.iOSAppId, props.iOSExporters),
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
    config = withIosEmbraceAddKSCrashPod(config);
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
  withIosEmbraceAddInitializer,
  withIosEmbraceInvokeInitializer,
  withIosEmbraceAddBridgingHeader,
  withIosEmbraceAddUploadPhase,
};
