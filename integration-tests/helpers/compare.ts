import {
  EmbraceLogRecord,
  EmbraceSpanAttribute,
  EmbraceSpanData,
  EmbraceSpanEvent,
} from "../typings/embrace";

// ---- volatile config (assert presence, not value) ----
const isPresent = (v: unknown): boolean =>
  v !== undefined && v !== null && v !== "";
// future: isHex = v => /^[0-9a-f]+$/.test(String(v)); isPositiveNumber = v => typeof v === "number" && v > 0;

// Attribute keys whose value varies run-to-run: presence-checked, value ignored
const VOLATILE_ATTR_KEYS = new Set([
  "session.id",
  "emb.cold_start",
  "emb.session_number",
  "emb.startup_duration",
  "emb.private.sequence_id",
  "emb.process_identifier",
  "emb.clock_network_drift",
  "emb.disk_free_bytes",
  "emb.heartbeat_time_unix_nano",
  "emb.is_emulator",
  "tap.coords",
  // logs
  "log.record.uid", // per-record uuid
  "emb.stacktrace.rn", // JS stack: bundle paths and line numbers
  "emb.stacktrace.ios", // base64 native stack with absolute paths
  "emb.state.network", // Android only: wifi / cellular / unknown
  "emb.state.screen-automatic", // Android only: whichever screen is current
  // crashes: everything that identifies the exception is embedded in a stack trace, so the whole
  // attribute is volatile and the spec asserts the exception itself
  "emb.android.crash.exception_cause", // native cause chain, carries the JS stack
  "emb.android.crash_number", // per-device crash counter
  "emb.android.react_native_crash.js_exception", // JS exception JSON, carries the JS stack
  "emb.ios.react_native_crash.js_exception",
  "emb.android.threads", // thread dumps
  "emb.payload", // iOS KSCrash report
  "exception.id", // per-crash uuid
  "exception.message", // Android appends the JS stack to the message
  "exception.stacktrace", // native stack: line numbers
  // network
  "http.request.body.size",
  "http.response.body.size",
  "user_agent.version",
  "emb.w3c_traceparent",
]);

// Same treatment, matched by prefix: every key under these namespaces is volatile.
const VOLATILE_ATTR_NAMESPACES = [
  "emb.usage.", // per-API call counters: which keys appear, and their counts, both vary
];

const isVolatileKey = (key: string): boolean =>
  VOLATILE_ATTR_KEYS.has(key) ||
  VOLATILE_ATTR_NAMESPACES.some(prefix => key.startsWith(prefix));

// ---- shared types ----
export type EventProjection = {name: string; attributes: EmbraceSpanAttribute[]};
export type SpanProjection = {
  name: string;
  parentName: string | null;
  status: string;
  attributes: EmbraceSpanAttribute[];
  events: EventProjection[];
};
export type LogProjection = {
  body: string;
  severityText: string;
  severityNumber: number;
  attributes: EmbraceSpanAttribute[];
};
export type CompareResult = {pass: boolean; message: string};

// ---- attribute comparison ----
export const compareAttributes = (
  actual: EmbraceSpanAttribute[] = [],
  expected: EmbraceSpanAttribute[] = [],
): CompareResult => {
  const errors: string[] = [];
  const actualMap = new Map(actual.map(a => [a.key, a.value]));
  const expectedMap = new Map(expected.map(a => [a.key, a.value]));

  for (const [key, value] of expectedMap) {
    if (isVolatileKey(key)) {
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
    if (!expectedMap.has(key)) {
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

// Compare two span arrays by name. Assumes unique names within the category
// (true for perfSpans / spanSnapshots in the tracer scenarios).
export const compareSpans = (
  actual: EmbraceSpanData[] = [],
  expected: EmbraceSpanData[] = [],
): CompareResult => {
  const errors: string[] = [];
  const actualIds = idToNameMap(actual);
  const expectedIds = idToNameMap(expected);
  const actualByName = new Map(actual.map(s => [s.name, s]));

  // A duplicate name would be silently collapsed by actualByName; report it instead.
  const seen = new Set<string>();
  for (const span of actual) {
    if (seen.has(span.name)) {
      errors.push(`duplicate span "${span.name}"`);
    }
    seen.add(span.name);
  }

  const expectedProjections = expected
    .map(span => projectSpan(span, expectedIds))
    .sort((a, b) => a.name.localeCompare(b.name));
  const expectedNames = new Set(expectedProjections.map(p => p.name));

  for (const name of actualByName.keys()) {
    if (!expectedNames.has(name)) {
      errors.push(`unexpected span "${name}"`);
    }
  }
  for (const expected of expectedProjections) {
    const actual = actualByName.get(expected.name);
    if (!actual) {
      errors.push(`missing span "${expected.name}"`);
      continue;
    }
    const result = compareSpan(actual, expected, actualIds);
    if (!result.pass) {
      errors.push(result.message);
    }
  }
  return {pass: errors.length === 0, message: errors.join("\n")};
};

// ---- log comparison ----
export const projectLog = (log: EmbraceLogRecord): LogProjection => ({
  body: log.body,
  severityText: log.severity_text,
  severityNumber: log.severity_number,
  attributes: log.attributes ?? [],
});

// Compare log records by body. Bodies are unique within every scenario the specs assert;
// a batch split across several envelopes compares the same either way.
export const compareLogs = (
  actual: EmbraceLogRecord[] = [],
  expected: EmbraceLogRecord[] = [],
): CompareResult => {
  const errors: string[] = [];
  const actualByBody = new Map(actual.map(l => [l.body, l]));

  const seen = new Set<string>();
  for (const log of actual) {
    if (seen.has(log.body)) {
      errors.push(`duplicate log "${log.body}"`);
    }
    seen.add(log.body);
  }

  const expectedProjections = expected
    .map(projectLog)
    .sort((a, b) => a.body.localeCompare(b.body));
  const expectedBodies = new Set(expectedProjections.map(p => p.body));

  for (const body of actualByBody.keys()) {
    if (!expectedBodies.has(body)) {
      errors.push(`unexpected log "${body}"`);
    }
  }

  for (const expected of expectedProjections) {
    const actual = actualByBody.get(expected.body);
    if (!actual) {
      errors.push(`missing log "${expected.body}"`);
      continue;
    }
    const logErrors: string[] = [];
    if (actual.severity_text !== expected.severityText) {
      logErrors.push(`severity_text expected "${expected.severityText}", got "${actual.severity_text}"`);
    }
    if (actual.severity_number !== expected.severityNumber) {
      logErrors.push(`severity_number expected ${expected.severityNumber}, got ${actual.severity_number}`);
    }
    if (!isPresent(actual.time_unix_nano)) {
      logErrors.push('missing field "time_unix_nano"');
    }
    const attrs = compareAttributes(actual.attributes, expected.attributes);
    if (!attrs.pass) {
      logErrors.push(attrs.message);
    }
    if (logErrors.length) {
      errors.push(`log "${expected.body}": ${logErrors.join("; ")}`);
    }
  }

  return {pass: errors.length === 0, message: errors.join("\n")};
};
