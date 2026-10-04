import {endSession} from "../helpers/app";
import {getPayloadSource} from "../helpers/payload_source";

describe("Startup instrumentation", function () {
    this.retries(0);
    const source = getPayloadSource();

    it("records an app startup trace", async () => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        await endSession();

        const payload = await source.getPayloads();
        expect(payload.internalSpans).toMatchGoldenFile("app-startup", "internalSpans");
    });
});