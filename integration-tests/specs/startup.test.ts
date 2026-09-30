import {endSession} from "../helpers/app";
import {getPayloadSource} from "../helpers/payload_source";

describe("Startup instrumentation", () => {
    const source = getPayloadSource();

    it("captures startup spans", async () => {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await endSession();

        const payload = await source.getPayloads();
        expect(payload.internalSpans).toMatchGoldenFile("app-startup", "internalSpans");
    });
});