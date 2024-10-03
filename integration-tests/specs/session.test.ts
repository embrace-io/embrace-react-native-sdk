import {driver} from "@wdio/globals";

import {getSessionPayloads} from "../helpers/embrace_server";
import {SpanEventExpectedRequest, countSpanEvent} from "../helpers/span_util";
import {getCurrentSessionId} from "../helpers/session";
import {getCurrentPlatform} from "../helpers/platform";

const platform = getCurrentPlatform();

const validateSession = (sessionPayloads, spansToFind) => {
  expect(sessionPayloads.Spans.length).toBe(1);
  const {
    data: {spans},
  } = sessionPayloads.Spans[0];

  const itemCountersSpansResponse = countSpanEvent(spans, spansToFind);
  Object.values(itemCountersSpansResponse).forEach(({request, response}) => {
    expect(response.found).toBe(request.expectedInstances);
  });
};

const validateSessionForAndroid = (sessionPayloads, spansToFind) => {
  sessionPayloads.Events.forEach(event => {
    expect(event.event.state).toBe("foreground");
  });
  validateSession(sessionPayloads, spansToFind);
};

const validateSessionForIOS = (sessionPayloads, spansToFind) => {
  expect(sessionPayloads.Events.length).toBe(0);

  validateSession(sessionPayloads, spansToFind);
};

const VALIDATE_SESSION_FUNCTIONS = {
  android: validateSessionForAndroid,
  iOS: validateSessionForIOS,
};

describe("Sessions", () => {
  it("should be recorded as foreground", async () => {
    const currentSessionId = await getCurrentSessionId(driver);

    await driver.execute("mobile: backgroundApp", {seconds: 1});
    await new Promise(r => setTimeout(r, 1000));

    const sessionPayloads = await getSessionPayloads(currentSessionId);

    const attributesToFind = {
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
    expect(sessionPayloads.Spans.length).toBe(1);

    VALIDATE_SESSION_FUNCTIONS[platform](sessionPayloads, attributesToFind);
  });

  it("should record 2 sessions as foreground - moving the first session to background - just initialized one", async () => {
    const sessionIds = [];
    const firstSessionId = await getCurrentSessionId(driver);
    sessionIds.push(firstSessionId);

    await driver.execute("mobile: backgroundApp", {seconds: 1});

    const secondSessionId = await getCurrentSessionId(driver);
    sessionIds.push(secondSessionId);

    await driver.execute("mobile: backgroundApp", {seconds: 1});

    const sessionPayloads = await getSessionPayloads(sessionIds);

    await new Promise(r => setTimeout(r, 1000));

    if (platform === "android") {
      const firstSessionEventDataList = sessionPayloads.Events.filter(
        e => e.event.session_id === firstSessionId,
      );
      expect(firstSessionEventDataList.length).toBe(1);

      const secondSessionEventDataList = sessionPayloads.Events.filter(
        e => e.event.session_id === secondSessionId,
      );
      expect(secondSessionEventDataList.length).toBe(1);
    }

    expect(sessionPayloads.Spans.length).toBe(2);

    sessionPayloads.Spans.forEach((span, index) => {
      const embSessions = span.data.spans.filter(
        span => span.name === "emb-session",
      );
      expect(embSessions.length).toBe(1);
      const embSessionId = embSessions[0].attributes.find(
        att => att.key === "emb.session_id",
      );

      const sessionId = sessionIds.find(sId => sId === embSessionId.value);
      const spansToFind: SpanEventExpectedRequest = {
        "emb-session": {
          expectedInstances: 1,
          attributes: {
            "emb.session_id": sessionId,
            "emb.clean_exit": "true",
            "emb.type": "ux.session",
          },
        },
      };

      if (firstSessionId === sessionId) {
        spansToFind["emb-session"].attributes["emb.cold_start"] = "true";
        if (platform === "iOS") {
          spansToFind["emb-sdk-start"] = {expectedInstances: 1};
        } else {
          spansToFind["emb-sdk-init"] = {expectedInstances: 1};
        }
      }

      VALIDATE_SESSION_FUNCTIONS[platform](
        {Events: [], Spans: [span]},
        spansToFind,
      );
    });
  });
  it("should record basic information", async () => {
    const currentSessionId = await getCurrentSessionId(driver);
    // This is needed because spand are not being sent if I terminate the app
    await driver.execute("mobile: backgroundApp", {seconds: 1});
    await new Promise(r => setTimeout(r, 2000));

    const sessionPayloads = await getSessionPayloads(currentSessionId);

    if (platform === "android") {
      expect(sessionPayloads.Events.length).toBe(1);

      const {
        event: {state, session_id},
      } = sessionPayloads.Events[0];

      expect(state).toBe("foreground");
      expect(session_id).toBe(currentSessionId);

      expect(sessionPayloads.Spans.length).toBe(1);
    }

    const spansToFind: SpanEventExpectedRequest = {
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
    if (platform === "iOS") {
      spansToFind["emb-sdk-start"] = {expectedInstances: 1};
    } else {
      spansToFind["emb-sdk-init"] = {expectedInstances: 1};
    }
    expect(sessionPayloads.Spans.length).toBe(1);

    VALIDATE_SESSION_FUNCTIONS[platform](sessionPayloads, spansToFind);
  });
  it("should record basic setup information", async () => {
    const currentSessionId = await getCurrentSessionId(driver);
    // This is needed because spand are not being sent if I terminate the app
    await driver.execute("mobile: backgroundApp", {seconds: 1});
    await new Promise(r => setTimeout(r, 2000));

    const sessionPayloads = await getSessionPayloads(currentSessionId);

    const spansToFind: SpanEventExpectedRequest = {
      "emb-setup": {
        expectedInstances: 1,
        attributes: {
          "emb.private": "true",
          "emb.type": "perf",
        },
      },
    };
    expect(sessionPayloads.Spans.length).toBe(1);

    VALIDATE_SESSION_FUNCTIONS[platform](sessionPayloads, spansToFind);
  });
  it("should record basic process launch information", async () => {
    const currentSessionId = await getCurrentSessionId(driver);
    // This is needed because spand are not being sent if I terminate the app
    await driver.execute("mobile: backgroundApp", {seconds: 1});
    await new Promise(r => setTimeout(r, 2000));

    const sessionPayloads = await getSessionPayloads(currentSessionId);

    const spansToFind: SpanEventExpectedRequest = {
      "emb-process-launch": {
        expectedInstances: 1,
        attributes: {
          "emb.private": "true",
          "emb.type": "perf",
        },
      },
    };
    expect(sessionPayloads.Spans.length).toBe(1);

    VALIDATE_SESSION_FUNCTIONS[platform](sessionPayloads, spansToFind);
  });
});
