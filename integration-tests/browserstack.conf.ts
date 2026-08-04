import { mkdirSync, writeFileSync } from "fs";
import { registerMatchers } from "./helpers/matchers";
import { retrieveStoredRequests, clearStoredRequests } from "./helpers/mock_api";

const runID = process.env.CI_RUN_ID || "local";
const gitRef = process.env.CI_GIT_REF || "local";
const appName = process.env.BROWSERSTACK_APP_NAME;
const platform = process.env.BROWSERSTACK_PLATFORM;
const appPath =
  process.env.BROWSERSTACK_APP_PATH ||
  `${appName}.${platform === "ios" ? "ipa" : "apk"}`;

// This must be set for remote runs, and must match the namespace the app was built with
const namespace = process.env.MOCK_API_NAMESPACE;
if (!namespace) {
  throw new Error(
    "MOCK_API_NAMESPACE is required for remote runs and must match the namespace the app was built with",
  );
}

// Raw payloads behind failed assertions, uploaded as a CI artifact.
const PAYLOAD_DUMP_DIR = "./output/failed-payloads";

const commonCapabilities = {
  "bstack:options": {
    projectName: "Embrace React Native SDK",
    buildIdentifier: gitRef,
    buildName: runID,
    debug: true,
    networkLogs: true,
    appiumVersion: "2.15.0"
  },
}

// For capabilities choose a device that is close to the minimum required OS we support on both Android and iOS
// as well as one that represents the latest supported OS.
// See https://www.browserstack.com/list-of-browsers-and-platforms/app_automate
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
      deviceName: "Samsung Galaxy S20",
      platformVersion: "10.0",
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

const capabilities = platform === "ios" ? iosCapabilities : androidCapabilities;

// Code to support common capabilities
capabilities.forEach(function (caps) {
  for (let key in commonCapabilities)
    caps[key] = { ...caps[key], ...commonCapabilities[key] };
});

export const config: WebdriverIO.Config = {
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,

  hostname: "hub.browserstack.com",

  // TSX custom TSConfig path
  tsConfigPath: "./tsconfig.json",

  services: [
    [
      "browserstack",
      {
        buildIdentifier: "${DATE_TIME}",
        app: appPath,
      },
    ],
  ],

  capabilities,

  // Run workers sequentially
  maxInstances: 1,

  // Nested so the whole suite runs in a single worker and BrowserStack session
  specs: [["./specs/**/*.ts" ]],
  exclude: [],

  logLevel: "info",

  baseUrl: "",
  waitforTimeout: 10000,
  // wdio v9 enforces this as a hard abort on session creation (got->fetch); a
  // timed-out newSession is no longer retried, so give BrowserStack room to allocate.
  // 15 minutes to match browserstack's session timeout - this is the max time a session can be queued before it is aborted.
  connectionRetryTimeout: 900000,
  connectionRetryCount: 3,

  // Delay in seconds between the spec file retry attempts.
  // Low on purpose as wdio also applies it as a pre-start sleep before spawning workers
  specFileRetriesDelay: 5,

  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
    retries: 2,
  },

  reporters: [
    [
      "spec",
      {
        realtimeReporting: true
      }
    ]
  ],

  before() {
    registerMatchers();
  },

  async afterTest(test, _context, {passed}) {
    // If the test failed, dump the failing payloads to a file so they can be uploaded as a CI artifact.
    if (!passed) {
      try {
        const file = `${process.env.WDIO_WORKER_ID} ${test.parent} ${test.title}`.replace(/[^\w-]+/g, "_");
        mkdirSync(PAYLOAD_DUMP_DIR, {recursive: true});
        writeFileSync(
          `${PAYLOAD_DUMP_DIR}/${file}.json`,
          JSON.stringify(await retrieveStoredRequests(namespace), undefined, 2),
        );
      } catch (e) {
        // If the payload dump fails, log the error and move on.
        console.log(`could not dump payloads for "${test.title}": ${e}`);
      }
    }

    // clear the namespace so the next test starts with a clean slate.
    await clearStoredRequests(namespace);
  },

  /**
   * Gets executed before a worker process is spawned and can be used to initialize specific service
   * for that worker as well as modify runtime environments in an async fashion.
   */
  async onWorkerStart(cid) {
    // Our plan allows a single parallel session, so a worker spawned while another session is
    // already queued waits behind it and can hit BrowserStack's 15 minute session-creation timeout
    // (or BROWSERSTACK_QUEUE_SIZE_EXCEEDED). Wait for an empty queue so we are at worst next in line.
    for (let attempt = 0; attempt <= QUEUE_WAIT_RETRIES; attempt++) {
      let plan: BrowserStackPlanDetails;
      try {
        plan = await getPlanDetails();
      } catch (e) {
        // Best effort: if the plan cannot be read, start and let the session queue.
        console.log(
          `could not read the BrowserStack plan, starting worker ${cid} anyway: ${e}`,
        );
        return;
      }

      // allow one queued session at a time
      if (plan.queued_sessions === 0) {
        return;
      }

      console.log(
        `BrowserStack busy (${plan.parallel_sessions_running} running, ${plan.queued_sessions} queued ` +
          `of max ${plan.queued_sessions_max_allowed}), waiting ${QUEUE_WAIT_DELAY_SECONDS}s ` +
          `before starting worker ${cid}`,
      );
      await new Promise(r => setTimeout(r, QUEUE_WAIT_DELAY_SECONDS * 1000));
    }

    console.log(
      `BrowserStack still busy after ${(QUEUE_WAIT_RETRIES * QUEUE_WAIT_DELAY_SECONDS) / 60} minutes, ` +
        `starting worker ${cid} and letting its session queue`,
    );
  },
};

// https://www.browserstack.com/docs/app-automate/api-reference/appium/plan#get-plan-details
interface BrowserStackPlanDetails {
  queued_sessions: number;
  queued_sessions_max_allowed: number;
  parallel_sessions_running: number;
  team_parallel_sessions_max_allowed: number;
}

const browserStackBasicAuth = Buffer.from(
  `${process.env.BROWSERSTACK_USERNAME}:${process.env.BROWSERSTACK_ACCESS_KEY}`,
).toString("base64");

// Poll often enough that we start soon after the queue drains, with a budget that covers the whole
// matrix running sequentially (4 workers at ~5 minutes each).
const QUEUE_WAIT_DELAY_SECONDS = 30;
const QUEUE_WAIT_RETRIES = 40;

const getPlanDetails = async (): Promise<BrowserStackPlanDetails> => {
  const response = await fetch(
    "https://api-cloud.browserstack.com/app-automate/plan.json",
    {
      headers: {
        Authorization: `Basic ${browserStackBasicAuth}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `plan.json failed: ${response.status} ${await response.text()}`,
    );
  }

  return (await response.json()) as BrowserStackPlanDetails;
};
