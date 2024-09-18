export {};

const fs = require("fs");

const packageJSON = require("./package.json");

fs.writeFileSync(
  "android/gradle.properties",
  `emb_android_sdk=${packageJSON.embrace.androidVersion}`,
);
