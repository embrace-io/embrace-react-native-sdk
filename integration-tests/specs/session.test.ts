import {getSpanPayloads} from "../helpers/embrace_server";
import {endSession} from "../helpers/session";
import {getAttributeValue} from "../helpers/span";

describe("Sessions", () => {
  it("should be recorded as foreground", async () => {
    await endSession();
    const spanPayloads = await getSpanPayloads();

    expect(spanPayloads).toHaveLength(1);
    if (spanPayloads.length > 0) {
      expect(getAttributeValue(spanPayloads[0].sessionSpan, "emb.state")).toBe("foreground");
    }
  });
});
