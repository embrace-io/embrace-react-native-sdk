import {
  EmbracePayloadMetadata,
  EmbraceSpanAttribute,
  EmbraceSpanData,
  EmbraceSpanEvent,
} from "./embrace";
import {EventProjection, PayloadCategory, SpanProjection} from "../helpers/compare";

declare global {
  namespace ExpectWebdriverIO {
    interface Matchers<R extends void | Promise<void>, T> {
      toMatchGoldenFile(scenario: string, category: PayloadCategory): R;
      toMatchSpan(expected: SpanProjection, within?: EmbraceSpanData[]): R;
      toMatchAttributes(expected: EmbraceSpanAttribute[]): R;
      toMatchEvents(expected: EventProjection[]): R;
      toHaveAttributes(subset: Record<string, string>): R;
      toHaveMetadata(subset: Partial<EmbracePayloadMetadata>): R;
      toHaveParentSpan(parent: EmbraceSpanData | string, within?: EmbraceSpanData[]): R;
      toHaveSpanNames(names: string[]): R;
    }
  }
}
