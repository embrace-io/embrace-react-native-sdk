import {driver} from "@wdio/globals";
import {endSession, tap} from "../helpers/app";
import {getAttribute} from "../helpers/normalize";
import {getPayloadSource} from "../helpers/payload_source";
import { currentPlatform } from "../helpers/platform";

describe("User", () => {
  const source = getPayloadSource();

  beforeEach(async () => {
    await tap("USER TESTING", 500);
  });

  // User identity and permanent session properties survive the session end and `noReset: true`,
  // so undo them or they leak into later tests and later specs.
  afterEach(async () => {
    await tap("USER TESTING");
    await tap("Clear User Properties", 500);
    await tap("Clear Session Properties", 500);
  });

  it("attaches user identity to the session payload", async () => {
    await tap("Set User Properties", 500);
    await endSession();

    const payload = await source.getPayloads();
    // personas is a contains check: Android also carries the SDK-injected "first_day".
    expect(payload.sessionMetadata).toHaveMetadata({
      user_id: "user-identifier",
      username: "user-name",
      email: "user@test.com",
      personas: ["persona1"],
    });
  });

  it("clears user identity", async () => {
    await tap("Set User Properties", 500);
    await tap("Clear User Properties", 500);
    await endSession();

    const payload = await source.getPayloads();
    // Cleared fields are omitted from the metadata rather than sent empty.
    expect(payload.sessionMetadata.user_id).toBeUndefined();
    expect(payload.sessionMetadata.username).toBeUndefined();
    expect(payload.sessionMetadata.email).toBeUndefined();
    expect(payload.sessionMetadata.personas ?? []).not.toContain("persona1");
  });

  it("clears all user personas", async () => {
    await tap("Clear All User Personas", 500);
    await endSession();

    const payload = await source.getPayloads();
    const personas = payload.sessionMetadata.personas ?? [];
    expect(personas).not.toContain("all-personas1");
    expect(personas).not.toContain("all-personas2");
  });

  it("keeps permanent session properties across sessions and drops temporary ones", async () => {
    await tap("Set Session Properties", 500);
    await endSession();
    await endSession(); // second session, same app instance

    const payload = await source.getPayloads();
    const [first, second] = [...payload.sessionSpans].sort(
      (a, b) => a.start_time_unix_nano - b.start_time_unix_nano,
    );
    expect(first).toHaveAttributes({
      "emb.properties.my-property": "foo-bar",
      "emb.properties.my-permanent-property": "foo-bar-permanent",
    });
    expect(second).toHaveAttributes({
      "emb.properties.my-permanent-property": "foo-bar-permanent",
    });
    expect(getAttribute(second, "emb.properties.my-property")).toBe("");
  });

  it("returns device, session and last-run metadata", async () => {
    await tap("Retrieve Metadata", 500);

    const deviceId = await driver.$("~metadata-device-id").getText();
    const sessionId = await driver.$("~metadata-session-id").getText();
    const lastRunEndState = await driver.$("~metadata-last-run-end-state").getText();

    expect(deviceId).not.toBe("");

    // SPM pulls in a more recent version of KSCrash (2.6.0) that changes the lastRunEndState behaviour:
    // it now returns "CRASH" for unexplained exits (in this case, appium relaunching the app in a previous test)
    // TODO: revert this when fixed in the iOS SDK
    const expectedLastRunEndStates =
      currentPlatform() === "ios" && process.env.EMBRACE_USE_SPM === "1"
        ? ["CRASH"]
        : ["CLEAN_EXIT", "INVALID"];

    expect(expectedLastRunEndStates).toContain(lastRunEndState);

    // The id the SDK reported must be the one that lands on the flushed session span.
    await endSession();
    const payload = await source.getPayloads();
    expect(payload.sessionSpans[0]).toHaveAttributes({"session.id": sessionId});
  });
});
