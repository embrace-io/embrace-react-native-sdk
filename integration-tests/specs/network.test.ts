import {driver} from "@wdio/globals";
import {getSessionPayloads} from "../helpers/embrace_server";
import {SpanEventExpectedRequest, countSpanEvent} from "../helpers/span_util";
import {getCurrentSessionId} from "../helpers/session";
import {getCurrentPlatform} from "../helpers/platform";

const platform = getCurrentPlatform();

const DATA_BY_PLATFORM = {
  android: {
    eventName:"emb-POST /namespace/SgNw5/api/v1/log/events",
    url:"https://mock-api.emb-eng.com/namespace/SgNw5/api/v1/log/events"
  },
  iOS: {
    eventName:"POST /namespace/SgNw5/api/v2/spans",
    url:"https://mock-api.emb-eng.com/namespace/SgNw5/api/v2/spans"
  },
};


describe("Session Network - Android", () => {
  it("should record a POST API CALL", async () => {
    const currentSessionId = await getCurrentSessionId(driver);
    // This is needed because spand are not being sent if I terminate the app
    await driver.execute("mobile: backgroundApp", {seconds: 1});
    await new Promise(r => setTimeout(r, 2000));

    const sessionPayloads = await getSessionPayloads(currentSessionId);

    expect(sessionPayloads.Spans.length).toBe(1);
    const {
      data: {spans},
    } = sessionPayloads.Spans[0];

    const {eventName, url} = DATA_BY_PLATFORM[platform]
    const itemCountersSpansSnapshotRequest: SpanEventExpectedRequest = {};
    itemCountersSpansSnapshotRequest[eventName]={
      expectedInstances: 1,
      attributes: {
        "http.request.method": "POST",
        "http.response.status_code": "200",
        "emb.type": "perf.network_request",
        "url.full":
        url
      }
    }

    const itemCountersSpansSnapshotResponse = countSpanEvent(
      spans,
      itemCountersSpansSnapshotRequest,
    );

    Object.values(itemCountersSpansSnapshotResponse).forEach(
      ({request, response}) => {
        expect(response.found).toBe(request.expectedInstances);
      },
    );
  });
});
