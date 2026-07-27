import {EmbraceSpanAttribute, EmbraceSpanData, EmbraceSpanEvent} from "./embrace";
import {EventProjection, SpanCategory, SpanProjection} from "../helpers/compare";

declare global {
  namespace ExpectWebdriverIO {
    interface Matchers<R extends void | Promise<void>, T> {
      toMatchGoldenFile(scenario: string, category: SpanCategory): R;
      toMatchSpan(expected: SpanProjection, within?: EmbraceSpanData[]): R;
      toMatchAttributes(expected: EmbraceSpanAttribute[]): R;
      toMatchEvents(expected: EventProjection[]): R;
      toHaveAttributes(subset: Record<string, string>): R;
      toHaveParentSpan(parent: EmbraceSpanData | string, within?: EmbraceSpanData[]): R;
      toHaveSpanNames(names: string[]): R;
    }
  }
}
