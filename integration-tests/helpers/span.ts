import {
  EmbracePayloadSpans,
  EmbraceSpanAttribute,
  EmbraceSpanData,
  ParsedSpanPayload,
} from "../typings/embrace";

/**
 * spans are all included on the same array in the payload, to make testing easier separate them into
 * categories and sort them
 */
const parseSpanPayload = (payload: EmbracePayloadSpans): ParsedSpanPayload => {
  const userSpans: EmbraceSpanData[] = [];
  const privateSpans: EmbraceSpanData[] = [];
  const networkSpans: EmbraceSpanData[] = [];
  const userSpanSnapshots: EmbraceSpanData[] = [];
  let sessionSpan: EmbraceSpanData = null;

  payload.spans.forEach(span => {
    sortSpanAttributes(span.attributes);

    if (span.name === "emb-session") {
      sessionSpan = span;
      return;
    }

    if (getAttributeValue(span, "emb.private") === "true") {
      privateSpans.push(span);
      return;
    }

    const embType = getAttributeValue(span, "emb.type");
    if (embType === "perf.network_request") {
      networkSpans.push(span);
      return;
    } else if (embType === "perf") {
      userSpans.push(span);
      return;
    } else {
      // TODO, iOS not setting emb.type ?
      userSpans.push(span);
      return;
    }
  });

  payload.span_snapshots.forEach(span => {
    sortSpanAttributes(span.attributes);

    if (getAttributeValue(span, "emb.type") === "perf") {
      userSpanSnapshots.push(span);
      return;
    }
  });

  return {
    sessionSpan,
    spanSnapshots: sortSpans(payload.span_snapshots),
    privateSpans: sortSpans(privateSpans),
    networkSpans: sortSpans(networkSpans),
    userSpans: sortSpans(userSpans),
    userSpanSnapshots: sortSpans(userSpanSnapshots),
  };
};

const commonEmbraceSpanAttributes = (
  span: EmbraceSpanData,
): EmbraceSpanAttribute[] =>
  sortSpanAttributes([
    {
      key: "emb.private.sequence_id",
      value: span.attributes.find(
        attr => attr.key === "emb.private.sequence_id",
      )?.value,
    },
    {
      key: "emb.process_identifier",
      value: span.attributes.find(attr => attr.key === "emb.process_identifier")
        ?.value,
    },
    {
      key: "emb.key",
      value: "true",
    },
    {
      key: "emb.type",
      value: "perf",
    },
  ]);

const commonEmbraceSpanSnapshotAttributes = (): EmbraceSpanAttribute[] =>
  sortSpanAttributes([
    {
      key: "emb.key",
      value: "true",
    },
    {
      key: "emb.type",
      value: "perf",
    },
  ]);

const sortSpans = (spans: EmbraceSpanData[]): EmbraceSpanData[] =>
  spans.sort((a, b) => a.name.localeCompare(b.name));

const sortSpanAttributes = (
  attributes: EmbraceSpanAttribute[],
): EmbraceSpanAttribute[] =>
  attributes.sort((a, b) => a.key.localeCompare(b.key));

const getAttributeValue = (span: EmbraceSpanData, key: string): string =>
  span.attributes.find(attr => attr.key === key)?.value || "";

export {
  parseSpanPayload,
  getAttributeValue,
  sortSpanAttributes,
  commonEmbraceSpanAttributes,
  commonEmbraceSpanSnapshotAttributes,
};
