import {
  ConfigPlugin,
  withDangerousMod,
  withProjectBuildGradle,
  withAppBuildGradle,
  withMainApplication,
  WarningAggregator,
} from "@expo/config-plugins";

import {EmbraceProps} from "./types";

// TODO, fails if using `import` here?
const path = require("path");
const fs = require("fs");

const androidBuildToolsRE = /(\s*)classpath.*com\.android\.tools\.build:gradle/;
const androidPluginRE = /(\s*)apply plugin.*com\.android\.application/;
const importAndroidAppRE = /(\s*)import android\.app\.Application/;
const onCreateRE = /(\s*)super\.onCreate\(\)/;

const hasMatch = (lines: string[], matcher: string) =>
  lines.find(line => line.match(matcher));

const addAfter = (lines: string[], matcher: RegExp, toAdd: string) => {
  let match;
  let matchIndex = 0;
  for (let l = 0; l < lines.length; l++) {
    match = lines[l].match(matcher);
    if (match) {
      matchIndex = l;
      break;
    }
  }
  if (!match) {
    return false;
  }

  const whitespace = match[1];
  lines.splice(matchIndex + 1, 0, `${whitespace}${toAdd}`);

  return true;
};

const withAndroidEmbraceJSONConfig: ConfigPlugin<EmbraceProps> = (
  config,
  props,
) => {
  return withDangerousMod(config, [
    "android",
    async config => {
      const filePath = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "embrace-config.json",
      );

      try {
        fs.writeFileSync(
          filePath,
          JSON.stringify(
            {
              app_id: props.androidAppId,
              api_token: props.apiToken,
              ...props.androidCustomConfig,
            },
            null,
            2,
          ),
        );
      } catch (e) {
        console.error(
          `withAndroidEmbraceJSONConfig failed to write ${filePath}: ${e}`,
        );
      }

      return config;
    },
  ]);
};

const withAndroidEmbraceSwazzlerDependency: ConfigPlugin<
  EmbraceProps
> = config => {
  return withProjectBuildGradle(config, async config => {
    const lines = config.modResults.contents.split("\n");

    // Don't insert the dependency again if it already has it
    if (hasMatch(lines, "embrace-swazzler")) {
      return config;
    }

    // Kotlin and Groovy DSLs require different quote characters:
    // https://developer.android.com/build/migrate-to-kotlin-dsl#convert-strings
    const quote = config.modResults.language === "groovy" ? `'` : `"`;

    const success = addAfter(
      lines,
      // Look for a dependency on 'com.android.tools.build:gradle', which all projects should have, so that we can
      // add our own dependency underneath
      androidBuildToolsRE,
      `classpath(${quote}io.embrace:embrace-swazzler:\${findProject(":embrace-io_react-native").properties["emb_android_sdk"]}${quote})`,
    );

    if (!success) {
      throw new Error(
        "failed to insert a dependency for the Embrace Swazzler in the project's gradle file",
      );
    }

    config.modResults.contents = lines.join("\n");
    return config;
  });
};

const withAndroidEmbraceApplySwazzlerPlugin: ConfigPlugin<
  EmbraceProps
> = config => {
  return withAppBuildGradle(config, async config => {
    const lines = config.modResults.contents.split("\n");

    // Don't add the apply plugin line again if it's already there
    if (hasMatch(lines, "embrace-swazzler")) {
      return config;
    }

    const success = addAfter(
      lines,
      // Look for the 'com.android.application' plugin being applied, which all projects should do, so that we can
      // apply our plugin underneath
      androidPluginRE,
      // TODO, is there different syntax here if it's a kts file?
      'apply plugin: "embrace-swazzler"',
    );

    if (!success) {
      throw new Error(
        "failed to apply the Embrace Swazzler plugin in the project's app gradle file",
      );
    }

    config.modResults.contents = lines.join("\n");
    return config;
  });
};

const withAndroidEmbraceOnCreate: ConfigPlugin<EmbraceProps> = config => {
  return withMainApplication(config, config => {
    const lines = config.modResults.contents.split("\n");
    const language = config.modResults.language;

    // Don't add the Embrace initialize line again if it's already there
    if (hasMatch(lines, "Embrace")) {
      return config;
    }

    const addedImport = addAfter(
      lines,
      // Look for the import of android.app.Application which should happen in the MainApplication file
      // and add our import underneath
      importAndroidAppRE,
      `import io.embrace.android.embracesdk.Embrace${language === "java" ? ";" : ""}`,
    );

    if (!addedImport) {
      throw new Error(
        "failed to add the Embrace import to the MainApplication file",
      );
    }

    const addedInit = addAfter(
      lines,
      // Want the Embrace SDK initialization to happen right after the super.OnCreate() call in the
      // Application.onCreate() method
      onCreateRE,
      `Embrace.getInstance().start(this, false, Embrace.AppFramework.REACT_NATIVE)${language === "java" ? ";" : ""}`,
    );

    if (!addedInit) {
      throw new Error(
        "failed to add the Embrace initialization to the MainApplication onCreate method",
      );
    }

    config.modResults.contents = lines.join("\n");
    return config;
  });
};

const withAndroidEmbrace: ConfigPlugin<EmbraceProps> = (config, props) => {
  try {
    config = withAndroidEmbraceJSONConfig(config, props);
    config = withAndroidEmbraceSwazzlerDependency(config, props);
    config = withAndroidEmbraceApplySwazzlerPlugin(config, props);
    config = withAndroidEmbraceOnCreate(config, props);
  } catch (e) {
    WarningAggregator.addWarningAndroid(
      "@embrace-io/expo-config-plugin",
      e instanceof Error ? e.message : "",
      "https://embrace.io/docs/react-native/integration/add-embrace-sdk/",
    );
  }

  return config;
};

export default withAndroidEmbrace;
export {
  withAndroidEmbraceJSONConfig,
  withAndroidEmbraceSwazzlerDependency,
  withAndroidEmbraceApplySwazzlerPlugin,
  withAndroidEmbraceOnCreate,
};