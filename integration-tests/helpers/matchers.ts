import {expect} from "@wdio/globals";
import {
  EmbraceLogRecord,
  EmbracePayloadMetadata,
  EmbraceSpanAttribute,
  EmbraceSpanData,
  EmbraceSpanEvent,
} from "../typings/embrace";
import {
  EventProjection,
  PayloadCategory,
  SpanProjection,
  compareAttributes,
  compareCategory,
  compareEvents,
  compareLogs,
  compareSpan,
  idToNameMap,
  parentNameOf,
} from "./compare";
import {loadGoldenFile} from "./golden";
import {getAttribute} from "./normalize";

// expect matchers take a `message: () => string`; reuse the comparator's message.
const wrap = ({pass, message}: {pass: boolean; message: string}) => ({
  pass,
  message: () => message || "assertion failed",
});

export const registerMatchers = (): void =>
  expect.extend({
    toMatchGoldenFile(
      received: EmbraceSpanData[] | EmbraceLogRecord[],
      scenario: string,
      category: PayloadCategory,
    ) {
      const golden = loadGoldenFile(scenario);
      if (category === "logs") {
        return wrap(compareLogs(received as EmbraceLogRecord[], golden.logs));
      }
      return wrap(compareCategory(received as EmbraceSpanData[], golden[category]));
    },
    toMatchSpan(received: EmbraceSpanData, expected: SpanProjection, within: EmbraceSpanData[] = [received]) {
      return wrap(compareSpan(received, expected, idToNameMap(within)));
    },
    toMatchAttributes(received: EmbraceSpanAttribute[], expected: EmbraceSpanAttribute[]) {
      return wrap(compareAttributes(received, expected));
    },
    toMatchEvents(received: EmbraceSpanEvent[], expected: EventProjection[]) {
      return wrap(compareEvents(received, expected));
    },
    toHaveAttributes(received: EmbraceSpanData, subset: Record<string, string>) {
      const errors = Object.entries(subset)
        .filter(([k, v]) => getAttribute(received, k) !== v)
        .map(([k, v]) => `attribute "${k}" expected "${v}", got "${getAttribute(received, k) || "<missing>"}"`);
      return wrap({
        pass: errors.length === 0,
        message: `span "${received?.name}": ${errors.join("; ")}`,
      });
    },
    // Scalar keys compare by value; personas is a "contains" check, because the SDK injects its
    // own personas (Android carries "first_day", and clearAllUserPersonas does not remove it).
    toHaveMetadata(
      received: EmbracePayloadMetadata,
      subset: Partial<EmbracePayloadMetadata>,
    ) {
      const errors = Object.entries(subset).flatMap(([key, expected]) => {
        const actual = received?.[key as keyof EmbracePayloadMetadata];
        if (key === "personas") {
          const have = (actual as string[]) ?? [];
          return (expected as string[])
            .filter(p => !have.includes(p))
            .map(p => `metadata personas missing "${p}" (got [${have.join(", ")}])`);
        }
        return actual === expected
          ? []
          : [`metadata "${key}" expected "${expected}", got "${actual ?? "<missing>"}"`];
      });
      return wrap({pass: errors.length === 0, message: errors.join("; ")});
    },
    toHaveParentSpan(
      received: EmbraceSpanData,
      parent: EmbraceSpanData | string,
      within: EmbraceSpanData[] = [],
    ) {
      if (typeof parent !== "string") {
        return wrap({
          pass: received.parent_span_id === parent.span_id,
          message: `span "${received.name}" expected parent "${parent.name}" (id ${parent.span_id}), got parent id "${received.parent_span_id}"`,
        });
      }
      const actualName = parentNameOf(received.parent_span_id, idToNameMap(within));
      return wrap({
        pass: actualName === parent,
        message: `span "${received.name}" expected parent "${parent}", got "${actualName ?? "root"}"`,
      });
    },
    toHaveSpanNames(received: EmbraceSpanData[], names: string[]) {
      const actual = [...received]
        .sort((a, b) => a.start_time_unix_nano - b.start_time_unix_nano)
        .map(s => s.name);
      const pass = actual.length === names.length && actual.every((n, i) => n === names[i]);
      return wrap({
        pass,
        message: `expected span names [${names.join(", ")}], got [${actual.join(", ")}]`,
      });
    },
  });
