import React
import XCTest
import EmbraceIO
import OpenTelemetryApi
import OpenTelemetrySdk

@testable import RNEmbraceTracerProvider

class Promise {
    var resolveCalls: [Any?] = []
    var rejectCalls: [String] = []

    func resolve(val: Any?) {
        resolveCalls.append(val)
    }

    func reject(category: String?, msg: String?, error: Error?) {
      rejectCalls.append(msg ?? "unknown error")
    }

    func reset() {
        resolveCalls.removeAll()
        rejectCalls.removeAll()
    }
}

class TestSpanExporter: SpanExporter {
    var exportedSpans: [SpanData] = []

    func export(spans: [SpanData], explicitTimeout: TimeInterval?) -> SpanExporterResultCode {
        exportedSpans.append(contentsOf: spans)
        return SpanExporterResultCode.success
    }

    func flush(explicitTimeout: TimeInterval?) -> SpanExporterResultCode {
        return SpanExporterResultCode.success
    }

    func reset(explicitTimeout: TimeInterval?) {
        exportedSpans.removeAll()
    }

    func shutdown(explicitTimeout: TimeInterval?) {}
}

private let EMBRACE_INTERNAL_SPAN_NAMES = [
    "emb-app-pre-main-init",
    "emb-app-first-frame-rendered",
    "emb-app-startup-warm",
    "emb-sdk-start-process",
    "emb-process-launch",
    "emb-session",
    "emb-sdk-start",
    "emb-setup",
    "POST /dev/null/v2/logs",
    "POST /dev/null/v2/spans"
]

private let DEFAULT_WAIT_TIME = Double(ProcessInfo.processInfo.environment["IOS_TEST_WAIT_TIME"] ?? "") ?? 5.0

class ReactNativeTracerProviderTests: XCTestCase {
  static var exporter: TestSpanExporter!
  var module: ReactNativeTracerProviderModule!
  var promise: Promise!

  override class func setUp() {
      super.setUp()
      exporter = TestSpanExporter()

      do {
          try Embrace
              .setup( options: .init(
                  appId: "myApp",
                  // Set a fake endpoint for unit tests otherwise we'll end up sending actual payloads to Embrace
                  endpoints: Embrace.Endpoints(baseURL: "http://localhost/dev/null", configBaseURL: "http://localhost/dev/null"),
                  export: OpenTelemetryExport(spanExporter: self.exporter)
              ))
              .start()

          // Wait for SDK to fully initialize before running tests
          // On CI, SDK initialization takes longer after keychain write errors
          Thread.sleep(forTimeInterval: 10.0)
      } catch let error as Embrace {
          print(error)
      } catch {
          print(error.localizedDescription)
      }
  }

  override func setUp() async throws {
      promise = Promise()
      module = ReactNativeTracerProviderModule()
      ReactNativeTracerProviderTests.exporter.reset(explicitTimeout: nil)
      module.setupTracer(name: "test", version: "v1", schemaUrl: "")
  }

  func getExportedSpans() async throws -> [SpanData] {
      try await Task.sleep(nanoseconds: UInt64(DEFAULT_WAIT_TIME * Double(NSEC_PER_SEC)))
      return ReactNativeTracerProviderTests.exporter.exportedSpans.filter { span in
          !EMBRACE_INTERNAL_SPAN_NAMES.contains(span.name)
      }
  }

  func testBasicProvider() async throws {
    let tracer = OpenTelemetry.instance.tracerProvider.get(
        instrumentationName: "a_name",
        instrumentationVersion: "1.2.3-versionSemVer"
    )
    let builder = tracer.spanBuilder(spanName: "my-span")
    let span = builder.startSpan()
    span.end()

    let exportedSpans = try await getExportedSpans()

    guard exportedSpans.count == 1 else {
        XCTFail("Expected 1 exported span, got \(exportedSpans.count)")
        return
    }

    XCTAssertEqual(exportedSpans.count, 1)
    XCTAssertEqual(exportedSpans[0].name, "my-span")
    XCTAssertTrue(exportedSpans[0].hasEnded)
  }

  func testStartSpanSimple() async throws {
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "",
                     spanBridgeId: "span_0", name: "my-span", kind: "", time: 0.0,
                     attributes: NSDictionary(), links: NSArray(), parentId: "",
                     resolve: promise.resolve, reject: promise.reject)
    module.endSpan(spanBridgeId: "span_0", time: 0.0)

    let exportedSpans = try await getExportedSpans()

    guard exportedSpans.count == 1 else {
        XCTFail("Expected 1 exported span, got \(exportedSpans.count)")
        return
    }

    XCTAssertEqual(exportedSpans.count, 1)
    XCTAssertEqual(exportedSpans[0].name, "my-span")
    XCTAssertTrue(exportedSpans[0].hasEnded)
    XCTAssertTrue(exportedSpans[0].spanId.isValid)
    XCTAssertTrue(exportedSpans[0].traceId.isValid)

    guard promise.resolveCalls.count == 1 else {
        XCTFail("Expected 1 promise resolve call, got \(promise.resolveCalls.count)")
        return
    }

    XCTAssertEqual(promise.resolveCalls.count, 1)
    let promiseSpanId = (promise.resolveCalls[0] as? NSDictionary)?.object(forKey: "spanId") as? String
    let promiseTraceId = (promise.resolveCalls[0] as? NSDictionary)?.object(forKey: "traceId") as? String
    XCTAssertEqual(promiseSpanId, exportedSpans[0].spanId.hexString)
    XCTAssertEqual(promiseTraceId, exportedSpans[0].traceId.hexString)
  }

  func testStartSpanWithOptions() async throws {
    let attributes: [String: Any] = [
      "my-attr1": "some-string",
      "my-attr2": true,
      "my-attr3": 344,
      "my-attr4": ["str1", "str2"],
      "my-attr5": [22, 44],
      "my-attr6": [true, false]
    ]
    let links = [
      [
        "context": [
          "spanId": "1111000011110000",
          "traceId": "22220000222200002222000022220000"
        ],
        "attributes": [
          "link-attr-1": "my-link-attr"
        ]
      ],
      [
        "context": [
          "spanId": "6666000066660000",
          "traceId": "77770000777700007777000077770000"
        ]
      ]
    ]

    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "",
                     spanBridgeId: "span_0", name: "my-span", kind: "CLIENT",
                     time: 1718386928001.0, attributes: NSDictionary(dictionary: attributes),
                     links: NSArray(array: links), parentId: "",
                     resolve: promise.resolve, reject: promise.reject)
    module.endSpan(spanBridgeId: "span_0", time: 1728386928001.0)

    let exportedSpans = try await getExportedSpans()

    guard exportedSpans.count == 1 else {
        XCTFail("Expected 1 exported span, got \(exportedSpans.count)")
        return
    }

    XCTAssertEqual(exportedSpans.count, 1)
    XCTAssertEqual(exportedSpans[0].name, "my-span")
    XCTAssertEqual(exportedSpans[0].kind, SpanKind.client)
    XCTAssertEqual(exportedSpans[0].startTime, Date(timeIntervalSince1970: 1718386928.001))

    guard exportedSpans[0].attributes.count == 6 else {
        XCTFail("Expected 6 attributes on span, got \(exportedSpans[0].attributes.count)")
        return
    }

    XCTAssertEqual(exportedSpans[0].attributes.count, 6)
    XCTAssertEqual(exportedSpans[0].attributes["my-attr1"]?.description, "some-string")
    XCTAssertEqual(exportedSpans[0].attributes["my-attr2"]?.description, "true")
    XCTAssertEqual(exportedSpans[0].attributes["my-attr3"]?.description, "344")
    XCTAssertEqual(exportedSpans[0].attributes["my-attr4"]?.description, "[str1, str2]")
    XCTAssertEqual(exportedSpans[0].attributes["my-attr5"]?.description, "[22, 44]")
    XCTAssertEqual(exportedSpans[0].attributes["my-attr6"]?.description, "[true, false]")

    guard exportedSpans[0].links.count == 2 else {
        XCTFail("Expected 2 links on span, got \(exportedSpans[0].links.count)")
        return
    }

    XCTAssertEqual(exportedSpans[0].links.count, 2)
    XCTAssertEqual(exportedSpans[0].links[0].context.spanId.hexString, "1111000011110000")
    XCTAssertEqual(exportedSpans[0].links[0].context.traceId.hexString, "22220000222200002222000022220000")
    XCTAssertEqual(exportedSpans[0].links[0].attributes.count, 1)
    XCTAssertEqual(exportedSpans[0].links[0].attributes["link-attr-1"]?.description, "my-link-attr")
    XCTAssertEqual(exportedSpans[0].links[1].context.spanId.hexString, "6666000066660000")
    XCTAssertEqual(exportedSpans[0].links[1].context.traceId.hexString, "77770000777700007777000077770000")
    XCTAssertEqual(exportedSpans[0].links[1].attributes.count, 0)

    XCTAssertEqual(exportedSpans[0].endTime, Date(timeIntervalSince1970: 1728386928.001))
  }

  func testStartSpanWithParent() async throws {
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "",
                     spanBridgeId: "span_0", name: "parent-span", kind: "", time: 0.0,
                     attributes: NSDictionary(), links: NSArray(), parentId: "",
                     resolve: promise.resolve, reject: promise.reject)
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "",
                     spanBridgeId: "span_1", name: "child-span", kind: "", time: 0.0,
                     attributes: NSDictionary(), links: NSArray(), parentId: "span_0",
                     resolve: promise.resolve, reject: promise.reject)
    module.endSpan(spanBridgeId: "span_0", time: 0.0)
    module.endSpan(spanBridgeId: "span_1", time: 0.0)

    let exportedSpans = try await getExportedSpans()

    guard exportedSpans.count == 2 else {
        XCTFail("Expected 2 exported spans, got \(exportedSpans.count)")
        return
    }

    XCTAssertEqual(exportedSpans.count, 2)
    XCTAssertEqual(exportedSpans[0].name, "parent-span")
    XCTAssertNil(exportedSpans[0].parentSpanId)
    XCTAssertTrue(exportedSpans[0].traceId.isValid)

    guard promise.resolveCalls.count == 2 else {
        XCTFail("Expected 2 promise resolve calls, got \(promise.resolveCalls.count)")
        return
    }

    XCTAssertEqual(promise.resolveCalls.count, 2)
    let parentSpanId = (promise.resolveCalls[0] as? NSDictionary)?.object(forKey: "spanId") as? String
    let parentTraceId = (promise.resolveCalls[0] as? NSDictionary)?.object(forKey: "traceId") as? String

    XCTAssertNotNil(exportedSpans[1].parentSpanId)
    XCTAssertEqual(parentSpanId, exportedSpans[1].parentSpanId?.hexString)
    XCTAssertEqual(parentTraceId, exportedSpans[1].traceId.hexString)
  }

  func testStartSpanWithEndedParent() async throws {
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "",
                     spanBridgeId: "span_0", name: "parent-span", kind: "", time: 0.0,
                     attributes: NSDictionary(), links: NSArray(), parentId: "",
                     resolve: promise.resolve, reject: promise.reject)
    module.endSpan(spanBridgeId: "span_0", time: 0.0)

    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "",
                     spanBridgeId: "span_1", name: "child-span", kind: "", time: 0.0,
                     attributes: NSDictionary(), links: NSArray(), parentId: "span_0",
                     resolve: promise.resolve, reject: promise.reject)
    module.endSpan(spanBridgeId: "span_1", time: 0.0)

    let exportedSpans = try await getExportedSpans()

    guard exportedSpans.count == 2 else {
        XCTFail("Expected 2 exported spans, got \(exportedSpans.count)")
        return
    }

    XCTAssertEqual(exportedSpans.count, 2)
    XCTAssertEqual(exportedSpans[0].name, "parent-span")
    XCTAssertNil(exportedSpans[0].parentSpanId)
    XCTAssertTrue(exportedSpans[0].traceId.isValid)

    guard promise.resolveCalls.count == 2 else {
        XCTFail("Expected 2 promise resolve calls, got \(promise.resolveCalls.count)")
        return
    }

    XCTAssertEqual(promise.resolveCalls.count, 2)
    let parentSpanId = (promise.resolveCalls[0] as? NSDictionary)?.object(forKey: "spanId") as? String
    let parentTraceId = (promise.resolveCalls[0] as? NSDictionary)?.object(forKey: "traceId") as? String

    XCTAssertNotNil(exportedSpans[1].parentSpanId)
    XCTAssertEqual(parentSpanId, exportedSpans[1].parentSpanId?.hexString)
    XCTAssertEqual(parentTraceId, exportedSpans[1].traceId.hexString)
  }

 func testStartSpanWithEndedParentAfterClear() async throws {
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "",
                     spanBridgeId: "span_0", name: "parent-span", kind: "", time: 0.0,
                     attributes: NSDictionary(), links: NSArray(), parentId: "",
                     resolve: promise.resolve, reject: promise.reject)
    module.endSpan(spanBridgeId: "span_0", time: 0.0)
   module.clearCompletedSpans()

    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "",
                     spanBridgeId: "span_1", name: "child-span", kind: "", time: 0.0,
                     attributes: NSDictionary(), links: NSArray(), parentId: "span_0",
                     resolve: promise.resolve, reject: promise.reject)
    module.endSpan(spanBridgeId: "span_1", time: 0.0)

    let exportedSpans = try await getExportedSpans()

    guard exportedSpans.count == 2 else {
        XCTFail("Expected 2 exported spans, got \(exportedSpans.count)")
        return
    }

    XCTAssertEqual(exportedSpans.count, 2)
    XCTAssertEqual(exportedSpans[0].name, "parent-span")
    XCTAssertNil(exportedSpans[0].parentSpanId)
    XCTAssertTrue(exportedSpans[0].traceId.isValid)

    guard promise.resolveCalls.count == 2 else {
        XCTFail("Expected 2 promise resolve calls, got \(promise.resolveCalls.count)")
        return
    }

    XCTAssertEqual(promise.resolveCalls.count, 2)
    let parentTraceId = (promise.resolveCalls[0] as? NSDictionary)?.object(forKey: "traceId") as? String

    XCTAssertNil(exportedSpans[1].parentSpanId)
    XCTAssertNotEqual(parentTraceId, exportedSpans[1].traceId.hexString)
  }

  func testSetAttributes() async throws {
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "",
                     spanBridgeId: "span_0", name: "my-span", kind: "", time: 0.0,
                     attributes: NSDictionary(), links: NSArray(), parentId: "",
                     resolve: promise.resolve, reject: promise.reject)
    module.setAttributes(spanBridgeId: "span_0", attributes: NSDictionary(dictionary: [
      "my-attr1": "some-string",
      "my-attr2": true,
      "my-attr3": 344,
      "my-attr4": ["str1", "str2"],
      "my-attr5": [22, 44],
      "my-attr6": [true, false]
    ]))
    module.endSpan(spanBridgeId: "span_0", time: 0.0)

    let exportedSpans = try await getExportedSpans()

    guard exportedSpans.count == 1 else {
        XCTFail("Expected 1 exported span, got \(exportedSpans.count)")
        return
    }

    guard exportedSpans[0].attributes.count == 6 else {
        XCTFail("Expected 6 attributes on span, got \(exportedSpans[0].attributes.count)")
        return
    }

    XCTAssertEqual(exportedSpans.count, 1)
    XCTAssertEqual(exportedSpans[0].name, "my-span")
    XCTAssertEqual(exportedSpans[0].attributes.count, 6)
    XCTAssertEqual(exportedSpans[0].attributes["my-attr1"]?.description, "some-string")
    XCTAssertEqual(exportedSpans[0].attributes["my-attr2"]?.description, "true")
    XCTAssertEqual(exportedSpans[0].attributes["my-attr3"]?.description, "344")
    XCTAssertEqual(exportedSpans[0].attributes["my-attr4"]?.description, "[str1, str2]")
    XCTAssertEqual(exportedSpans[0].attributes["my-attr5"]?.description, "[22, 44]")
    XCTAssertEqual(exportedSpans[0].attributes["my-attr6"]?.description, "[true, false]")
  }

  func testAddEvent() async throws {
    // This is the first test case that runs in alphabetical order, add an extra sleep to
    // give the Embrace SDK a chance to startup before executing
    try await Task.sleep(nanoseconds: UInt64(DEFAULT_WAIT_TIME * Double(NSEC_PER_SEC)))

    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "",
                     spanBridgeId: "span_0", name: "my-span", kind: "", time: 0.0,
                     attributes: NSDictionary(), links: NSArray(), parentId: "",
                     resolve: promise.resolve, reject: promise.reject)
    module.addEvent(spanBridgeId: "span_0", eventName: "my-1st-event", attributes: NSDictionary(dictionary: [
      "my-attr1": "some-string"
    ]), time: 0.0)
    module.addEvent(spanBridgeId: "span_0", eventName: "my-2nd-event", attributes: NSDictionary(dictionary: [
      "my-attr2": "other-string"
    ]), time: 1518386928052.0)
    module.endSpan(spanBridgeId: "span_0", time: 0.0)

    let exportedSpans = try await getExportedSpans()
    guard exportedSpans.count == 1 else {
        XCTFail("Expected 1 exported span, got \(exportedSpans.count)")
        return
    }
    guard exportedSpans[0].events.count == 2 else {
        XCTFail("Expected 2 events on span, got \(exportedSpans[0].events.count)")
        return
    }
    XCTAssertEqual(exportedSpans.count, 1)
    XCTAssertEqual(exportedSpans[0].events.count, 2)
    XCTAssertEqual(exportedSpans[0].events[0].name, "my-1st-event")
    XCTAssertEqual(exportedSpans[0].events[0].attributes.count, 1)
    XCTAssertEqual(exportedSpans[0].events[0].attributes["my-attr1"]?.description, "some-string")
    XCTAssertEqual(exportedSpans[0].events[1].name, "my-2nd-event")
    XCTAssertEqual(exportedSpans[0].events[1].attributes.count, 1)
    XCTAssertEqual(exportedSpans[0].events[1].attributes["my-attr2"]?.description, "other-string")
    XCTAssertEqual(exportedSpans[0].events[1].timestamp, Date(timeIntervalSince1970: 1518386928.052))
  }

  func testSetStatus() async throws {
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "",
                     spanBridgeId: "span_0", name: "my-span", kind: "", time: 0.0,
                     attributes: NSDictionary(), links: NSArray(), parentId: "",
                     resolve: promise.resolve, reject: promise.reject)
    module.setStatus(spanBridgeId: "span_0", status: NSDictionary(dictionary: ["code": "OK"]))
    module.endSpan(spanBridgeId: "span_0", time: 0.0)

    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "",
                     spanBridgeId: "span_1", name: "my-span", kind: "", time: 0.0,
                     attributes: NSDictionary(), links: NSArray(), parentId: "",
                     resolve: promise.resolve, reject: promise.reject)
    module.setStatus(spanBridgeId: "span_1",
                     status: NSDictionary(dictionary: ["code": "ERROR", "message": "some message"]))
    module.endSpan(spanBridgeId: "span_1", time: 0.0)

    let exportedSpans = try await getExportedSpans()

    guard exportedSpans.count == 2 else {
        XCTFail("Expected 2 exported spans, got \(exportedSpans.count)")
        return
    }

    XCTAssertEqual(exportedSpans.count, 2)
    XCTAssertEqual(exportedSpans[0].status.description, "Status{statusCode=ok}")
    XCTAssertEqual(exportedSpans[1].status.description, "Status{statusCode=error, description=some message}")
  }

  func testUpdateName() async throws {
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "",
                     spanBridgeId: "span_0", name: "my-span", kind: "", time: 0.0,
                     attributes: NSDictionary(), links: NSArray(), parentId: "",
                     resolve: promise.resolve, reject: promise.reject)
    module.updateName(spanBridgeId: "span_0", name: "my-updated-span-name")
    module.endSpan(spanBridgeId: "span_0", time: 0.0)

    let exportedSpans = try await getExportedSpans()

    guard exportedSpans.count == 1 else {
        XCTFail("Expected 1 exported span, got \(exportedSpans.count)")
        return
    }

    XCTAssertEqual(exportedSpans.count, 1)
    XCTAssertEqual(exportedSpans[0].name, "my-updated-span-name")
  }

  func testStartSpanInvalidKind() async throws {
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "",
                     spanBridgeId: "span_0", name: "my-span", kind: "foo", time: 0.0,
                     attributes: NSDictionary(), links: NSArray(), parentId: "",
                     resolve: promise.resolve, reject: promise.reject)
    module.endSpan(spanBridgeId: "span_0", time: 0.0)

    let exportedSpans = try await getExportedSpans()

    guard exportedSpans.count == 1 else {
        XCTFail("Expected 1 exported span, got \(exportedSpans.count)")
        return
    }
    
    XCTAssertEqual(exportedSpans.count, 1)
    XCTAssertEqual(exportedSpans[0].kind, SpanKind.internal)
  }

  func testSetStatusInvalid() async throws {
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "",
                     spanBridgeId: "span_0", name: "my-span", kind: "foo", time: 0.0,
                     attributes: NSDictionary(), links: NSArray(), parentId: "",
                     resolve: promise.resolve, reject: promise.reject)
    module.setStatus(spanBridgeId: "span_0", status: NSDictionary(dictionary: ["code": "foo"]))
    module.endSpan(spanBridgeId: "span_0", time: 0.0)

    let exportedSpans = try await getExportedSpans()

    guard exportedSpans.count == 1 else {
        XCTFail("Expected 1 exported span, got \(exportedSpans.count)")
        return
    }

    XCTAssertEqual(exportedSpans.count, 1)
    XCTAssertEqual(exportedSpans[0].status.description, "Status{statusCode=unset}")
  }

  func testStartSpanWithSchemaUrl() async throws {
    // schemaUrl should form part of the unique key so should not find the tracer we setup
    // in beforeEach if we set a different value
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "schema",
                     spanBridgeId: "span_0", name: "my-span", kind: "", time: 0.0,
                     attributes: NSDictionary(), links: NSArray(), parentId: "",
                     resolve: promise.resolve, reject: promise.reject)
    module.endSpan(spanBridgeId: "span_0", time: 0.0)

    var exportedSpans = try await getExportedSpans()
    XCTAssertEqual(exportedSpans.count, 0)

    // Create a tracer with that schemaUrl, should work now

    module.setupTracer(name: "test", version: "v1", schemaUrl: "schema")
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "schema",
                     spanBridgeId: "span_0", name: "my-span", kind: "", time: 0.0,
                     attributes: NSDictionary(), links: NSArray(), parentId: "",
                     resolve: promise.resolve, reject: promise.reject)
    module.endSpan(spanBridgeId: "span_0", time: 0.0)

    exportedSpans = try await getExportedSpans()

    guard exportedSpans.count == 1 else {
        XCTFail("Expected 1 exported span, got \(exportedSpans.count)")
        return
    }

    XCTAssertEqual(exportedSpans.count, 1)
    XCTAssertEqual(exportedSpans[0].name, "my-span")
    XCTAssertTrue(exportedSpans[0].hasEnded)
  }
}

class EmbraceSpansSDKNotStartedTests: XCTestCase {
  func testStartSpanEmbraceNotStarted() async throws {
    let promise = Promise()
    let module = ReactNativeTracerProviderModule()

    // Without the Embrace SDK having started interactions should be no-ops
    module.setupTracer(name: "test", version: "v1", schemaUrl: "")
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "",
                     spanBridgeId: "span_0", name: "my-span", kind: "", time: 0.0,
                     attributes: NSDictionary(), links: NSArray(), parentId: "",
                     resolve: promise.resolve, reject: promise.reject)

    XCTAssertEqual(promise.resolveCalls.count, 0)
    XCTAssertEqual(promise.rejectCalls.count, 1)

    guard promise.rejectCalls.count == 1 else {
        XCTFail("Expected 1 promise reject call, got \(promise.rejectCalls.count)")
        return
    }

    XCTAssertEqual(promise.rejectCalls[0], "tracer not found")
  }
}
