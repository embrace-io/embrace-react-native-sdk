import {endSession, relaunchAppAfterCrash, tap} from "../helpers/app";
import {getAttribute} from "../helpers/normalize";
import {getPayloadSource} from "../helpers/payload_source";
import {currentPlatform} from "../helpers/platform";
import {EmbraceLogRecord} from "../typings/embrace";

// The React Native crash log carries the JS exception as a JSON blob, same shape on both platforms.
interface JSException {
  n: string; // error name
  m: string; // error message
  t: string; // error type
  st: string; // JS stack
}

// The blob holds bundle offsets and absolute paths, so the attribute itself is volatile and the
// golden compare only checks that it is there — the exception is asserted from here instead.
const jsException = (logs: EmbraceLogRecord[]): JSException => {
  const key = `emb.${currentPlatform()}.react_native_crash.js_exception`;
  const value = logs.map(log => getAttribute(log, key)).find(v => v !== "");
  return JSON.parse(value || "{}");
};

// Android prefixes the stack with "<type>: <message>"; iOS starts at the first frame.
const topFrame = (stack = ""): string =>
  stack
    .split("\n")
    .map(line => line.trim())
    .find(line => line.startsWith("at ")) ?? "";

// Logs are batched rather than sent immediately (iOS flushes on a ~20s timer of its own), but
// backgrounding forces the batch out, so these use the same endSession() flush as every other spec.
describe("Logs", () => {
  const source = getPayloadSource();

  beforeEach(async () => {
    await tap("LOG TESTING", 500);
  });

  it("records info, warning, error and message logs", async () => {
    await tap("Info / Warning / Error / Message");
    await endSession();

    const payload = await source.getPayloads();
    expect(payload.logs).toMatchGoldenFile("logs-basic", "logs");
  });

  it("records logs without stack traces", async () => {
    await tap("Warning / Error / Message");
    await endSession();

    const payload = await source.getPayloads();
    expect(payload.logs).toMatchGoldenFile("logs-no-stacktrace", "logs");
  });

  it("records a handled exception", async () => {
    await tap("Handled Exception");
    await endSession();

    const payload = await source.getPayloads();
    expect(payload.logs).toMatchGoldenFile("logs-handled-exception", "logs");
  });

  // The rejection tracker reports on a later tick, hence the settle before the flush.
  it("records an unhandled promise rejection", async () => {
    await tap("Trigger an Unhandled Promise rejection", 2000);
    await endSession();

    const payload = await source.getPayloads();
    expect(payload.logs).toMatchGoldenFile("promise-rejection", "logs");
  });

  // The two crash tests come last: the SDK only delivers a crash report at the next startup, so
  // they have to relaunch the app, and that relaunch is a cold start for whatever runs after them.
  // The settle after the tap lets the dying process finish writing its report and exit, so the
  // relaunch is a cold start rather than a foreground.
  it("records an unhandled JS exception thrown from an anonymous function", async () => {
    await tap("Anonymous Crash", 1000);
    await relaunchAppAfterCrash();

    const payload = await source.getPayloads();
    expect(payload.logs).toMatchGoldenFile("anonymous-crash", "logs");

    const exception = jsException(payload.logs);
    expect(exception.n).toBe("ReferenceError");
    expect(exception.m).toBe("Anonymous Crash (Unhandled JS Exception)");
    expect(topFrame(exception.st)).toContain("at anonymous");
  });

  it("records an unhandled JS exception thrown from a named function", async () => {
    await tap("Crash", 1000);
    await relaunchAppAfterCrash();

    const payload = await source.getPayloads();
    expect(payload.logs).toMatchGoldenFile("crash", "logs");

    const exception = jsException(payload.logs);
    expect(exception.n).toBe("ReferenceError");
    expect(exception.m).toBe("Crash (Unhandled JS Exception)");
    expect(topFrame(exception.st)).toContain("at myLovellyUnhandledError");
  });
});
