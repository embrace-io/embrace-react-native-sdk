// to be removed once we pull this version from `package.json`
// `build.gradle` file in `android` folder is using this version to download the proper Swazzler plugin
{
  const path = require("path");
  const fs = require("fs");

  const packageJSON = require("./package.json");

  const gradlePropertiesPath = path.join("android", "gradle.properties");

  // Read the existing gradle.properties file
  let gradleProperties = fs.readFileSync(gradlePropertiesPath, "utf8");

  // Define the new value for `emb_android_sdk`
  const newAndroidSdkVersion = `emb_android_sdk=${packageJSON.embrace.androidVersion}`;

  // Use a regex to update the existing `emb_android_sdk` value or add it if not present
  if (gradleProperties.includes("emb_android_sdk=")) {
    gradleProperties = gradleProperties.replace(
      /^emb_android_sdk=.*$/m,
      newAndroidSdkVersion,
    );
  } else {
    gradleProperties += `\n${newAndroidSdkVersion}`;
  }

  // Write the updated content back to gradle.properties
  fs.writeFileSync(gradlePropertiesPath, gradleProperties, "utf8");
}
