import {
  EmbracePayloadMetadata,
  EmbraceSpanAttribute,
  EmbraceSpanData,
  EmbraceSpanEvent,
  PayloadSection
} from "./embrace";
import {EventProjection, SpanProjection} from "../helpers/compare";

declare global {
  namespace ExpectWebdriverIO {
    interface Matchers<R extends void | Promise<void>, T> {
      toMatchGoldenFile(scenario: string, section: PayloadSection): R;
      toMatchSpan(expected: SpanProjection, within?: EmbraceSpanData[]): R;
      toMatchAttributes(expected: EmbraceSpanAttribute[]): R;
      toMatchEvents(expected: EventProjection[]): R;
      toHaveAttributes(subset: Record<string, string>): R;
      toHaveEvents(subset: EventProjection[]): R;
      toHaveMetadata(subset: Partial<EmbracePayloadMetadata>): R;
      toHaveParentSpan(parent: EmbraceSpanData | string, within?: EmbraceSpanData[]): R;
      toHaveSpanNames(names: string[]): R;
    }
  }
}
