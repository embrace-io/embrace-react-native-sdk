import {driver} from "@wdio/globals";
import {getSessionPayloads} from "../helpers/embrace_server";

describe("Sessions", () => {
  it("should be recorded as foreground", async () => {
    const currentSessionId = await getCurrentSessionId(driver);

    const sessionPayloads = await getSessionPayloads(driver);

    expect(sessionPayloads).toHaveLength(1);
    if (sessionPayloads.length > 0) {
      expect(sessionPayloads[0].as).toBe("foreground");
    }
  });
});
