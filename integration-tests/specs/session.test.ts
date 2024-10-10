import {getSpanPayloads} from "../helpers/embrace_server";
import {endSession, backgroundSessionsEnabled} from "../helpers/session";
import {getAttributeValue} from "../helpers/span";

describe("Sessions", () => {
  it("should be recorded as foreground and background", async () => {
    await endSession();
    const spanPayloads = await getSpanPayloads();

    expect(spanPayloads).toHaveLength(backgroundSessionsEnabled() ? 2 : 1);
    if (spanPayloads.length > 0) {
      expect(getAttributeValue(spanPayloads[0].sessionSpan, "emb.state")).toBe(
        "foreground",
      );
      if (backgroundSessionsEnabled()) {
        expect(
          getAttributeValue(spanPayloads[1].sessionSpan, "emb.state"),
        ).toBe("background");
      }
    }
  });
});
