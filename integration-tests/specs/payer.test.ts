import {driver} from "@wdio/globals";
import {getSessionPayloads} from "../helpers/embrace_server";
import {SpanEventExpectedRequest, countSpanEvent} from "../helpers/span_util";
import {getCurrentSessionId} from "../helpers/session";

describe("Session data - Payer", () => {
  it("should display the payer data", async () => {
    const currentSessionId = await getCurrentSessionId(driver);

    const setUserAsPayer = await driver.$("~ADD PAYER");
    await setUserAsPayer.click();

    await new Promise(r => setTimeout(r, 5000));

    // This is needed because spand are not being sent if I terminate the app
    await driver.execute("mobile: backgroundApp", {seconds: 1});
    await new Promise(r => setTimeout(r, 2000));

    const sessionPayloads = await getSessionPayloads(currentSessionId);

    expect(sessionPayloads.Events.length).toBe(2);
    sessionPayloads.Events.forEach(({event, application, user}) => {
      const {state, session_id, name} = event;
      expect(state).toBe("foreground");
      expect(session_id).toBe(currentSessionId);
      if (!application && name === "_startup") {
        expect(!!user).toBe(true);
        const {personas} = user;
        expect(personas.includes("payer")).toBe(true);
      }
    });

    expect(sessionPayloads.Spans.length).toBe(1);

    const {
      data: {spans},
    } = sessionPayloads.Spans[0];

    const itemCountersSpansRequest: SpanEventExpectedRequest = {
      "emb-session": {
        expectedInstances: 1,
        attributes: {
          "emb.usage.set_user_as_payer": "1",
          "emb.session_id": currentSessionId,
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
  it("should not display the payer data", async () => {
    const currentSessionId = await getCurrentSessionId(driver);

    const setUserAsPayer = await driver.$("~ADD PAYER");
    await setUserAsPayer.click();

    await new Promise(r => setTimeout(r, 500));

    const cleanUserAsPayer = await driver.$("~CLEAN PAYER");
    await cleanUserAsPayer.click();

    await new Promise(r => setTimeout(r, 5000));

    // This is needed because spand are not being sent if I terminate the app
    await driver.execute("mobile: backgroundApp", {seconds: 1});
    await new Promise(r => setTimeout(r, 2000));

    const sessionPayloads = await getSessionPayloads(currentSessionId);

    expect(sessionPayloads.Events.length).toBe(2);
    sessionPayloads.Events.forEach(({event, application, user}) => {
      const {state, session_id, name} = event;
      expect(state).toBe("foreground");
      expect(session_id).toBe(currentSessionId);
      if (!application && name === "_startup") {
        expect(!!user).toBe(true);
        const {personas} = user;
        expect(personas.includes("payer")).toBe(false);
      }
    });

    expect(sessionPayloads.Spans.length).toBe(1);

    const {
      data: {spans},
    } = sessionPayloads.Spans[0];

    const itemCountersSpansRequest: SpanEventExpectedRequest = {
      "emb-session": {
        expectedInstances: 1,
        attributes: {
          "emb.usage.set_user_as_payer": "1",
          "emb.usage.clear_user_as_payer": "1",
          "emb.session_id": currentSessionId,
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
