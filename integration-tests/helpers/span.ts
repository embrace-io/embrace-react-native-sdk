import {
  EmbracePayloadSpans,
  EmbraceSpanAttribute,
  EmbraceSpanData,
  ParsedSpanPayload,
} from "../typings/embrace";
import {driver} from "@wdio/globals";

const EMBRACE_INTERNAL_SPAN_NAMES = {
  "emb-sdk-start": true,
  "emb-screen-view": true,
};
/**
 * spans are all included on the same array in the payload, to make testing easier separate them into
 * categories and sort them
 */
const parseSpanPayload = (payload: EmbracePayloadSpans): ParsedSpanPayload => {
  const perfSpans: EmbraceSpanData[] = [];
  const viewSpans: EmbraceSpanData[] = [];
  const privateSpans: EmbraceSpanData[] = [];
  const networkSpans: EmbraceSpanData[] = [];
  const perfSpanSnapshots: EmbraceSpanData[] = [];
  let sessionSpan: EmbraceSpanData = null;

  payload.spans.forEach(span => {
    sortSpanAttributes(span.attributes);

    if (span.name === "emb-session") {
      sessionSpan = span;
      return;
    }

    if (
      getAttributeValue(span, "emb.private") === "true" ||
      EMBRACE_INTERNAL_SPAN_NAMES[span.name]
    ) {
      privateSpans.push(span);
      return;
    }

    const embType = getAttributeValue(span, "emb.type");
    if (embType === "perf.network_request") {
      networkSpans.push(span);
      return;
    } else if (embType === "ux.view") {
      viewSpans.push(span);
    } else if (driver.isAndroid && embType === "perf") {
      perfSpans.push(span);
      return;
    } else if (driver.isIOS && !embType) {
      // iOS does not set emb.type automatically
      perfSpans.push(span);
      return;
    }
  });

  payload.span_snapshots.forEach(span => {
    sortSpanAttributes(span.attributes);

    if (
      getAttributeValue(span, "emb.private") === "true" ||
      EMBRACE_INTERNAL_SPAN_NAMES[span.name]
    ) {
      return;
    }

    const embType = getAttributeValue(span, "emb.type");
    if (driver.isAndroid && embType === "perf") {
      perfSpanSnapshots.push(span);
      return;
    } else if (driver.isIOS && !embType) {
      // iOS does not set emb.type automatically
      perfSpanSnapshots.push(span);
      return;
    }
  });

  return {
    sessionSpan,
    spanSnapshots: sortSpans(payload.span_snapshots),
    privateSpans: sortSpans(privateSpans),
    networkSpans: sortSpans(networkSpans),
    viewSpans: sortSpans(viewSpans),
    perfSpans: sortSpans(perfSpans),
    perfSpanSnapshots: sortSpans(perfSpanSnapshots),
  };
};

const embraceSpanDefaults = () => {
  if (driver.isIOS) {
    return {
      status: "ok",
      links: [],
    };
  }

  if (driver.isAndroid) {
    return {
      parent_span_id: "0000000000000000",
      status: "Unset",
    };
  }
};

const commonEmbraceSpanAttributes = (
  span: EmbraceSpanData,
): EmbraceSpanAttribute[] => {
  if (driver.isIOS) {
    return [];
  }

  if (driver.isAndroid) {
    const perfSpan = getAttributeValue(span, "emb.type") === "perf";
    return sortSpanAttributes([
      {
        key: "emb.private.sequence_id",
        value: span.attributes.find(
          attr => attr.key === "emb.private.sequence_id",
        )?.value,
      },
      {
        key: "emb.process_identifier",
        value: span.attributes.find(
          attr => attr.key === "emb.process_identifier",
        )?.value,
      },
      {
        key: "emb.key",
        value: "true",
      },
      ...(perfSpan
        ? [
            {
              key: "emb.type",
              value: "perf",
            },
          ]
        : []),
    ]);
  }
};

const commonEmbraceSpanSnapshotAttributes = (): EmbraceSpanAttribute[] => {
  if (driver.isIOS) {
    return [];
  }

  if (driver.isAndroid) {
    return sortSpanAttributes([
      {
        key: "emb.key",
        value: "true",
      },
      {
        key: "emb.type",
        value: "perf",
      },
    ]);
  }
};

const sortSpans = (spans: EmbraceSpanData[]): EmbraceSpanData[] =>
  spans.sort((a, b) => {
    if (a.start_time_unix_nano === b.start_time_unix_nano) {
      return a.name.localeCompare(b.name);
    } else {
      return a.start_time_unix_nano > b.start_time_unix_nano ? 1 : -1;
    }
  });

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
  embraceSpanDefaults,
};
