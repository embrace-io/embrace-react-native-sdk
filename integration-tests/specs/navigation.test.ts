import {driver} from "@wdio/globals";
import {endSession, tap, isExpo} from "../helpers/app";
import {getPayloadSource} from "../helpers/payload_source";
import {EmbraceSpanData} from "../typings/embrace";

// On iOS we get the "inactive" state which represents a transition between foreground and background instead of
// "background" due to how our integration tests run
// See https://reactnative.dev/docs/appstate#app-states
const backgroundViewState = () => (driver.isAndroid ? "background" : "inactive");

const lastByStart = (spans: EmbraceSpanData[]) =>
  [...spans].sort((a, b) => a.start_time_unix_nano - b.start_time_unix_nano).at(-1)!;

// In Expo router the initial route (log screen) is named "index"
const logViewName = () => isExpo() ? "index" : "log";

const navigationPackageName = () => isExpo() ? "expo-router" : "@react-navigation/native";

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
      "view.name": logViewName(),
      "view.state.end": backgroundViewState(),
      "package": navigationPackageName(),
    });
  });

  it("records navigation between screens", async () => {
    await tap("SPAN TESTING", 500);
    await tap("LOG TESTING", 500);
    await endSession();

    const payload = await payloadSource.getPayloads();
    expect(payload.viewSpans).toHaveSpanNames([logViewName(), "span", logViewName()]);
    expect(lastByStart(payload.viewSpans)).toHaveAttributes({
      "view.state.end": backgroundViewState(),
      "package": navigationPackageName(),
    });
  });
});
