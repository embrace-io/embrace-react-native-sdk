import {expect} from "@wdio/globals";
import {EmbraceSpanAttribute, EmbraceSpanData, EmbraceSpanEvent} from "../typings/embrace";
import {
  EventProjection,
  SpanCategory,
  SpanProjection,
  compareAttributes,
  compareCategory,
  compareEvents,
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
    toMatchGoldenFile(received: EmbraceSpanData[], scenario: string, category: SpanCategory) {
      const golden = loadGoldenFile(scenario)[category];
      return wrap(compareCategory(received, golden));
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
