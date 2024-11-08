// For capabilities choose a device that is close to the minimum required OS we support on both Android and iOS
// as well as one that represents the latest supported OS

const androidCapabilities = [
  {
    "bstack:options": {
      deviceName: "Google Pixel 6 Pro",
      platformVersion: "15.0",
      platformName: "android",
    },
  },
  {
    "bstack:options": {
      deviceName: "Samsung Galaxy S8",
      platformVersion: "7.0",
      platformName: "android",
    },
  },
];

const iosCapabilities = [
  {
    "bstack:options": {
      deviceName: "iPhone 16 Pro",
      platformVersion: "18",
      platformName: "ios",
    },
  },
  {
    "bstack:options": {
      deviceName: "iPhone 14",
      platformVersion: "16",
      platformName: "ios",
    },
  },
];

const runID = process.env.CI_RUN_ID || "local";
const appName = process.env.BROWSERSTACK_APP_NAME;
const platform = process.env.BROWSERSTACK_PLATFORM;
let appPath = process.env.BROWSERSTACK_APP_PATH;
if (!appPath) {
  // Default to the path that is written to when running `./build-test-app.sh`
  if (platform === "android") {
    appPath = `${appName}.apk`;
  } else if (platform === "ios") {
    appPath = `${appName}.ipa`;
  }
}

// TODO
console.log(
  "appName: ",
  appName,
  " platform: ",
  platform,
  " appPath: ",
  appPath,
  "username.length: ",
  (process.env.BROWSERSTACK_USERNAME || "").length,
  "access_key.length: ",
  (process.env.BROWSERSTACK_ACCESS_KEY || "").length,
);

exports.config = {
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,

  hostname: "hub.browserstack.com",

  services: [
    [
      "browserstack",
      {
        buildIdentifier: "${DATE_TIME}",
        app: appPath,
      },
    ],
  ],

  capabilities: platform === "ios" ? iosCapabilities : androidCapabilities,

  commonCapabilities: {
    "bstack:options": {
      projectName: "Embrace React Native SDK",
      buildIdentifier: runID,
      buildName: `embrace-rn-sdk-${appName}-${platform}`,
      buildTag: `${appName}-tag`,
      debug: true,
      networkLogs: true,
    },
  },

  maxInstances: 10,

  updateJob: false,
  specs: ["./specs/simple.test.ts"], // TODO EMBR-4922 point to full test suite
  exclude: [],

  logLevel: "info",
  coloredLogs: true,
  screenshotPath: "./errorShots/",
  baseUrl: "",
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 20000,
  },
};

// Code to support common capabilities
exports.config.capabilities.forEach(function (caps) {
  for (let key in exports.config.commonCapabilities)
    caps[key] = {...caps[key], ...exports.config.commonCapabilities[key]};
});
