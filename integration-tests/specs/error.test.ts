import {driver} from "@wdio/globals";
import {getSessionPayloads} from "../helpers/embrace_server";
import {getCurrentSessionId, getLastSessionEndState} from "../helpers/session";
import {countSpanAttributes, SpanEventAttributes} from "../helpers/span_util";
import {PACKAGE} from "../wdio.conf";
import {iterateAndClickArrayButton} from "../helpers/loop_arrays";
import {SpanEventExpectedRequest, countSpanEvent} from "../helpers/span_util";
import {getCurrentPlatform} from "../helpers/platform";
import {getAttributesNameByCurrentPlatform} from "../helpers/attributes";

const COMMON_ATTRIBUTES_NAME = getAttributesNameByCurrentPlatform()
const platform = getCurrentPlatform();


const validateForAndroid = (sessionPayloads, attributesToFind) => {
  const {Logs} = sessionPayloads;
  expect(Logs.length).toBe(1);
  const [log] = Logs;
  expect(log.data.logs.length).toBe(1);
  const {severity_text, attributes} = log.data.logs[0];
  expect(severity_text.toUpperCase()).toBe("ERROR");
  const hasErrorMessage = attributes.find(
    ({key, value}) =>
      key === "exception.message" &&
      value.includes("A SIMPLE CRASH") &&
      value.includes("handleCrashMe"),
  );
  expect(!!hasErrorMessage).toBe(true);
  attributesToFind["emb.send_immediately"] = "true";
  attributesToFind["emb.type"] =
    "com.facebook.react.common.JavascriptException";
  attributesToFind["emb.type"] = "sys.android.react_native_crash";

  const itemCountersSpansLogsAttributesResponse = countSpanAttributes(
    attributesToFind,
    attributes,
  );
  expect(itemCountersSpansLogsAttributesResponse).toBe("COUNT");
};

type SEVERITY_ERRORS_KEYS = "FATAL" | "ERROR";
type SEVERITY_ERRORS_OBJECT = {
  [key in SEVERITY_ERRORS_KEYS]: {
    key: string;
    hasFound: boolean;
  };
};
const SEVERITY_ERRORS: SEVERITY_ERRORS_OBJECT = {
  FATAL: {key: "emb.payload", hasFound: false},
  ERROR: {key: "emb.ios.react_native_crash.js_exception", hasFound: false},
};

const validateForIOS = (sessionPayloads, attributesToFind) => {
  const {Logs} = sessionPayloads;
  expect(Logs.length).toBe(2);

  Logs.forEach(log => {
    expect(log.data.logs.length).toBe(1);
    const {severity_text, attributes} = log.data.logs[0];

    const objectBySeverity = SEVERITY_ERRORS[severity_text];

    expect(!!objectBySeverity).toBe(true);

    objectBySeverity.hasFound = true;
    const hasErrorMessage = attributes.find(({key, value}) => {
      return (
        key === objectBySeverity.key &&
        value.includes("A SIMPLE CRASH") &&
        value.includes("handleCrashMe")
      );
    });
    expect(!!hasErrorMessage).toBe(true);

    const itemCountersSpansLogsAttributesResponse = countSpanAttributes(
      attributesToFind,
      attributes,
    );

    expect(itemCountersSpansLogsAttributesResponse).toBe("COUNT");
  });
  Object.values(SEVERITY_ERRORS).forEach(value => {
    expect(value.hasFound).toBe(true);
  });
};
const VALIDATE_FUNCTIONS = {
  android: validateForAndroid,
  iOS: validateForIOS,
};

describe("Session data - Errors", () => {
  it("should display the correct error message", async () => {
    const currentSessionId = await getCurrentSessionId(driver);
    const crashMe = await driver.$("~CRASH ME");
    await crashMe.click();
    await new Promise(r => setTimeout(r, 1000));
    await driver.execute("mobile: activateApp", {
      appId: PACKAGE,
      bundleId: PACKAGE,
    });
    await new Promise(r => setTimeout(r, 5000));
    const sessionPayloads = await getSessionPayloads(currentSessionId);
    sessionPayloads.Logs.forEach(r => {
      console.log("log", r.data.logs, r.data.logs.attributes);
    });

    const attributesToFind: SpanEventAttributes = {
      "emb.state": "foreground",
    };
    attributesToFind[COMMON_ATTRIBUTES_NAME.session_id]= currentSessionId

    VALIDATE_FUNCTIONS[platform](sessionPayloads, attributesToFind);
  });
  it("should display crash exit after an app crashed", async () => {
    await driver.execute("mobile: backgroundApp", {seconds: 2});

    const lastExitRunStateBeforeCrash = await getLastSessionEndState(driver);
    expect(lastExitRunStateBeforeCrash).toBe("CLEAN_EXIT");

    const crashMe = await driver.$("~CRASH ME");
    await crashMe.click();

    await new Promise(r => setTimeout(r, 1000));

    // This is to avoid the alert that ask that ask to close the app or wait
    await driver.terminateApp(PACKAGE);

    await driver.execute("mobile: activateApp", {
      appId: PACKAGE,
      bundleId: PACKAGE,
    });
    await new Promise(r => setTimeout(r, 1000));
    const lastExitRunStateAfterCrash = await getLastSessionEndState(driver);
    expect(lastExitRunStateAfterCrash).toBe("CRASH");
  });
  it("should set session and span with status Error", async () => {
    const currentSessionId = await getCurrentSessionId(driver);

    await iterateAndClickArrayButton(["~CRASH ME"]);

    await new Promise(r => setTimeout(r, 2000));

    // This is to avoid the alert that ask that ask to close the app or wait
    await driver.terminateApp(PACKAGE);

    await driver.execute("mobile: activateApp", {
      appId: PACKAGE,
      bundleId: PACKAGE,
    });

    await new Promise(r => setTimeout(r, 1000));

    // This is needed because spans are not being sent if I terminate the app
    await driver.execute("mobile: backgroundApp", {seconds: -1});

    await new Promise(r => setTimeout(r, 2000));

    const sessionPayloads = await getSessionPayloads(currentSessionId);

    const {
      data: {spans},
    } = sessionPayloads.Spans[0];

    const itemCountersSpansRequest: SpanEventExpectedRequest = {
      "emb-session": {
        expectedInstances: 1,
        attributes: {
          "emb.cold_start": "true",
          "emb.state": "foreground",
          "emb.type": "ux.session",
          "emb.clean_exit": "false",
        },
      },
    };

    itemCountersSpansRequest["emb-session"].attributes[COMMON_ATTRIBUTES_NAME.session_id]= currentSessionId

    if (platform === "android") {
      const session = itemCountersSpansRequest["emb-session"];
      session.attributes["emb.error_code"] = "failure";
      session.attributes["emb.termination_cause"] = "crash";
      session.status = "Error";
    }

    const itemCountersSpansResponse = countSpanEvent(
      spans,
      itemCountersSpansRequest,
    );

    const responseValues = Object.values(itemCountersSpansResponse);
    expect(responseValues.length).toBe(
      Object.values(itemCountersSpansRequest).length,
    );

    responseValues.forEach(({request, response}) => {
      expect(response.found).toBe(request.expectedInstances);
    });
  });
});
