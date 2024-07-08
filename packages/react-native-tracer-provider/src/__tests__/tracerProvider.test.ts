import {
  Attributes,
  context,
  SpanContext,
  SpanKind,
  SpanStatusCode,
  trace,
  Tracer,
} from '@opentelemetry/api';
import { Link } from '@opentelemetry/api/build/src/trace/link';
import {
  EmbraceNativeSpan,
  EmbraceNativeTracerProvider,
} from '../index';

const mockGetTracer = jest.fn();
const mockStartSpan = jest.fn();
const mockSpanContext = jest.fn();
const mockSetAttributes = jest.fn();
const mockAddEvent = jest.fn();
const mockAddLinks = jest.fn();
const mockSetStatus = jest.fn();
const mockUpdateName = jest.fn();
const mockEndSpan = jest.fn();

jest.mock('../TracerProviderModule', () => ({
  TracerProviderModule: {
    getTracer: (name: string, version?: string, schemaUrl?: string) =>
      mockGetTracer(name, version, schemaUrl),
    startSpan: (
      tracerName: string,
      tracerVersion: string,
      tracerSchemaUrl: string,
      id: string,
      name: string,
      kind: string,
      time: number,
      attributes: Attributes,
      links: Link[],
      parentID: string
    ) =>
      mockStartSpan(
        tracerName,
        tracerVersion,
        tracerSchemaUrl,
        id,
        name,
        kind,
        time,
        attributes,
        links,
        parentID
      ),
    spanContext: (id: string) => mockSpanContext(id),
    setAttributes: (id: string, attributes: Attributes) =>
      mockSetAttributes(id, attributes),
    addEvent: (
      id: string,
      name: string,
      attributes: Attributes,
      time: number
    ) => mockAddEvent(id, name, attributes, time),
    addLinks: (id: string, links: Link[]) => mockAddLinks(id, links),
    setStatus: (id: string, status: {code: string, message?: string}) => mockSetStatus(id, status),
    updateName: (id: string, name: string) => mockUpdateName(id, name),
    endSpan: (id: string, time: number) => mockEndSpan(id, time),
  }
}));

describe('Embrace Native Tracer Provider', () => {
  let testTracer: Tracer;

  beforeEach(() => {
    const provider = new EmbraceNativeTracerProvider();
    testTracer = provider.getTracer('test', 'v1');

    jest.resetAllMocks();

    mockStartSpan.mockReturnValue(
      Promise.resolve({
        traceId: '',
        spanId: '',
        traceFlags: 0,
      })
    );
  });

  it('should allow getting a tracer', () => {
    const provider = new EmbraceNativeTracerProvider();
    provider.getTracer('test', 'v1');

    expect(mockGetTracer).toBeCalledWith('test', 'v1', '');
  });

  it('should allow starting a span', () => {
    testTracer.startSpan('my-span');

    expect(mockStartSpan).toHaveBeenCalledWith(
      'test',
      'v1',
      '',
      'test_v1__1',
      'my-span',
      '',
      0,
      {},
      [],
      ''
    );
  });

  it('should allow starting a span with options', () => {
    testTracer.startSpan('my-span', {
      kind: SpanKind.CONSUMER,
      startTime: 1718409600000,
      attributes: {
        'my-attr-1': 'hello',
        'my-attr-2': true,
        'my-attr-3': ['foo', 'bar'],
        'my-attr-4': 55,
      },
      links: [
        {
          context: {
            traceId: 't1',
            spanId: 's1',
            traceFlags: 0,
          },
          attributes: {
            'my-link-attr-1': 'hello',
          },
          droppedAttributesCount: 0,
        },
      ],
    });

    expect(mockStartSpan).toHaveBeenCalledWith(
      'test',
      'v1',
      '',
      'test_v1__1',
      'my-span',
      'CONSUMER',
      1718409600000,
      {
        'my-attr-1': 'hello',
        'my-attr-2': true,
        'my-attr-3': ['foo', 'bar'],
        'my-attr-4': 55,
      },
      [
        {
          context: {
            traceId: 't1',
            spanId: 's1',
            traceFlags: 0,
          },
          attributes: {
            'my-link-attr-1': 'hello',
          },
          droppedAttributesCount: 0,
        },
      ],
      ''
    );
  });

  it('should allow starting a span with a parent', () => {
    const parent = testTracer.startSpan('my-parent-span');
    const parentContext = trace.setSpan(context.active(), parent);
    mockStartSpan.mockClear();

    testTracer.startSpan('my-child-span', {}, parentContext);

    expect(mockStartSpan).toHaveBeenCalledWith(
      'test',
      'v1',
      '',
      'test_v1__2',
      'my-child-span',
      '',
      0,
      {},
      [],
      'test_v1__1'
    );
  });

  it('should not start a span with a parent when root is set', () => {
    const parent = testTracer.startSpan('my-parent-span');
    const parentContext = trace.setSpan(context.active(), parent);
    mockStartSpan.mockClear();

    testTracer.startSpan('my-child-span', { root: true }, parentContext);

    expect(mockStartSpan).toHaveBeenCalledWith(
      'test',
      'v1',
      '',
      'test_v1__2',
      'my-child-span',
      '',
      0,
      {},
      [],
      ''
    );
  });

  it('should allow starting an active span', () => {
    testTracer.startActiveSpan('my-active-span', () => {
      expect(mockStartSpan).toHaveBeenCalledWith(
        'test',
        'v1',
        '',
        'test_v1__1',
        'my-active-span',
        '',
        0,
        {},
        [],
        ''
      );
      mockStartSpan.mockClear();
      testTracer.startSpan('my-child-span');
    });

    expect(mockStartSpan).toHaveBeenCalledWith(
      'test',
      'v1',
      '',
      'test_v1__2',
      'my-child-span',
      '',
      0,
      {},
      [],
      'test_v1__1'
    );
  });

  it('should allow starting an active span with options', () => {
    testTracer.startActiveSpan(
      'my-active-span',
      { kind: SpanKind.CLIENT },
      () => {
        expect(mockStartSpan).toHaveBeenCalledWith(
          'test',
          'v1',
          '',
          'test_v1__1',
          'my-active-span',
          'CLIENT',
          0,
          {},
          [],
          ''
        );
        mockStartSpan.mockClear();
        testTracer.startSpan('my-child-span');
      }
    );

    expect(mockStartSpan).toHaveBeenCalledWith(
      'test',
      'v1',
      '',
      'test_v1__2',
      'my-child-span',
      '',
      0,
      {},
      [],
      'test_v1__1'
    );
  });

  it('should allow starting an active span with children overriding their parent', () => {
    const parent = testTracer.startSpan('my-parent-span');
    const parentContext = trace.setSpan(context.active(), parent);
    mockStartSpan.mockClear();

    testTracer.startActiveSpan(
      'my-active-span',
      { kind: SpanKind.CLIENT },
      () => {
        expect(mockStartSpan).toHaveBeenCalledWith(
          'test',
          'v1',
          '',
          'test_v1__2',
          'my-active-span',
          'CLIENT',
          0,
          {},
          [],
          ''
        );
        mockStartSpan.mockClear();
        testTracer.startSpan('my-child-span', {}, parentContext);
      }
    );

    expect(mockStartSpan).toHaveBeenCalledWith(
      'test',
      'v1',
      '',
      'test_v1__3',
      'my-child-span',
      '',
      0,
      {},
      [],
      'test_v1__1'
    );
  });

  it('should allow starting an active span without setting the global context manager', () => {
    const provider = new EmbraceNativeTracerProvider({
      setGlobalContextManager: false,
    });
    const tracer = provider.getTracer('test', 'v1');

    tracer.startActiveSpan('my-active-span', { kind: SpanKind.CLIENT }, () => {
      expect(mockStartSpan).toHaveBeenCalledWith(
        'test',
        'v1',
        '',
        'test_v1__1',
        'my-active-span',
        'CLIENT',
        0,
        {},
        [],
        ''
      );
      mockStartSpan.mockClear();

      expect(trace.getSpan(context.active())).toBeFalsy();

      tracer.startSpan('my-child-span');
    });

    expect(mockStartSpan).toHaveBeenCalledWith(
      'test',
      'v1',
      '',
      'test_v1__2',
      'my-child-span',
      '',
      0,
      {},
      [],
      'test_v1__1'
    );
  });

  it('should return the span context when it\'s already available ', async () => {
    // Blocking is the default behaviour
    const provider = new EmbraceNativeTracerProvider();
    const tracer = provider.getTracer('test', 'v1');
    const expectedSpanContext = {
      traceId: 't1',
      spanId: 's1',
      traceFlags: 0,
    };
    mockStartSpan.mockReturnValue(Promise.resolve(expectedSpanContext));

    const span = tracer.startSpan('my-span');

    // pause to allow the promise for creating the span to resolve
    await Promise.resolve();

    expect(span.spanContext()).toEqual(expectedSpanContext);
  });

  it('should allow getting a pending span context with a blocking call', () => {
    // Blocking is the default behaviour
    const provider = new EmbraceNativeTracerProvider();
    const tracer = provider.getTracer('test', 'v1');
    mockStartSpan.mockReturnValue(new Promise<SpanContext>(() => {}));

    const span = tracer.startSpan('my-span');
    span.spanContext();

    expect(mockSpanContext).toHaveBeenCalledWith('test_v1__1');
  });

  it('should optionally throw an error when attempting to get a pending span context', () => {
    // Blocking is the default behaviour
    const provider = new EmbraceNativeTracerProvider({
      spanContextSyncBehaviour: 'throw',
    });
    const tracer = provider.getTracer('test', 'v1');
    mockStartSpan.mockReturnValue(new Promise<SpanContext>(() => {}));

    const span = tracer.startSpan('my-span');

    expect(() => span.spanContext()).toThrow(Error);
  });

  it('should allow getting the span context asynchronously', async () => {
    const provider = new EmbraceNativeTracerProvider();
    const tracer = provider.getTracer('test', 'v1');
    const expectedSpanContext = {
      traceId: 't1',
      spanId: 's1',
      traceFlags: 0,
    };
    mockStartSpan.mockReturnValue(Promise.resolve(expectedSpanContext));

    const span = tracer.startSpan('my-span');

    expect(await (span as EmbraceNativeSpan).spanContextAsync()).toEqual({
      traceId: 't1',
      spanId: 's1',
      traceFlags: 0,
    });
  });

  it('should allow setting attributes on a span', () => {
    const span = testTracer.startSpan('my-span');
    span.setAttribute('my-attr', 'val1');

    expect(mockSetAttributes).toHaveBeenCalledWith('test_v1__1', {
      'my-attr': 'val1',
    });

    mockSetAttributes.mockClear();
    span.setAttributes({
      'my-attr': 'val1',
      'my-other-attr': 'val2',
    });

    expect(mockSetAttributes).toHaveBeenCalledWith('test_v1__1', {
      'my-attr': 'val1',
      'my-other-attr': 'val2',
    });
  });

  it('should allow adding an event to a span', () => {
    const span = testTracer.startSpan('my-span');
    span.addEvent('my-event');

    expect(mockAddEvent).toHaveBeenCalledWith('test_v1__1', 'my-event', {}, 0);
  });

  it('should allow adding an event to a span with attributes', () => {
    const span = testTracer.startSpan('my-span');
    span.addEvent('my-event', { 'my-attr': 'val1' });

    expect(mockAddEvent).toHaveBeenCalledWith(
      'test_v1__1',
      'my-event',
      { 'my-attr': 'val1' },
      0
    );
  });

  it('should allow adding an event to a span with a timestamp', () => {
    const span = testTracer.startSpan('my-span');
    span.addEvent('my-event', new Date(Date.UTC(2019, 5, 15, 0, 0, 0, 0)));

    expect(mockAddEvent).toHaveBeenCalledWith(
      'test_v1__1',
      'my-event',
      {},
      1560556800000
    );
  });

  it('should allow adding an event to a span with attributes and a timestamp', () => {
    const span = testTracer.startSpan('my-span');
    span.addEvent('my-event', { 'my-attr': 'val1' }, 1590556800000);

    expect(mockAddEvent).toHaveBeenCalledWith(
      'test_v1__1',
      'my-event',
      { 'my-attr': 'val1' },
      1590556800000
    );
  });

  it('should allow setting links on a span', () => {
    const span = testTracer.startSpan('my-span');
    const link1 = {
      context: {
        traceId: 't1',
        spanId: 's1',
        traceFlags: 0,
      },
      attributes: {
        'my-link-attr-1': 'hello',
      },
      droppedAttributesCount: 0,
    };

    span.addLink(link1);

    expect(mockAddLinks).toHaveBeenCalledWith('test_v1__1', [link1]);

    mockAddLinks.mockClear();
    const link2 = {
      context: {
        traceId: 't2',
        spanId: 's2',
        traceFlags: 0,
      },
      attributes: {
        'my-link-attr-2': 'bye',
      },
      droppedAttributesCount: 0,
    };
    span.addLinks([link2]);

    expect(mockAddLinks).toHaveBeenCalledWith('test_v1__1', [link2]);
  });

  it('should allow setting a span\'s status', () => {
    const span = testTracer.startSpan('my-span');
    span.setStatus({ code: SpanStatusCode.ERROR });
    expect(mockSetStatus).toHaveBeenCalledWith('test_v1__1', {
      code: 'ERROR',
    });
  });

  it('should allow updating a span\'s name', () => {
    const span = testTracer.startSpan('my-span');
    span.updateName('new-name');
    expect(mockUpdateName).toHaveBeenCalledWith('test_v1__1', 'new-name');
  });

  it('should allow recording an exception on the span', () => {
    const span = testTracer.startSpan('my-span');
    span.recordException({ message: 'error', name: 'error-name' });

    expect(mockAddEvent).toHaveBeenCalledWith(
      'test_v1__1',
      'exception',
      { 'exception.message': 'error', 'exception.type': 'error-name' },
      0
    );
  });

  it('should allow recording an exception on the span with a code and stack trace', () => {
    const span = testTracer.startSpan('my-span');
    span.recordException({
      message: 'error',
      name: 'error-name',
      code: 'error-code',
      stack: 'error-stack-trace',
    });

    expect(mockAddEvent).toHaveBeenCalledWith(
      'test_v1__1',
      'exception',
      {
        'exception.message': 'error',
        'exception.type': 'error-code',
        'exception.stacktrace': 'error-stack-trace',
      },
      0
    );
  });

  it('should allow recording an exception on the span with a time', () => {
    const span = testTracer.startSpan('my-span');
    span.recordException('error', new Date(Date.UTC(2024, 5, 15, 0, 0, 0)));

    expect(mockAddEvent).toHaveBeenCalledWith(
      'test_v1__1',
      'exception',
      { 'exception.message': 'error' },
      1718409600000
    );
  });

  it('should allow ending a span', () => {
    const span = testTracer.startSpan('my-span');

    expect(span.isRecording()).toBe(true);

    span.end();

    expect(mockEndSpan).toHaveBeenCalledWith('test_v1__1', 0);
    expect(span.isRecording()).toBe(false);

    // No update operations should go through after the span is ended
    span.setAttributes({
      'my-attr': 'val1',
      'my-other-attr': 'val2',
    });
    span.addEvent('my-event');
    span.addLinks([
      {
        context: {
          traceId: 't1',
          spanId: 's1',
          traceFlags: 0,
        },
        attributes: {
          'my-link-attr-1': 'hi',
        },
        droppedAttributesCount: 0,
      },
    ]);
    span.setStatus({ code: SpanStatusCode.ERROR });
    span.updateName('new-name');
    span.recordException({ message: 'error' });
    mockEndSpan.mockClear();
    span.end();

    expect(mockSetAttributes).not.toHaveBeenCalled();
    expect(mockAddEvent).not.toHaveBeenCalled();
    expect(mockAddLinks).not.toHaveBeenCalled();
    expect(mockSetStatus).not.toHaveBeenCalled();
    expect(mockUpdateName).not.toHaveBeenCalled();
    expect(mockEndSpan).not.toHaveBeenCalled();
  });

  it('should allow ending a span with a time', () => {
    const span = testTracer.startSpan('my-span');
    span.end([1600556800, 200000000]);

    expect(mockEndSpan).toHaveBeenCalledWith('test_v1__1', 1600556800200);
  });

  it('should allow getting a tracer with a schemaUrl', () => {
    const provider = new EmbraceNativeTracerProvider();
    const tracerWithSchema = provider.getTracer('test', 'v1', {schemaUrl: 's1'});

    expect(mockGetTracer).toBeCalledWith('test', 'v1', 's1');

    tracerWithSchema.startSpan('my-span');

    // Schema URL should be included to uniquely identify tracer and spans
    expect(mockStartSpan).toHaveBeenCalledWith(
      'test',
      'v1',
      's1',
      'test_v1_s1_1',
      'my-span',
      '',
      0,
      {},
      [],
      ''
    );
  });
});
