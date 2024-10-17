import {driver} from "@wdio/globals";
import {getSessionPayloads} from "../helpers/embrace_server";
import {iterateAndClickArrayButton} from "../helpers/loop_arrays";

import {SpanEventExpectedRequest, countSpanEvent} from "../helpers/span_util";
import {getCurrentSessionId} from "../helpers/session";
import {PACKAGE} from "../wdio.conf";

describe("Session data - Spans", () => {
  it("should display a span tracked", async () => {
    const currentSessionId = await getCurrentSessionId(driver);
    const goToSpanTab = await driver.$("~NAVIGATE TO SPANS");
    await goToSpanTab.click();
    await new Promise(r => setTimeout(r, 1000));
    const startSpan1 = await driver.$("~START SPAN PARENT - A");
    await startSpan1.click();
    await new Promise(r => setTimeout(r, 1000));
    const stopSpan1 = await driver.$("~STOP SPAN PARENT - A");
    await stopSpan1.click();
    await new Promise(r => setTimeout(r, 4000));
    // This is needed because spans are not being sent if I terminate the app
    await driver.execute("mobile: backgroundApp", {seconds: 1});
    await new Promise(r => setTimeout(r, 2000));
    const sessionPayloads = await getSessionPayloads(currentSessionId);
    const {
      data: {spans},
    } = sessionPayloads.Spans[0];
    const itemCountersSpansRequest: SpanEventExpectedRequest = {
      "SPAN-PARENT-A": {
        expectedInstances: 1,
        attributes: {
          "emb.type": "perf",
          "emb.key": "true",
          "emb.error_code": undefined,
        },
      },
    };
    const itemCountersSpansResponse = countSpanEvent(
      spans,
      itemCountersSpansRequest,
    );
    Object.values(itemCountersSpansResponse).forEach(({request, response}) => {
      expect(response.found).toBe(request.expectedInstances);
    });
  });
  it("should display 2 span tracked", async () => {
    const currentSessionId = await getCurrentSessionId(driver);
    const goToSpanTab = await driver.$("~NAVIGATE TO SPANS");
    await goToSpanTab.click();
    await iterateAndClickArrayButton([
      "~START SPAN PARENT - A",
      "~START LONELY SPAN",
      "~STOP LONELY SPAN",
      "~STOP SPAN PARENT - A",
    ]);
    await new Promise(r => setTimeout(r, 3000));
    // This is needed because spans are not being sent if I terminate the app
    await driver.execute("mobile: backgroundApp", {seconds: 2});
    await new Promise(r => setTimeout(r, 2000));
    const sessionPayloads = await getSessionPayloads(currentSessionId);
    const {
      data: {spans},
    } = sessionPayloads.Spans[0];

    const itemCountersSpansRequest: SpanEventExpectedRequest = {
      "SPAN-PARENT-A": {
        expectedInstances: 1,
        attributes: {
          "emb.type": "perf",
          "emb.key": "true",
          "emb.error_code": undefined,
        },
      },
      "SPAN-LONELY": {
        expectedInstances: 1,
        attributes: {
          "emb.type": "perf",
          "emb.key": "true",
          "emb.error_code": undefined,
        },
      },
    };
    const itemCountersSpansResponse = countSpanEvent(
      spans,
      itemCountersSpansRequest,
    );
    Object.values(itemCountersSpansResponse).forEach(({request, response}) => {
      expect(response.found).toBe(request.expectedInstances);
    });
  });
  it("should display 1 span with a child", async () => {
    const currentSessionId = await getCurrentSessionId(driver);
    const goToSpanTab = await driver.$("~NAVIGATE TO SPANS");
    await goToSpanTab.click();
    await iterateAndClickArrayButton([
      "~START SPAN PARENT - A",
      "~START SPAN CHILD OF A - PARENT - B",
      "~STOP SPAN CHILD OF A - PARENT - B",
      "~STOP SPAN PARENT - A",
    ]);
    await new Promise(r => setTimeout(r, 3000));
    // This is needed because spans are not being sent if I terminate the app
    await driver.execute("mobile: backgroundApp", {seconds: 2});
    await new Promise(r => setTimeout(r, 2000));
    const sessionPayloads = await getSessionPayloads(currentSessionId);
    const {
      data: {spans},
    } = sessionPayloads.Spans[0];

    const parentSpan = spans.find(sp => sp.name === "SPAN-PARENT-A");
    expect(!!parentSpan).toBe(true);

    const itemCountersSpansRequest: SpanEventExpectedRequest = {
      "SPAN-PARENT-A": {
        expectedInstances: 1,
        attributes: {
          "emb.type": "perf",
          "emb.key": "true",
          "emb.error_code": undefined,
        },
      },
      "SPAN-CHILD-A-B": {
        expectedInstances: 1,
        parentSpanId: parentSpan.span_id,
        attributes: {
          "emb.type": "perf",
          "emb.key": undefined,
          "emb.error_code": undefined,
        },
      },
    };
    const itemCountersSpansResponse = countSpanEvent(
      spans,
      itemCountersSpansRequest,
    );
    Object.values(itemCountersSpansResponse).forEach(({request, response}) => {
      expect(response.found).toBe(request.expectedInstances);
    });
  });
  it("should display a span tracked with failure", async () => {
    const currentSessionId = await getCurrentSessionId(driver);
    const buttonSequence = [
      "~NAVIGATE TO SPANS",
      "~START SPAN PARENT - A",
      "~GO HOME",
      "~CRASH ME",
    ];
    await iterateAndClickArrayButton(buttonSequence);
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
      "SPAN-PARENT-A": {
        expectedInstances: 1,
        attributes: {
          "emb.type": "perf",
          "emb.key": "true",
          "emb.error_code": "failure",
        },
      },
    };
    const itemCountersSpansResponse = countSpanEvent(
      spans,
      itemCountersSpansRequest,
    );
    Object.values(itemCountersSpansResponse).forEach(({request, response}) => {
      expect(response.found).toBe(request.expectedInstances);
    });
  });
  it("should display a span tracked", async () => {
    const currentSessionId = await getCurrentSessionId(driver);

    expect(currentSessionId !== "SESSION_ID_NOT_LOADED").toBe(true);

    const goToSpanTab = await driver.$("~NAVIGATE TO SPANS");
    await goToSpanTab.click();
    await iterateAndClickArrayButton([
      "~START SPAN PARENT - A",
      "~START SPAN CHILD OF A - PARENT - B",
      "~START SPAN CHILD OF B",
      "~STOP SPAN CHILD OF B",
      "~STOP SPAN CHILD OF A - PARENT - B",
      "~STOP SPAN PARENT - A",
    ]);
    await new Promise(r => setTimeout(r, 3000));
    // This is needed because spans are not being sent if I terminate the app
    await driver.execute("mobile: backgroundApp", {seconds: 2});

    await new Promise(r => setTimeout(r, 2000));
    const sessionPayloads = await getSessionPayloads(currentSessionId);
    const {
      data: {spans},
    } = sessionPayloads.Spans[0];

    const parentSpan = spans.find(sp => sp.name === "SPAN-PARENT-A");
    expect(!!parentSpan).toBe(true);

    const firstChildSpan = spans.find(sp => sp.name === "SPAN-CHILD-A-B");
    expect(!!firstChildSpan).toBe(true);
    const itemCountersSpansRequest: SpanEventExpectedRequest = {
      "SPAN-PARENT-A": {
        expectedInstances: 1,
        attributes: {
          "emb.type": "perf",
          "emb.key": "true",
          "emb.error_code": undefined,
        },
      },
      "SPAN-CHILD-A-B": {
        expectedInstances: 1,
        parentSpanId: parentSpan.span_id,
        attributes: {
          "emb.type": "perf",
          "emb.error_code": undefined,
        },
      },
      "SPAN-A-CHILD-B": {
        expectedInstances: 1,
        parentSpanId: firstChildSpan.span_id,
        attributes: {
          "emb.type": "perf",
          "emb.error_code": undefined,
        },
      },
    };
    const itemCountersSpansResponse = countSpanEvent(
      spans,
      itemCountersSpansRequest,
    );
    Object.values(itemCountersSpansResponse).forEach(({request, response}) => {
      expect(response.found).toBe(request.expectedInstances);
    });
  });
  it("should display 1 span parent and two child tracked", async () => {
    const currentSessionId = await getCurrentSessionId(driver);
    const goToSpanTab = await driver.$("~NAVIGATE TO SPANS");
    await goToSpanTab.click();
    await iterateAndClickArrayButton([
      "~START SPAN PARENT - A",
      "~START SPAN CHILD OF A - PARENT - B",
      "~START SECOND SPAN CHILD OF A",
      "~STOP SECOND SPAN CHILD OF A",
      "~STOP SPAN CHILD OF A - PARENT - B",
      "~STOP SPAN PARENT - A",
    ]);
    await new Promise(r => setTimeout(r, 3000));
    // This is needed because spans are not being sent if I terminate the app
    await driver.execute("mobile: backgroundApp", {seconds: 2});
    await new Promise(r => setTimeout(r, 2000));
    const sessionPayloads = await getSessionPayloads(currentSessionId);
    const {
      data: {spans},
    } = sessionPayloads.Spans[0];
    const parentSpan = spans.find(sp => sp.name === "SPAN-PARENT-A");
    expect(!!parentSpan).toBe(true);

    const firstChildSpan = spans.find(sp => sp.name === "SPAN-CHILD-A-B");

    const itemCountersSpansRequest: SpanEventExpectedRequest = {
      "SPAN-PARENT-A": {
        expectedInstances: 1,
        attributes: {
          "emb.type": "perf",
          "emb.key": "true",
          "emb.error_code": undefined,
        },
      },
      "SPAN-CHILD-A-B": {
        expectedInstances: 1,
        parentSpanId: parentSpan.span_id,
        attributes: {
          "emb.type": "perf",
          "emb.error_code": undefined,
        },
      },
      "SPAN-CHILD-A-2": {
        expectedInstances: 1,
        parentSpanId: firstChildSpan.span_id,
        attributes: {
          "emb.type": "perf",
          "emb.error_code": undefined,
        },
      },
    };
    const itemCountersSpansResponse = countSpanEvent(
      spans,
      itemCountersSpansRequest,
    );
    Object.values(itemCountersSpansResponse).forEach(({request, response}) => {
      expect(response.found).toBe(request.expectedInstances);
    });
  });
});
