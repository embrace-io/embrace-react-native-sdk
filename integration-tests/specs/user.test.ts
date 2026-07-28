import {driver} from "@wdio/globals";
import {getAttribute} from "../helpers/normalize";
import {getPayloadSource} from "../helpers/payload_source";
import {endSession} from "../helpers/session";

const tap = async (label: string) => {
  await driver.$(`~${label}`).click();
  await new Promise(r => setTimeout(r, 500));
};

describe("User", () => {
  const source = getPayloadSource();

  beforeEach(async () => {
    await driver.$("~USER TESTING").click();
    await new Promise(r => setTimeout(r, 500));
  });

  // User identity and permanent session properties survive the session end and `noReset: true`,
  // so undo them or they leak into later tests and later specs.
  afterEach(async () => {
    await driver.$("~USER TESTING").click();
    await tap("Clear User Properties");
    await tap("Clear Session Properties");
  });

  it("attaches user identity to the session payload", async () => {
    await tap("Set User Properties");
    await endSession();

    const p = await source.getPayloads();
    // personas is a contains check: Android also carries the SDK-injected "first_day".
    expect(p.sessionMetadata).toHaveMetadata({
      user_id: "user-identifier",
      username: "user-name",
      email: "user@test.com",
      personas: ["persona1"],
    });
  });

  it("clears user identity", async () => {
    await tap("Set User Properties");
    await tap("Clear User Properties");
    await endSession();

    const p = await source.getPayloads();
    // Cleared fields are omitted from the metadata rather than sent empty.
    expect(p.sessionMetadata.user_id).toBeUndefined();
    expect(p.sessionMetadata.username).toBeUndefined();
    expect(p.sessionMetadata.email).toBeUndefined();
    expect(p.sessionMetadata.personas ?? []).not.toContain("persona1");
  });

  it("clears all user personas", async () => {
    await tap("Clear All User Personas");
    await endSession();

    const p = await source.getPayloads();
    const personas = p.sessionMetadata.personas ?? [];
    expect(personas).not.toContain("all-personas1");
    expect(personas).not.toContain("all-personas2");
  });

  it("keeps permanent session properties across sessions and drops temporary ones", async () => {
    await tap("Set Session Properties");
    await endSession();
    await endSession(); // second session, same app instance

    const p = await source.getPayloads();
    const [first, second] = [...p.sessionSpans].sort(
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
    await tap("Retrieve Metadata");

    const deviceId = await driver.$("~metadata-device-id").getText();
    const sessionId = await driver.$("~metadata-session-id").getText();
    const lastRunEndState = await driver.$("~metadata-last-run-end-state").getText();

    expect(deviceId).not.toBe("");
    expect(["CLEAN_EXIT", "INVALID"]).toContain(lastRunEndState);

    // The id the SDK reported must be the one that lands on the flushed session span.
    await endSession();
    const p = await source.getPayloads();
    expect(p.sessionSpans[0]).toHaveAttributes({"session.id": sessionId});
  });
});
