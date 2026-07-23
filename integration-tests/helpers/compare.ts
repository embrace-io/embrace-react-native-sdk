import {EmbraceSpanAttribute, EmbraceSpanData, EmbraceSpanEvent} from "../typings/embrace";

// ---- volatile config (assert presence, not value) ----
const isPresent = (v: unknown): boolean =>
  v !== undefined && v !== null && v !== "";
// future: isHex = v => /^[0-9a-f]+$/.test(String(v)); isPositiveNumber = v => typeof v === "number" && v > 0;

// Attribute keys whose value varies run-to-run: presence-checked, value ignored,
// and exempt from the unexpected-key check.
const VOLATILE_ATTR_KEYS = new Set([
  "session.id",
  "emb.private.sequence_id",
  "emb.process_identifier",
]);

// ---- shared types ----
export type EventProjection = {name: string; attributes: EmbraceSpanAttribute[]};
export type SpanProjection = {
  name: string;
  parentName: string | null;
  status: string;
  attributes: EmbraceSpanAttribute[];
  events: EventProjection[];
};
export type CompareResult = {pass: boolean; message: string};
export type SpanCategory =
  | "sessionSpans"
  | "viewSpans"
  | "perfSpans"
  | "networkSpans"
  | "spanSnapshots";

// ---- attribute comparison ----
export const compareAttributes = (
  actual: EmbraceSpanAttribute[] = [],
  expected: EmbraceSpanAttribute[] = [],
): CompareResult => {
  const errors: string[] = [];
  const actualMap = new Map(actual.map(a => [a.key, a.value]));
  const expectedMap = new Map(expected.map(a => [a.key, a.value]));

  for (const [key, value] of expectedMap) {
    if (VOLATILE_ATTR_KEYS.has(key)) {
      if (!isPresent(actualMap.get(key))) {
        errors.push(`missing volatile attribute "${key}"`);
      }
    } else if (!actualMap.has(key)) {
      errors.push(`missing attribute "${key}"`);
    } else if (actualMap.get(key) !== value) {
      errors.push(`attribute "${key}" expected "${value}", got "${actualMap.get(key)}"`);
    }
  }
  for (const key of actualMap.keys()) {
    if (!expectedMap.has(key) && !VOLATILE_ATTR_KEYS.has(key)) {
      errors.push(`unexpected attribute "${key}"`);
    }
  }
  return {pass: errors.length === 0, message: errors.join("; ")};
};

// ---- event comparison ----
const byName = (a: {name: string}, b: {name: string}) => a.name.localeCompare(b.name);

export const compareEvents = (
  actual: EmbraceSpanEvent[] = [],
  expected: EventProjection[] = [],
): CompareResult => {
  const errors: string[] = [];
  if (actual.length !== expected.length) {
    errors.push(
      `expected ${expected.length} event(s), got ${actual.length} [${actual.map(e => e.name).join(", ")}]`,
    );
  }
  const a = [...actual].sort(byName);
  const e = [...expected].sort(byName);
  e.forEach((exp, i) => {
    const act = a[i];
    if (!act) {
      errors.push(`missing event "${exp.name}"`);
      return;
    }
    if (act.name !== exp.name) {
      errors.push(`event expected "${exp.name}", got "${act.name}"`);
      return;
    }
    const attrs = compareAttributes(act.attributes, exp.attributes);
    if (!attrs.pass) {
      errors.push(`event "${exp.name}": ${attrs.message}`);
    }
  });
  return {pass: errors.length === 0, message: errors.join("; ")};
};

// ---- span comparison ----
// Structural fields present on every span AND snapshot on both platforms.
// end_time_unix_nano (absent on snapshots) and parent_span_id (absent on iOS roots)
// are structurally optional — checked neither by value nor presence.
const VOLATILE_FIELDS: {key: keyof EmbraceSpanData; valid: (v: unknown) => boolean}[] = [
  {key: "span_id", valid: isPresent},
  {key: "trace_id", valid: isPresent},
  {key: "start_time_unix_nano", valid: isPresent},
];

// Resolve a parent_span_id to the parent's name within a set; root/absent/unknown → null.
export const parentNameOf = (
  parentId: string | undefined,
  idToName: Map<string, string>,
): string | null =>
  !parentId || parentId === "0000000000000000" ? null : idToName.get(parentId) ?? null;

export const idToNameMap = (spans: EmbraceSpanData[]): Map<string, string> => {
  const m = new Map<string, string>();
  spans.forEach(s => {
    if (s.span_id) {
      m.set(s.span_id, s.name);
    }
  });
  return m;
};

export const projectSpan = (
  span: EmbraceSpanData,
  idToName: Map<string, string>,
): SpanProjection => ({
  name: span.name,
  parentName: parentNameOf(span.parent_span_id, idToName),
  status: span.status,
  attributes: span.attributes ?? [],
  events: (span.events ?? []).map(e => ({name: e.name, attributes: e.attributes ?? []})),
});

export const compareSpan = (
  actual: EmbraceSpanData,
  expected: SpanProjection,
  idToName: Map<string, string>,
): CompareResult => {
  const errors: string[] = [];
  if (actual.name !== expected.name) {
    errors.push(`name expected "${expected.name}", got "${actual.name}"`);
  }
  const actualParent = parentNameOf(actual.parent_span_id, idToName);
  if (actualParent !== expected.parentName) {
    errors.push(`parent expected "${expected.parentName ?? "root"}", got "${actualParent ?? "root"}"`);
  }
  if (actual.status !== expected.status) {
    errors.push(`status expected "${expected.status}", got "${actual.status}"`);
  }
  for (const {key, valid} of VOLATILE_FIELDS) {
    if (!valid(actual[key])) {
      errors.push(`missing field "${String(key)}"`);
    }
  }
  const attrs = compareAttributes(actual.attributes, expected.attributes);
  if (!attrs.pass) {
    errors.push(attrs.message);
  }
  const events = compareEvents(actual.events, expected.events);
  if (!events.pass) {
    errors.push(events.message);
  }
  return {
    pass: errors.length === 0,
    message: errors.length ? `span "${expected.name}": ${errors.join("; ")}` : "",
  };
};

// Compare two categories (span arrays) by name. Assumes unique names within the category
// (true for perfSpans / spanSnapshots in the tracer scenarios).
export const compareCategory = (
  actual: EmbraceSpanData[] = [],
  expected: EmbraceSpanData[] = [],
): CompareResult => {
  const errors: string[] = [];
  const actualIds = idToNameMap(actual);
  const expectedIds = idToNameMap(expected);
  const actualByName = new Map(actual.map(s => [s.name, s]));

  // A duplicate name would be silently collapsed by actualByName; report it instead.
  const seen = new Set<string>();
  for (const s of actual) {
    if (seen.has(s.name)) {
      errors.push(`duplicate span "${s.name}"`);
    }
    seen.add(s.name);
  }

  const expectedProjections = expected
    .map(s => projectSpan(s, expectedIds))
    .sort((a, b) => a.name.localeCompare(b.name));
  const expectedNames = new Set(expectedProjections.map(p => p.name));

  for (const name of actualByName.keys()) {
    if (!expectedNames.has(name)) {
      errors.push(`unexpected span "${name}"`);
    }
  }
  for (const exp of expectedProjections) {
    const act = actualByName.get(exp.name);
    if (!act) {
      errors.push(`missing span "${exp.name}"`);
      continue;
    }
    const r = compareSpan(act, exp, actualIds);
    if (!r.pass) {
      errors.push(r.message);
    }
  }
  return {pass: errors.length === 0, message: errors.join("\n")};
};
