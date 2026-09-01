import {endSession, relaunchAppAfterCrash, tap} from "../helpers/app";
import {getAttribute} from "../helpers/normalize";
import {getPayloadSource} from "../helpers/payload_source";
import {currentPlatform} from "../helpers/platform";
import {EmbraceLogRecord} from "../typings/embrace";

const NATIVE_CRASH_LOG_TYPE = "sys.ios.crash";

// Both platforms report an unhandled JS exception as a log of this type. A function rather than a
// constant because currentPlatform() needs a live driver session.
const jsExceptionLogType = () => `sys.${currentPlatform()}.react_native_crash`;

const getLogByType = (
  logs: EmbraceLogRecord[],
  embType: string,
): EmbraceLogRecord | undefined =>
  logs.find(log => getAttribute(log, "emb.type") === embType);

// The React Native crash log carries the JS exception as a JSON blob, same shape on both platforms.
interface JSException {
  n: string; // error name
  m: string; // error message
  t: string; // error type
  st: string; // JS stack
}

// JS exceptions are serialized into a log attribute and are volatile, so the golden
// compare only checks that it is there — the exception is asserted from here instead.
const jsExceptionFromLog = (log: EmbraceLogRecord): JSException =>
  JSON.parse(
    getAttribute(log, `emb.${currentPlatform()}.react_native_crash.js_exception`) || "{}",
  );

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

    // Check the general shape matches the expected golden
    expect(payload.logs).toMatchGoldenFile("anonymous-crash", "logs");

    // Check the serialized JS Exception has the expected values
    const jsExceptionLog = getLogByType(payload.logs, jsExceptionLogType());
    const exception = jsExceptionFromLog(jsExceptionLog);
    expect(exception.n).toBe("ReferenceError");
    expect(exception.m).toBe("Anonymous Crash (Unhandled JS Exception)");
    expect(topFrame(exception.st)).toContain("at anonymous");

    if (currentPlatform() === "ios") {
      // The native KSCrash log's emb.payload should contain the JS log's exception.id under
      // user["emb-js"], set by appendCrashInfo.
      const nativeCrashLog = getLogByType(payload.logs, NATIVE_CRASH_LOG_TYPE);
      const jsExceptionId = getAttribute(jsExceptionLog, "exception.id");
      const {user} = JSON.parse(getAttribute(nativeCrashLog, "emb.payload") || "{}");
      expect(jsExceptionId).not.toBe("");
      expect(user?.["emb-js"]).toBe(jsExceptionId);
    }
  });

  it("records an unhandled JS exception thrown from a named function", async () => {
    await tap("Crash", 1000);
    await relaunchAppAfterCrash();

    const payload = await source.getPayloads();

    // Check the general shape matches the expected golden
    expect(payload.logs).toMatchGoldenFile("crash", "logs");

    // Check the serialized JS Exception has the expected values
    const jsExceptionLog = getLogByType(payload.logs, jsExceptionLogType());
    const exception = jsExceptionFromLog(jsExceptionLog);
    expect(exception.n).toBe("ReferenceError");
    expect(exception.m).toBe("Crash (Unhandled JS Exception)");
    expect(topFrame(exception.st)).toContain("at myLovellyUnhandledError");

    if (currentPlatform() === "ios") {
      // The native KSCrash log's emb.payload should contain the JS log's exception.id under
      // user["emb-js"], set by appendCrashInfo.
      const nativeCrashLog = getLogByType(payload.logs, NATIVE_CRASH_LOG_TYPE);
      const jsExceptionId = getAttribute(jsExceptionLog, "exception.id");
      const {user} = JSON.parse(getAttribute(nativeCrashLog, "emb.payload") || "{}");
      expect(jsExceptionId).not.toBe("");
      expect(user?.["emb-js"]).toBe(jsExceptionId);
    }
  });
});
