import {driver} from "@wdio/globals";

import {getSessionPayloads} from "../helpers/embrace_server";
import {SpanEventExpectedRequest, countSpanEvent} from "../helpers/span_util";
import {getCurrentSessionId} from "../helpers/session";
import {PACKAGE} from "../wdio.conf";

describe("Sessions", () => {
  it("should be recorded as foreground", async () => {
    const currentSessionId = await getCurrentSessionId(driver);

    await driver.terminateApp(PACKAGE);
    await new Promise(r => setTimeout(r, 1000));

    const sessionPayloads = await getSessionPayloads(currentSessionId);

    expect(sessionPayloads.Events.length).toBe(1);
    expect(sessionPayloads.Spans.length).toBe(0);
    sessionPayloads.Events.forEach(event => {
      expect(event.event.state).toBe("foreground");
    });
  });

  it("should record 2 sessions as foreground - moving the first session to background - just initialized one", async () => {
    const sessionIds = [];
    const firstSessionId = await getCurrentSessionId(driver);
    sessionIds.push(firstSessionId);

    await driver.execute("mobile: backgroundApp", {seconds: 5});

    // Just to refresh the session id
    const refreshSessionId = await driver.$("~REFRESH SESSION ID");
    await refreshSessionId.click();

    const secondSessionId = await getCurrentSessionId(driver);
    sessionIds.push(secondSessionId);

    await driver.terminateApp(PACKAGE);

    const sessionPayloads = await getSessionPayloads(sessionIds);

    await new Promise(r => setTimeout(r, 1000));

    expect(sessionPayloads.Events.length).toBe(2);

    sessionPayloads.Events.forEach(event => {
      expect(event.event.state).toBe("foreground");
    });

    const firstSessionEventDataList = sessionPayloads.Events.filter(
      e => e.event.session_id === firstSessionId,
    );
    expect(firstSessionEventDataList.length).toBe(1);

    const secondSessionEventDataList = sessionPayloads.Events.filter(
      e => e.event.session_id === secondSessionId,
    );
    expect(secondSessionEventDataList.length).toBe(1);

    expect(sessionPayloads.Spans.length).toBe(1);
    const span = sessionPayloads.Spans[0];
    const sdkInitialized = span.data.spans.filter(
      span => span.name === "emb-sdk-init",
    );
    expect(sdkInitialized.length).toBe(1);
  });
  it("should record basic information", async () => {
    const currentSessionId = await getCurrentSessionId(driver);
    // This is needed because spand are not being sent if I terminate the app
    await driver.execute("mobile: backgroundApp", {seconds: 1});
    await new Promise(r => setTimeout(r, 2000));

    const sessionPayloads = await getSessionPayloads(currentSessionId);

    expect(sessionPayloads.Events.length).toBe(1);

    const {
      event: {state, session_id},
    } = sessionPayloads.Events[0];

    expect(state).toBe("foreground");
    expect(session_id).toBe(currentSessionId);

    expect(sessionPayloads.Spans.length).toBe(1);
    const {
      data: {spans},
    } = sessionPayloads.Spans[0];

    const itemCountersSpansRequest: SpanEventExpectedRequest = {
      "emb-sdk-init": {expectedInstances: 1},
      "emb-session": {
        expectedInstances: 1,
        attributes: {
          "emb.session_id": currentSessionId,
          "emb.cold_start": "true",
          "emb.clean_exit": "true",
          "emb.type": "ux.session",
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
  it("should record basic snapshot information", async () => {
    const currentSessionId = await getCurrentSessionId(driver);
    // This is needed because spand are not being sent if I terminate the app
    await driver.execute("mobile: backgroundApp", {seconds: 1});
    await new Promise(r => setTimeout(r, 2000));

    const sessionPayloads = await getSessionPayloads(currentSessionId);

    expect(sessionPayloads.Events.length).toBe(1);

    const {
      event: {state, session_id},
    } = sessionPayloads.Events[0];

    expect(state).toBe("foreground");
    expect(session_id).toBe(currentSessionId);

    expect(sessionPayloads.Spans.length).toBe(1);
    const {
      data: {span_snapshots},
    } = sessionPayloads.Spans[0];

    const itemCountersSpansSnapshotRequest: SpanEventExpectedRequest = {
      "emb-session": {expectedInstances: 1},
      "emb-network-status": {expectedInstances: 1},
    };

    const itemCountersSpansSnapshotResponse = countSpanEvent(
      span_snapshots,
      itemCountersSpansSnapshotRequest,
    );

    Object.values(itemCountersSpansSnapshotResponse).forEach(
      ({request, response}) => {
        expect(response.found).toBe(request.expectedInstances);
      },
    );
  });
});
