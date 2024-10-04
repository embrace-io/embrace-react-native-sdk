import {driver} from "@wdio/globals";
import {getSessionPayloads} from "../helpers/embrace_server";
import {getCurrentSessionId} from "../helpers/session";
import {SpanEventExpectedRequest, countSpanEvent} from "../helpers/span_util";

describe("Breadcrumbs", () => {
  it("should record a simple breadcrumb", async () => {
    const currentSessionId = await getCurrentSessionId(driver);
    const addBreadcrumb = await driver.$("~A SIMPLE BREADCRUMB");
    await addBreadcrumb.click();
    // This is needed because spand are not being sent if I terminate the app
    await driver.execute("mobile: backgroundApp", {seconds: 1});
    await new Promise(r => setTimeout(r, 2000));

    const sessionPayloads = await getSessionPayloads(currentSessionId);

    expect(sessionPayloads.Spans.length).toBe(1);
    const {
      data: {spans},
    } = sessionPayloads.Spans[0];

    const itemCountersSpansRequest: SpanEventExpectedRequest = {
      "emb-session": {
        expectedInstances: 1,
        events: [
          {
            "emb-breadcrumb": {
              expectedInstances: 1,
              attributes: {
                message: "A SIMPLE BREADCRUMB",
                "emb.type": "sys.breadcrumb",
              },
            },
          },
        ],
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
    console.log("FF", itemCountersSpansResponse);

    Object.values(itemCountersSpansResponse).forEach(({request, response}) => {
      expect(response.found).toBe(request.expectedInstances);
    });
  });

  it("should record two simple breadcrumb", async () => {
    const currentSessionId = await getCurrentSessionId(driver);
    const addBreadcrumb = await driver.$("~A SIMPLE BREADCRUMB");
    await addBreadcrumb.click();
    await new Promise(r => setTimeout(r, 1000));
    await addBreadcrumb.click();
    // This is needed because spand are not being sent if I terminate the app
    await driver.execute("mobile: backgroundApp", {seconds: 1});
    await new Promise(r => setTimeout(r, 2000));

    const sessionPayloads = await getSessionPayloads(currentSessionId);

    expect(sessionPayloads.Spans.length).toBe(1);
    const {
      data: {spans},
    } = sessionPayloads.Spans[0];

    const itemCountersSpansRequest: SpanEventExpectedRequest = {
      "emb-session": {
        expectedInstances: 1,
        events: [
          {
            "emb-breadcrumb": {
              expectedInstances: 2,
              attributes: {
                message: "A SIMPLE BREADCRUMB",
                "emb.type": "sys.breadcrumb",
              },
            },
          },
        ],
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

  it("should record two simple breadcrumb and a complex breadcrumb", async () => {
    const currentSessionId = await getCurrentSessionId(driver);

    const addBreadcrumb = await driver.$("~A SIMPLE BREADCRUMB");
    await addBreadcrumb.click();
    await new Promise(r => setTimeout(r, 1000));
    await addBreadcrumb.click();

    const addOtherBreadcrumb = await driver.$("~A COMPLEX BREADCRUMB");
    await addOtherBreadcrumb.click();

    // This is needed because spand are not being sent if I terminate the app
    await driver.execute("mobile: backgroundApp", {seconds: 1});
    await new Promise(r => setTimeout(r, 2000));

    const sessionPayloads = await getSessionPayloads(currentSessionId);

    expect(sessionPayloads.Spans.length).toBe(1);
    const {
      data: {spans},
    } = sessionPayloads.Spans[0];

    const itemCountersSpansRequest: SpanEventExpectedRequest = {
      "emb-session": {
        expectedInstances: 1,
        events: [
          {
            "emb-breadcrumb": {
              expectedInstances: 2,
              attributes: {
                message: "A SIMPLE BREADCRUMB",
                "emb.type": "sys.breadcrumb",
              },
            },
          },
          {
            "emb-breadcrumb": {
              expectedInstances: 1,
              attributes: {
                message: "A COMPLEX BREADCRUMB",
                "emb.type": "sys.breadcrumb",
              },
            },
          },
        ],
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
});
