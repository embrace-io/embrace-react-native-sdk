import {readFileSync} from "fs";
import {NormalizedPayloads} from "../typings/embrace";
import {normalizePayloads} from "./normalize";
import { currentPlatform } from "./platform";

// Load a platform's golden capture and categorize it exactly as a live payload.
export const loadGoldenFile = (
  scenario: string,
): NormalizedPayloads => {
  const raw = JSON.parse(
    readFileSync(`golden/${currentPlatform()}/${scenario}.json`, "utf8"),
  );
  return normalizePayloads(raw.spans, raw.logs);
};
