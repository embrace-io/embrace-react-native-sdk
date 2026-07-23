import {
  EmbraceLogEnvelope,
  EmbraceLogRecord,
  EmbraceSpanData,
  EmbraceSpanEnvelope,
  NormalizedPayloads,
} from "../typings/embrace";
import { currentPlatform } from "./platform";

// Read a value from a {key,value}[] attribute list (spans and logs share this shape).
export const getAttribute = (
  item: {attributes?: {key: string; value: string}[]},
  key: string,
): string => item.attributes?.find(a => a.key === key)?.value ?? "";

// Internal view spans the SDK emits automatically (native screen tracking); not user navigation.
const INTERNAL_VIEW_SPAN_NAMES = new Set(["emb-screen-view", "emb-sdk-start"]);

// A user-created tracer span/snapshot, distinguished from SDK auto-instrumentation.
const isUserPerf = (span: EmbraceSpanData): boolean => {
  const type = getAttribute(span, "emb.type");
  if (currentPlatform() === "android") {
    // Android tags user spans with emb.type=perf; the internal emb-sdk-init span
    // shares that type but is marked emb.private=true.
    return type === "perf" && getAttribute(span, "emb.private") !== "true";
  }
  // iOS user spans carry no emb.type; iOS internal perf spans do, so they are excluded.
  return type === "";
};

export const normalizePayloads = (
  spanEnvelopes: EmbraceSpanEnvelope[],
  logEnvelopes: EmbraceLogEnvelope[],
): NormalizedPayloads => {
  const out: NormalizedPayloads = {
    sessionSpans: [],
    viewSpans: [],
    perfSpans: [],
    networkSpans: [],
    spanSnapshots: [],
    logs: [],
    ignored: [],
  };

  spanEnvelopes.forEach(env => {
    (env.data?.spans ?? []).forEach(span => {
      if (span.name === "emb-session") {
        out.sessionSpans.push(span);
      } else if (getAttribute(span, "emb.type") === "ux.view") {
        if (INTERNAL_VIEW_SPAN_NAMES.has(span.name)) {
          out.ignored.push(span);
        } else {
          out.viewSpans.push(span);
        }
      } else if (getAttribute(span, "emb.type") === "perf.network_request") {
        out.networkSpans.push(span);
      } else if (isUserPerf(span)) {
        out.perfSpans.push(span);
      } else {
        out.ignored.push(span);
      }
    });
    (env.data?.span_snapshots ?? []).forEach(snap => {
      if (isUserPerf(snap)) {
        out.spanSnapshots.push(snap);
      } else {
        out.ignored.push(snap);
      }
    });
  });

  logEnvelopes.forEach(env => {
    (env.data?.logs ?? []).forEach((log: EmbraceLogRecord) => {
      if (getAttribute(log, "emb.type").startsWith("sys.")) {
        return; // internal/auto log (e.g. iOS launch-time sys.internal noise)
      }
      out.logs.push(log);
    });
  });

  return out;
};
