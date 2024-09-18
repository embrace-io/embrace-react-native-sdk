{
  const fs = require("fs");

  const packageJSON = require("./package.json");

  const gradleFile = "native-src/android/app/dependencies.gradle";

  const contents = fs.readFileSync(gradleFile).toString();
  const updated = contents.replace(
    /(io.embrace:embrace-android-sdk:)\d+.\d+.\d+/,
    `$1${packageJSON.embrace.androidVersion}`,
  );

  fs.writeFileSync(gradleFile, updated);
}
