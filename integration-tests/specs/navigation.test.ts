import {driver} from "@wdio/globals";
import {getPayloadSource} from "../helpers/payload_source";
import {endSession} from "../helpers/session";
import {EmbraceSpanData} from "../typings/embrace";

// On iOS backgrounding surfaces as the transitional "inactive" state (see EMISSION-MODEL.md).
const backgroundViewState = () => (driver.isAndroid ? "background" : "inactive");

const lastByStart = (spans: EmbraceSpanData[]) =>
  [...spans].sort((a, b) => a.start_time_unix_nano - b.start_time_unix_nano).at(-1)!;

describe("Navigation", () => {
  const payloadSource = getPayloadSource();

  // Establish a known starting screen so the spec is independent of run order.
  beforeEach(async () => {
    await driver.$("~LOG TESTING").click();
    await new Promise(r => setTimeout(r, 500));
  });

  it("records the rendered screen as a view span", async () => {
    await endSession();

    const p = await payloadSource.getPayloads();
    expect(lastByStart(p.viewSpans)).toHaveAttributes({
      "view.name": "log",
      "view.state.end": backgroundViewState(),
    });
  });

  it("records navigation between screens", async () => {
    await driver.$("~SPAN TESTING").click();
    await new Promise(r => setTimeout(r, 500));
    await driver.$("~LOG TESTING").click();
    await new Promise(r => setTimeout(r, 500));
    await endSession();

    const p = await payloadSource.getPayloads();
    expect(p.viewSpans).toHaveSpanNames(["log", "span", "log"]);
    expect(lastByStart(p.viewSpans)).toHaveAttributes({
      "view.state.end": backgroundViewState(),
    });
  });
});
