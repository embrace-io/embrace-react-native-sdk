import {getLogPayloads} from "../helpers/embrace_mock_api";
import {endSession} from "../helpers/session";
import {EMBRACE_INTERNAL_LOG_SEVERITY_NUMBER} from "../helpers/log";
import {ACTION_BUTTONS} from "../helpers/action";

describe("Logs", () => {
  it("should 3 logs (error | info | warn) be recorded as foreground", async () => {
    await ACTION_BUTTONS.LOG.INFO();
    await ACTION_BUTTONS.LOG.ERROR();
    await ACTION_BUTTONS.LOG.WARN();
    await new Promise(r => setTimeout(r, 1000));
    await endSession();

    const logPayloads = await getLogPayloads();
    expect(logPayloads).toHaveLength(1);
    const [logPayload] = logPayloads;

    Object.values(EMBRACE_INTERNAL_LOG_SEVERITY_NUMBER).forEach(logSeverity =>
      expect(logPayload[logSeverity]).toHaveLength(1),
    );
  });
});
