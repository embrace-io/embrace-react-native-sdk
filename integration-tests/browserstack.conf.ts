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
      deviceName: "iPhone 11",
      platformVersion: "13.0",
      platformName: "ios",
    },
  },
];

exports.config = {
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,

  hostname: "hub.browserstack.com",

  services: [
    [
      "browserstack",
      {
        buildIdentifier: "${DATE_TIME}",
        app: process.env.BROWSERSTACK_APP_PATH,
      },
    ],
  ],

  capabilities:
    process.env.BROWSERSTACK_PLATFORM === "ios"
      ? iosCapabilities
      : androidCapabilities,

  commonCapabilities: {
    "bstack:options": {
      projectName: "Embrace React Native SDK",
      buildName: `embrace-rn-sdk-${process.env.BROWSERSTACK_APP_NAME}-${process.env.BROWSERSTACK_PLATFORM}`,
      testObservability: true,
      debug: true,
      networkLogs: true,
      percy: false,
      percyCaptureMode: "auto",
    },
  },

  maxInstances: 10,

  updateJob: false,
  specs: ["./specs/simple.test.ts"],
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
