import {driver} from "@wdio/globals";
import {getSessionPayloads} from "../helpers/embrace_server";
import {SpanEventExpectedRequest, countSpanEvent} from "../helpers/span_util";
import {getCurrentSessionId} from "../helpers/session";
import {getCurrentPlatform} from "../helpers/platform";

const platform = getCurrentPlatform();

const validateSpanPayee = (sessionPayloads, attributesToFind) => {
  expect(sessionPayloads.Spans.length).toBe(1);
  const {
    data: {spans},
  } = sessionPayloads.Spans[0];

  const itemCountersSpansRequest: SpanEventExpectedRequest = {
    "emb-session": {
      expectedInstances: 1,
      attributes: attributesToFind,
    },
  };

  const itemCountersSpansResponse = countSpanEvent(
    spans,
    itemCountersSpansRequest,
  );

  Object.values(itemCountersSpansResponse).forEach(({request, response}) => {
    expect(response.found).toBe(request.expectedInstances);
  });
};

const validateUserPayerForAndroid = (
  sessionPayloads,
  currentSessionId,
  payeeCleaned?,
) => {
  expect(sessionPayloads.Events.length).toBe(2);
  sessionPayloads.Events.forEach(({event, application, user}) => {
    const {state, session_id, name} = event;
    expect(state).toBe("foreground");
    expect(session_id).toBe(currentSessionId);
    if (!application && name === "_startup") {
      expect(!!user).toBe(true);
      const {personas} = user;
      expect(personas.includes("payer")).toBe(!payeeCleaned);
    }
  });
  const attributesToFind = {
    "emb.usage.set_user_as_payer": "1",
    "emb.session_id": currentSessionId,
  };
  if (payeeCleaned) {
    attributesToFind["emb.usage.clear_user_as_payer"] = "1";
  }
  validateSpanPayee(sessionPayloads, attributesToFind);
};

const validateUserPayerForIOS = (
  sessionPayloads,
  currentSessionId,
  payeeCleaned?,
) => {
  expect(sessionPayloads.Events.length).toBe(0);

  validateSpanPayee(sessionPayloads, {
    "emb.session_id": currentSessionId,
  });

  expect(sessionPayloads.Spans.length).toBe(1);

  const {
    metadata: {personas},
  } = sessionPayloads.Spans[0];

  const [persona] = personas;

  if (payeeCleaned) {
    expect(persona).toBe(undefined);
  } else {
    expect(persona).toBe("payer");
  }
};
const VALIDATE_PAYEE_FUNCTIONS = {
  android: validateUserPayerForAndroid,
  iOS: validateUserPayerForIOS,
};
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
    VALIDATE_PAYEE_FUNCTIONS[platform](sessionPayloads, currentSessionId);
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

    VALIDATE_PAYEE_FUNCTIONS[platform](sessionPayloads, currentSessionId, true);
  });
});
