import {get} from "https";

// For capabilities choose a device that is close to the minimum required OS we support on both Android and iOS
// as well as one that represents the latest supported OS.
// See https://www.browserstack.com/list-of-browsers-and-platforms-page/app_automate

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
const appPath =
  process.env.BROWSERSTACK_APP_PATH ||
  `${appName}.${platform === "ios" ? "ipa" : "apk"}`;

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

/*
  Dealing w/ BrowserStack throwing BROWSERSTACK_QUEUE_SIZE_EXCEEDED. Per our plan we are only allowed a certain
  number of tests running in parallel + waiting in queue to be run. If we exceed this browserstack responds with an
  error when the session is trying to be setup and the suite fails.
  To help mitigate:
     1) Before spinning up a new worker check how many are already queued and wait if we're at the max
     2) Up specFileRetries + specFileRetriesDelay in case we still get a collision on the last slot
 */

// The number of times to retry the entire specfile when it fails as a whole
exports.config.specFileRetries = 1;

// Delay in seconds between the spec file retry attempts
exports.config.specFileRetriesDelay = 60;

// https://www.browserstack.com/docs/app-automate/api-reference/appium/plan#get-plan-details
interface BrowserStackPlanDetails {
  queued_sessions: number;
  queued_sessions_max_allowed: number;
}

const browserStackBasicAuth = Buffer.from(
  `${process.env.BROWSERSTACK_USERNAME}:${process.env.BROWSERSTACK_ACCESS_KEY}`,
).toString("base64");

const QUEUE_FULL_DELAY_SECONDS = 120;
const QUEUE_FULL_RETRIES = 3;
const QUEUE_JITTER_SECONDS = 5;

/**
 * Gets executed before a worker process is spawned and can be used to initialize specific service
 * for that worker as well as modify runtime environments in an async fashion.
 * @param  {string} cid      capability id (e.g 0-0)
 * @param  {object} caps     object containing capabilities for session that will be spawn in the worker
 * @param  {object} specs    specs to be run in the worker process
 * @param  {object} args     object that will be merged with the main configuration once worker is initialized
 * @param  {object} execArgv list of string arguments passed to the worker process
 */
exports.config.onWorkerStart = async () => {
  let retries = 0;

  // Add some randomness around checking the queue size to deal with multiple workers claiming the same slot
  await new Promise(r =>
    setTimeout(r, QUEUE_JITTER_SECONDS * 1000 * Math.random()),
  );

  while (true) {
    const queueSlots = await getQueueSlots();
    if (queueSlots > 0) {
      break;
    }

    retries += 1;
    if (retries > QUEUE_FULL_RETRIES) {
      break;
    }

    console.log(
      `No available slots in BrowserStack queue, waiting ${QUEUE_FULL_DELAY_SECONDS} seconds`,
    );
    await new Promise(r => setTimeout(r, QUEUE_FULL_DELAY_SECONDS * 1000));
  }
};

const getQueueSlots = async (): Promise<number> => {
  return new Promise<number>((resolve, reject) => {
    get(
      "https://api-cloud.browserstack.com/app-automate/plan.json",
      {
        headers: {
          Authorization: `Basic ${browserStackBasicAuth}`,
        },
      },
      res => {
        let data = "";
        res.on("data", chunk => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const parsed: BrowserStackPlanDetails = JSON.parse(data);
            resolve(
              parsed.queued_sessions_max_allowed - parsed.queued_sessions,
            );
          } catch (e) {
            reject(e);
          }
        });
      },
    );
  });
};
