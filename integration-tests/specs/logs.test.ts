import {driver} from "@wdio/globals";
import {getSessionPayloads} from "../helpers/embrace_server";
import {getCurrentSessionId} from "../helpers/session";
//TODO See how to import from APP
const LOG_MESSAGE = {
  WARNING: {message: "Warning log (manually triggered)", hasStack: true},
  INFO: {message: "Info log (manually triggered)", hasStack: false},
  ERROR: {message: "Error log (manually triggered)", hasStack: true},
};
const ERROR_STACK_KEY = "emb.stacktrace.rn";

describe("Logs", () => {
  it("should be recorded as foreground", async () => {
    const currentSessionId = await getCurrentSessionId(driver);

    const logAMessage = await driver.$("~LOGS (WAR/INFO/ERROR)");
    await logAMessage.click();
    await new Promise(r => setTimeout(r, 1000));
    const endSession = await driver.$("~END SESSION");
    await endSession.click();

    const sessionPayloads = await getSessionPayloads(currentSessionId);
    expect(sessionPayloads.Events.length).toBe(2);
    expect(sessionPayloads.Logs.length).toBe(1);
    sessionPayloads.Events.forEach(event => {
      expect(event.event.state).toBe("foreground");
    });
    sessionPayloads.Logs.forEach(logAt => {
      const {logs} = logAt.data;
      expect(logs.length).toBe(3);
      logs.forEach(logData => {
        const {severity_text, body, attributes = []} = logData;
        const {message, hasStack} = LOG_MESSAGE[severity_text];
        expect(message).toBe(body);
        const logStack = attributes.find(({key}) => key === ERROR_STACK_KEY);
        expect(hasStack).toBe(!!logStack);
      });
    });
  });
});
