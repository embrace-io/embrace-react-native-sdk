import {readFileSync, writeFileSync} from "fs";
import {NormalizedPayloads} from "../typings/embrace";
import {normalizePayloads} from "./normalize";
import {lastRawPayloads} from "./payload_source";
import { currentPlatform } from "./platform";

// The golden the running test is associated with. A test declares at most one, either implicitly
// through loadGoldenFile / toMatchGoldenFile, or explicitly with goldenFile() when it asserts with
// targeted matchers but its full payload is still worth keeping as a reference.
let declaredScenario: string | undefined;

const goldenPath = (scenario: string): string =>
  `golden/${currentPlatform()}/${scenario}.json`;

// GOLDEN_CAPTURE is a comma-separated list of scenario names, or "all".
const isCapturing = (scenario: string): boolean => {
  const scenarios = process.env.GOLDEN_CAPTURE?.split(",") ?? [];
  return scenarios.includes("all") || scenarios.includes(scenario);
};

// Associate the running test with a golden, so a capture run writes its payload there.
export const goldenFile = (scenario: string): void => {
  declaredScenario = scenario;
};

// Called before each test so a declaration never carries over to the next one.
export const resetGoldenFile = (): void => {
  declaredScenario = undefined;
};

// Called after each passing test: in capture mode, overwrite the declared golden with the payload
// the test last read. Failing tests write nothing, so a broken run never becomes a golden.
export const writeGoldenFile = (): void => {
  if (declaredScenario && isCapturing(declaredScenario)) {
    writeFileSync(goldenPath(declaredScenario), JSON.stringify(lastRawPayloads(), null, 2));
  }
};

// Load a platform's golden capture and categorize it exactly as a live payload. While the scenario
// is being captured the live payload stands in for the golden, so a stale file can't fail the test
// that is about to replace it.
export const loadGoldenFile = (
  scenario: string,
): NormalizedPayloads => {
  goldenFile(scenario);
  const raw = isCapturing(scenario)
    ? lastRawPayloads()
    : JSON.parse(readFileSync(goldenPath(scenario), "utf8"));
  return normalizePayloads(raw.spans, raw.logs);
};
