import {driver} from "@wdio/globals";
import {endSession, tap} from "../helpers/app";
import {getPayloadSource} from "../helpers/payload_source";
import {EmbraceSpanData} from "../typings/embrace";

// On iOS we get the "inactive" state which represents a transition between foreground and background instead of
// "background" due to how our integration tests run
// See https://reactnative.dev/docs/appstate#app-states
const backgroundViewState = () => (driver.isAndroid ? "background" : "inactive");

const lastByStart = (spans: EmbraceSpanData[]) =>
  [...spans].sort((a, b) => a.start_time_unix_nano - b.start_time_unix_nano).at(-1)!;

describe("Navigation", () => {
  const payloadSource = getPayloadSource();

  // Establish a known starting screen so the spec is independent of run order.
  beforeEach(async () => {
    await tap("LOG TESTING", 500);
  });

  it("records the rendered screen as a view span", async () => {
    await endSession();

    const payload = await payloadSource.getPayloads();
    expect(lastByStart(payload.viewSpans)).toHaveAttributes({
      "view.name": "log",
      "view.state.end": backgroundViewState(),
    });
  });

  it("records navigation between screens", async () => {
    await tap("SPAN TESTING", 500);
    await tap("LOG TESTING", 500);
    await endSession();

    const payload = await payloadSource.getPayloads();
    expect(payload.viewSpans).toHaveSpanNames(["log", "span", "log"]);
    expect(lastByStart(payload.viewSpans)).toHaveAttributes({
      "view.state.end": backgroundViewState(),
    });
  });
});
