import {ReadableSpan} from "@opentelemetry/sdk-trace-base/build/src/export/ReadableSpan";
import {SpanExporter} from "@opentelemetry/sdk-trace-base";

class TestSpanExporter implements SpanExporter {
  public exportedSpans: ReadableSpan[];

  constructor() {
    this.exportedSpans = [];
  }

  public export(spans: ReadableSpan[]) {
    this.exportedSpans.push(...spans);
  }

  public async shutdown() {
    this.reset();
  }

  public reset() {
    this.exportedSpans = [];
  }
}

export {TestSpanExporter};
