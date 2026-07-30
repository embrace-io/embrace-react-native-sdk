import { get } from "https";
import { mkdirSync, writeFileSync } from "fs";
import { driver } from "@wdio/globals";
import { registerMatchers } from "./helpers/matchers";
import { retrieveStored } from "./helpers/mock_api";
import { getPayloadSource } from "./helpers/payload_source";
import { currentPlatform } from "./helpers/platform";

// For capabilities choose a device that is close to the minimum required OS we support on both Android and iOS
// as well as one that represents the latest supported OS.
// See https://www.browserstack.com/list-of-browsers-and-platforms/app_automate

const androidCapabilities = [
  {
    "bstack:options": {
      deviceName: "Google Pixel 6 Pro",
      platformVersion: "15.0",
      platformName: "android",
      appiumVersion: "2.15.0"
    },
  },
  {
    "bstack:options": {
      deviceName: "Samsung Galaxy S20",
      platformVersion: "10.0",
      platformName: "android",
      appiumVersion: "2.15.0"
    },
  },
];

const iosCapabilities = [
  {
    "bstack:options": {
      deviceName: "iPhone 16 Pro",
      platformVersion: "18",
      platformName: "ios",
      appiumVersion: "2.15.0"
    },
  },
  {
    "bstack:options": {
      deviceName: "iPhone 14",
      platformVersion: "16",
      platformName: "ios",
      appiumVersion: "2.15.0"
    },
  },
];

const runID = process.env.CI_RUN_ID || "local";
const gitRef = process.env.CI_GIT_REF || "local";
const appName = process.env.BROWSERSTACK_APP_NAME;
const platform = process.env.BROWSERSTACK_PLATFORM;
const appPath =
  process.env.BROWSERSTACK_APP_PATH ||
  `${appName}.${platform === "ios" ? "ipa" : "apk"}`;

// The app under test was built to report to this namespace, so the run has to be told the same
// value. Without it the specs would read an empty local mockserver and fail as a whole.
const namespace = process.env.MOCK_API_NAMESPACE;
if (!namespace) {
  throw new Error(
    "MOCK_API_NAMESPACE is required for remote runs and must match the namespace the app was built with",
  );
}

// Raw payloads behind failed assertions, uploaded as a CI artifact.
const PAYLOAD_DUMP_DIR = "./errorPayloads";

const commonOptions = {
  projectName: "Embrace React Native SDK",
  buildIdentifier: gitRef,
  buildName: runID,
  debug: true,
  networkLogs: true,
  // getPayloads() polls the hosted mock-api for up to 30s with no Appium command in flight,
  // and BrowserStack's default idle timeout is 60s.
  idleTimeout: 300,
};

const capabilities = (platform === "ios" ? iosCapabilities : androidCapabilities)
  // TODO EMBR-13384 restore the second device per platform once the suite is stable on rn82
  .slice(0, 1)
  .map(capability => ({
    "bstack:options": { ...capability["bstack:options"], ...commonOptions },
  }));

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

  // Nested so the whole suite runs in a single worker, and so a single BrowserStack session with
  // one app install - the same shape as a local full-suite run. That makes the order load-bearing:
  //  - session.test.ts first, so the run's one cold start lands on its most tolerant assertion
  //    while its golden-compared breadcrumb test (captured warm) stays the second `it`
  //  - network.test.ts not first, since Android instruments the SDK's own cold-start /v2/config
  //    fetch and it would arrive as an unexpected network span
  //  - tracer_provider.test.ts last, since its after() hook relaunches the app and so produces a
  //    second cold start for whatever follows it
  specs: [
    [
      "./specs/session.test.ts",
      "./specs/logs.test.ts",
      "./specs/navigation.test.ts",
      "./specs/network.test.ts",
      "./specs/redux.test.ts",
      "./specs/user.test.ts",
      "./specs/tracer_provider.test.ts",
    ],
  ],
  exclude: [],

  logLevel: "info",
  baseUrl: "",
  waitforTimeout: 10000,
  // wdio v9 enforces this as a hard abort on session creation (got->fetch); a
  // timed-out newSession is no longer retried, so give BrowserStack room to allocate.
  // 15 minutes to match browserstack's session timeout - this is the max time a session can be queued before it is aborted.
  connectionRetryTimeout: 900000,
  connectionRetryCount: 3,

  // The number of times to retry the entire specfile when it fails as a whole. One grouped worker
  // means a retry re-runs every spec, so keep the worst case at two passes.
  specFileRetries: 1,

  // Delay in seconds between the spec file retry attempts.
  // Low on purpose as wdio also applies it as a pre-start sleep before spawning workers
  specFileRetriesDelay: 5,

  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    // user.test.ts's session-properties test is two endSession() flushes (5.25s each) plus four
    // taps plus a payload fetch, all over BrowserStack round trips.
    timeout: 180000,
  },

  before() {
    registerMatchers();

    // BrowserStack provisions the Appium server and its drivers, so `mobile:` execute methods can
    // be missing here while present locally. Log what we were actually given, since the alternative
    // is inferring the driver version from which commands its errors list as supported.
    console.log(`session capabilities: ${JSON.stringify(driver.capabilities)}`);

    // Golden files are per-platform, so a misresolved platform would surface as a wall of
    // unrelated mismatches rather than as the configuration problem it is.
    if (currentPlatform() !== platform) {
      throw new Error(
        `platform mismatch: driver resolved "${currentPlatform()}", expected "${platform}"`,
      );
    }
  },

  async beforeTest() {
    await getPayloadSource().clear();
  },

  // A remote failure cannot be reproduced locally - the device is gone and the next beforeTest
  // clears the namespace - so keep what the assertion actually saw. Dumped as the raw /stored
  // response, matching golden/remote-response.json, which keeps the arrival timestamps that tell
  // a delivery problem from a behaviour difference.
  async afterTest(test, _context, {passed}) {
    if (passed) {
      return;
    }

    try {
      const file = `${test.parent} ${test.title}`.replace(/[^\w-]+/g, "_");
      mkdirSync(PAYLOAD_DUMP_DIR, {recursive: true});
      writeFileSync(
        `${PAYLOAD_DUMP_DIR}/${file}.json`,
        JSON.stringify(await retrieveStored(namespace), undefined, 2),
      );
    } catch (e) {
      // Never let diagnostics mask the failure they are diagnosing.
      console.log(`could not dump payloads for "${test.title}": ${e}`);
    }
  },

  /**
   * Gets executed before a worker process is spawned and can be used to initialize specific service
   * for that worker as well as modify runtime environments in an async fashion.
   */
  async onWorkerStart() {
    // Dealing w/ BrowserStack throwing BROWSERSTACK_QUEUE_SIZE_EXCEEDED. Per our plan we are only allowed a certain
    // number of tests running in parallel + waiting in queue to be run. If we exceed this browserstack responds with an
    // error when the session is trying to be setup and the suite fails.
    // To help mitigate, before spinning up a new worker check how many are already queued and wait if we're at the max
    let retries = 0;
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
  },
};

// https://www.browserstack.com/docs/app-automate/api-reference/appium/plan#get-plan-details
interface BrowserStackPlanDetails {
  queued_sessions: number;
  queued_sessions_max_allowed: number;
}

const browserStackBasicAuth = Buffer.from(
  `${process.env.BROWSERSTACK_USERNAME}:${process.env.BROWSERSTACK_ACCESS_KEY}`,
).toString("base64");

const QUEUE_FULL_DELAY_SECONDS = 180;
const QUEUE_FULL_RETRIES = 5;

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
