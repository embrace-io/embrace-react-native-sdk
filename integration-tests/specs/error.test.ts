import {driver} from "@wdio/globals";
import {getSessionPayloads} from "../helpers/embrace_server";
import {getCurrentSessionId, getLastSessionEndState} from "../helpers/session";
import {SpanEventAttributes, countSpanAttributes} from "../helpers/span_util";
import {PACKAGE} from "../wdio.conf";
import {iterateAndClickArrayButton} from "../helpers/loop_arrays";
import {SpanEventExpectedRequest, countSpanEvent} from "../helpers/span_util";

describe("Session data - Errors", () => {
  it("should display the correct error message", async () => {
    const currentSessionId = await getCurrentSessionId(driver);
    const crashMe = await driver.$("~CRASH ME");
    await crashMe.click();
    await new Promise(r => setTimeout(r, 1000));
    await driver.execute("mobile: activateApp", {appId: PACKAGE});
    await new Promise(r => setTimeout(r, 5000));
    const sessionPayloads = await getSessionPayloads(currentSessionId);
    const {Logs} = sessionPayloads;
    expect(Logs.length).toBe(1);
    const [log] = Logs;
    expect(Logs.length).toBe(1);
    expect(log.data.logs.length).toBe(1);
    const {severity_text, attributes} = log.data.logs[0];
    expect(severity_text).toBe("ERROR");
    const hasErrorMessage = attributes.find(
      ({key, value}) =>
        key === "exception.message" &&
        value.includes("A SIMPLE CRASH") &&
        value.includes("handleCrashMe"),
    );
    expect(!!hasErrorMessage).toBe(true);
    const itemCountersSpansRequest: SpanEventAttributes = {
      "emb.send_immediately": "true",
      "emb.session_id": currentSessionId,
      "emb.state": "foreground",
      "emb.type": "sys.android.react_native_crash",
      "exception.type": "com.facebook.react.common.JavascriptException",
    };
    const itemCountersSpansLogsAttributesResponse = countSpanAttributes(
      itemCountersSpansRequest,
      attributes,
    );
    expect(itemCountersSpansLogsAttributesResponse).toBe("COUNT");
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

    await driver.execute("mobile: activateApp", {appId: PACKAGE});
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

    await driver.execute("mobile: activateApp", {appId: PACKAGE});

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
        status: "Error",
        attributes: {
          "emb.session_id": currentSessionId,
          "emb.cold_start": "true",
          "emb.type": "ux.session",
          "emb.error_code": "failure",
          "emb.termination_cause": "crash",
        },
      },
    };

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
