type SPAN_STATUS = "Unset" | "Error";
type COUNT_SPAN_RETURN = "PASS" | "COUNT" | "NO_COUNT";

interface SpanEventAttributes {
  [key: string]: string;
}

interface SpanEventEvent {
  [key: string]: SpanEventEventObject;
}

interface SpanEventsTransformed {
  [key: string]: [SpanAttributes[]];
}

interface SpanEventEventObject {
  expectedInstances: number;
  attributes: SpanEventAttributes;
  status?: SPAN_STATUS;
}

interface SpanEventObject {
  expectedInstances: number;
  events?: SpanEventEvent[];
  attributes?: SpanEventAttributes;
  status?: SPAN_STATUS;
  parentSpanId?: string;
}

/**
 * The key is the name of the span eg: emb-session
 */
interface SpanEventExpectedRequest {
  [key: string]: SpanEventObject;
}

interface SpanEventExpectedResponse {
  [key: string]: {
    request: SpanEventObject;
    response: {found: number};
  };
}

interface SpanEvent {
  name: string;
  attributes: SpanAttributes[];
}

interface SpanAttributes {
  key: string;
  value: string;
}
interface SpanAsMap {
  [key: string]: Span;
}
interface Span {
  name: string;
  status: SPAN_STATUS;
  events: SpanEvent[];
  attributes: SpanAttributes[];
  parent_span_id?: string;
}

const countSpanEvent = (
  spans: Span[],
  spanEventExpected: SpanEventExpectedRequest,
): SpanEventExpectedResponse => {
  const spanEventCountResponse: SpanEventExpectedResponse = {};

  const transformedSpan: SpanAsMap = {};
  spans.forEach(span => {
    transformedSpan[span.name] = span;
  });
  Object.entries(spanEventExpected).forEach(([key, value]) => {
    const spanFound = value;
    const span = transformedSpan[key];

    if (!spanEventCountResponse[key]) {
      spanEventCountResponse[key] = {
        request: spanFound,
        response: {found: 0},
      };
    }

    if (span) {
      if (spanFound.status && spanFound.status !== span.status) {
        return;
      }
      if (
        spanFound.parentSpanId &&
        spanFound.parentSpanId !== span.parent_span_id
      ) {
        return;
      }
      let shouldCount = true;

      const countSpanAttributesResponse = countSpanAttributes(
        spanFound.attributes,
        span.attributes,
      );
      console.log("SPANSSS",countSpanAttributesResponse, spanFound.attributes, span.attributes)
      if (countSpanAttributesResponse === "NO_COUNT") {
        // shouldCount = false;
        console.error(
          "countSpanAttributesResponse",
          countSpanAttributesResponse,
        );
      }

      if (spanFound.events) {
        const countSpanEventResponse = [];
        spanFound.events.forEach(events => {
          const countSpanEventResponseTmp = countSpanEvents(
            events,
            span.events,
          );
          countSpanEventResponse.push(countSpanEventResponseTmp);
        });
        console.log("NOSE",countSpanEventResponse )
        const noCountItem = countSpanEventResponse.find(
          item => item === "NO_COUNT",
        );
        if (noCountItem) {
          shouldCount = false;
          console.error("countSpanEventResponse", countSpanEventResponse);
        }
      }

      if (shouldCount) {
        spanEventCountResponse[span.name].response.found++;
      }
    }
  });

  return spanEventCountResponse;
};

const countSpanAttributes = (
  spanExpectedAttributes: SpanEventAttributes,
  spanAttributes: SpanAttributes[],
): COUNT_SPAN_RETURN => {
  if (!spanExpectedAttributes) return "PASS";

  const attributesToFound = Object.keys(spanExpectedAttributes).length;

  if (attributesToFound === 0) return "PASS";

  const spanAttributeTransformed: SpanEventAttributes = {};

  spanAttributes.forEach(({key, value}) => {
    spanAttributeTransformed[key] = value;
  });

  let attributesFound = 0;

  Object.entries(spanExpectedAttributes).forEach(([key, value]) => {
    const foundValue = spanAttributeTransformed[key];
    if (value === foundValue) {
      attributesFound++;
    }
  });

  return attributesToFound === attributesFound ? "COUNT" : "NO_COUNT";
};
const countSpanEvents = (
  spanExpectedEvents: SpanEventEvent,
  spanEvents: SpanEvent[],
): COUNT_SPAN_RETURN => {
  if (!spanExpectedEvents) return "PASS";

  const eventsToFound = Object.entries(spanExpectedEvents);
  const eventsToFoundLenght = eventsToFound.length;
  if (eventsToFoundLenght === 0) return "PASS";

  let eventsFound = 0;

  const spanEventsTransformed: SpanEventsTransformed = {};

  spanEvents.forEach(({name, attributes}) => {
    if (spanEventsTransformed[name]) {
      spanEventsTransformed[name].push(attributes);
      return;
    }
    spanEventsTransformed[name] = [attributes];
  });

  eventsToFound.forEach(([key, value]) => {
    const eventFound = spanEventsTransformed[key];
    if (!eventFound) return;
    const {attributes, expectedInstances} = value;

    const countSpanAttributesresponses = [];

    eventFound.forEach(atts => {
      const countSpanAttributesresponse = countSpanAttributes(attributes, atts);
      if (
        countSpanAttributesresponse === "COUNT" ||
        countSpanAttributesresponse === "PASS"
      ) {
        countSpanAttributesresponses.push(countSpanAttributesresponse);
      }
    });

    if (expectedInstances === countSpanAttributesresponses.length) {
      eventsFound++;
    }
  });
  return eventsToFoundLenght === eventsFound ? "COUNT" : "NO_COUNT";
};

export {countSpanEvent, countSpanAttributes};
export type {
  Span,
  SpanEventExpectedRequest,
  SpanEventExpectedResponse,
  SpanEventAttributes,
};
