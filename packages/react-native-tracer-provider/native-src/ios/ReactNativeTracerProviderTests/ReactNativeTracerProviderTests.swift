import XCTest
@testable import ReactNativeTracerProvider

import OpenTelemetrySdk
import OpenTelemetryApi
import InMemoryExporter

final class Promise {
  var resolveCalls: [NSDictionary] = []
  
  func resolve(val: Any?) -> Void {
    if let val = val as? NSDictionary {
      resolveCalls.append(val)
    }
  }
  
  func reject(a: String?, b: String?, c: Error?) -> Void {}
}

final class ReactNativeTracerProviderTests: XCTestCase {
  var module: ReactNativeTracerProviderModule!;
  var exporter: InMemoryExporter!;
  var promise: Promise!;

  override func setUp() {
    promise = Promise()
    exporter = InMemoryExporter()
    
    let tracerProvider = TracerProviderBuilder()
      .add(spanProcessor: SimpleSpanProcessor(spanExporter: exporter))
      .build()
    
    module = ReactNativeTracerProviderModule(withTracerProvider: tracerProvider);
    module.getTracer(name: "test", version: "v1", schemaUrl: "")
  }
  
  func getExportedSpans() async throws -> [SpanData] {
    // spans are sent to the exporter asynchronously so need to pause in order to see them
    try await Task.sleep(nanoseconds: UInt64(0.01 * Double(NSEC_PER_SEC)))
    return exporter.getFinishedSpanItems()
  }
  
  func testStartSpanSimple() async throws {
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "", spanBridgeId: "span_0", name: "my-span", kind: "", time: 0.0, attributes: NSDictionary(), links: NSArray(), parentId: "", resolve: promise.resolve, reject: promise.reject)
    module.endSpan(spanBridgeId: "span_0", time: 0.0)
    
    let exportedSpans = try await getExportedSpans()
    XCTAssertEqual(exportedSpans.count, 1)
    XCTAssertEqual(exportedSpans[0].name, "my-span")
    XCTAssertTrue(exportedSpans[0].hasEnded)
    XCTAssertTrue(exportedSpans[0].spanId.isValid)
    XCTAssertTrue(exportedSpans[0].traceId.isValid)
    
    XCTAssertEqual(promise.resolveCalls.count, 1)
    let promiseSpanId = promise.resolveCalls[0].object(forKey: "spanId") as? String
    let promiseTraceId = promise.resolveCalls[0].object(forKey: "traceId") as? String
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
          "traceId": "77770000777700007777000077770000",
        ]
      ]
    ]
    
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "", spanBridgeId: "span_0", name: "my-span", kind: "CLIENT", time: 1718386928001.0, attributes: NSDictionary(dictionary: attributes), links: NSArray(array: links), parentId: "", resolve: promise.resolve, reject: promise.reject)
    module.endSpan(spanBridgeId: "span_0", time:  1728386928001.0)
    
    let exportedSpans = try await getExportedSpans()
    XCTAssertEqual(exportedSpans.count, 1)
    XCTAssertEqual(exportedSpans[0].name, "my-span")
    XCTAssertEqual(exportedSpans[0].kind, SpanKind.client)
    XCTAssertEqual(exportedSpans[0].startTime, Date(timeIntervalSince1970: 1718386928.001))
    
    XCTAssertEqual(exportedSpans[0].attributes.count, 5)
    XCTAssertEqual(exportedSpans[0].attributes["my-attr1"]!.description, "some-string")
    XCTAssertEqual(exportedSpans[0].attributes["my-attr2"]!.description, "1")
    XCTAssertEqual(exportedSpans[0].attributes["my-attr3"]!.description, 344.description)
    XCTAssertEqual(exportedSpans[0].attributes["my-attr4"]!.description, ["str1", "str2"].description)
    XCTAssertEqual(exportedSpans[0].attributes["my-attr5"]!.description, [22,44].description)
    
    XCTAssertEqual(exportedSpans[0].links.count, 2)
    XCTAssertEqual(exportedSpans[0].links[0].context.spanId.hexString, "1111000011110000")
    XCTAssertEqual(exportedSpans[0].links[0].context.traceId.hexString, "22220000222200002222000022220000")
    XCTAssertEqual(exportedSpans[0].links[0].attributes.count, 1)
    XCTAssertEqual(exportedSpans[0].links[0].attributes["link-attr-1"]!.description, "my-link-attr")
    XCTAssertEqual(exportedSpans[0].links[1].context.spanId.hexString, "6666000066660000")
    XCTAssertEqual(exportedSpans[0].links[1].context.traceId.hexString, "77770000777700007777000077770000")
    XCTAssertEqual(exportedSpans[0].links[1].attributes.count, 0)
    
    XCTAssertEqual(exportedSpans[0].endTime, Date(timeIntervalSince1970: 1728386928.001))
  }
  
  func testStartSpanWithParent() async throws {
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "", spanBridgeId: "span_0", name: "parent-span", kind: "", time: 0.0, attributes: NSDictionary(), links: NSArray(), parentId: "", resolve: promise.resolve, reject: promise.reject)
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "", spanBridgeId: "span_1", name: "child-span", kind: "", time: 0.0, attributes: NSDictionary(), links: NSArray(), parentId: "span_0", resolve: promise.resolve, reject: promise.reject)
    module.endSpan(spanBridgeId: "span_0", time: 0.0)
    module.endSpan(spanBridgeId: "span_1", time: 0.0)
      

    let exportedSpans = try await getExportedSpans()
    XCTAssertEqual(exportedSpans.count, 2)
    XCTAssertEqual(exportedSpans[0].name, "parent-span")
    XCTAssertNil(exportedSpans[0].parentSpanId)
    XCTAssertTrue(exportedSpans[0].traceId.isValid)
    let parentSpanId = module.spanContext(spanBridgeId: "span_0").object(forKey: "spanId") as? String
    XCTAssertNotNil(exportedSpans[1].parentSpanId)
    XCTAssertEqual(parentSpanId, exportedSpans[1].parentSpanId!.hexString)
  }
  
  func testSetAttributes() async throws {
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "", spanBridgeId: "span_0", name: "my-span", kind: "", time: 0.0, attributes: NSDictionary(), links: NSArray(), parentId: "", resolve: promise.resolve, reject: promise.reject)
    module.setAttributes(spanBridgeId: "span_0", attributes: NSDictionary(dictionary:[
      "my-attr1": "some-string",
      "my-attr2": true,
      "my-attr3": 344,
      "my-attr4": ["str1", "str2"],
      "my-attr5": [22, 44],
    ]))
    module.endSpan(spanBridgeId: "span_0", time: 0.0)

    let exportedSpans = try await getExportedSpans()
    XCTAssertEqual(exportedSpans.count, 1)
    XCTAssertEqual(exportedSpans[0].name, "my-span")
    XCTAssertEqual(exportedSpans[0].attributes.count, 5)
    XCTAssertEqual(exportedSpans[0].attributes["my-attr1"]!.description, "some-string")
    XCTAssertEqual(exportedSpans[0].attributes["my-attr2"]!.description, "1")
    XCTAssertEqual(exportedSpans[0].attributes["my-attr3"]!.description, 344.description)
    XCTAssertEqual(exportedSpans[0].attributes["my-attr4"]!.description, ["str1", "str2"].description)
    XCTAssertEqual(exportedSpans[0].attributes["my-attr5"]!.description, [22,44].description)
  }
  
  func testAddEvent() async throws {
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "", spanBridgeId: "span_0", name: "my-span", kind: "", time: 0.0, attributes: NSDictionary(), links: NSArray(), parentId: "", resolve: promise.resolve, reject: promise.reject)
    module.addEvent(spanBridgeId: "span_0", eventName: "my-1st-event", attributes: NSDictionary(dictionary:[
      "my-attr1": "some-string",
    ]), time: 0.0)
    module.addEvent(spanBridgeId: "span_0", eventName: "my-2nd-event", attributes: NSDictionary(dictionary:[
      "my-attr2": "other-string",
    ]), time: 1518386928052.0)
    module.endSpan(spanBridgeId: "span_0", time: 0.0)

    let exportedSpans = try await getExportedSpans()
    XCTAssertEqual(exportedSpans.count, 1)
    XCTAssertEqual(exportedSpans[0].events.count, 2)
    XCTAssertEqual(exportedSpans[0].events[0].name, "my-1st-event")
    XCTAssertEqual(exportedSpans[0].events[0].attributes.count, 1)
    XCTAssertEqual(exportedSpans[0].events[0].attributes["my-attr1"]!.description, "some-string")
    XCTAssertEqual(exportedSpans[0].events[1].name, "my-2nd-event")
    XCTAssertEqual(exportedSpans[0].events[1].attributes.count, 1)
    XCTAssertEqual(exportedSpans[0].events[1].attributes["my-attr2"]!.description, "other-string")
    XCTAssertEqual(exportedSpans[0].events[1].timestamp, Date(timeIntervalSince1970: 1518386928.052))
  }
  
  func testSetStatus() async throws {
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "", spanBridgeId: "span_0", name: "my-span", kind: "", time: 0.0, attributes: NSDictionary(), links: NSArray(), parentId: "", resolve: promise.resolve, reject: promise.reject)
    module.setStatus(spanBridgeId: "span_0", status: NSDictionary(dictionary: ["code": "OK"]))
    module.endSpan(spanBridgeId: "span_0", time: 0.0)
    
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "", spanBridgeId: "span_1", name: "my-span", kind: "", time: 0.0, attributes: NSDictionary(), links: NSArray(), parentId: "", resolve: promise.resolve, reject: promise.reject)
    module.setStatus(spanBridgeId: "span_1", status: NSDictionary(dictionary: ["code": "ERROR", "message": "some message"]))
    module.endSpan(spanBridgeId: "span_1", time: 0.0)
    
    let exportedSpans = try await getExportedSpans()
    XCTAssertEqual(exportedSpans.count, 2)
    XCTAssertEqual(exportedSpans[0].status.description, "Status{statusCode=ok}")
    XCTAssertEqual(exportedSpans[1].status.description, "Status{statusCode=error, description=some message}")
  }
   
  func testUpdateName() async throws {
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "", spanBridgeId: "span_0", name: "my-span", kind: "", time: 0.0, attributes: NSDictionary(), links: NSArray(), parentId: "", resolve: promise.resolve, reject: promise.reject)
    module.updateName(spanBridgeId: "span_0", name: "my-updated-span-name")
    module.endSpan(spanBridgeId: "span_0", time: 0.0)
       
    let exportedSpans = try await getExportedSpans()
    XCTAssertEqual(exportedSpans.count, 1)
    XCTAssertEqual(exportedSpans[0].name, "my-updated-span-name")
  }
  
  func testStartSpanInvalidKind() async throws {
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "", spanBridgeId: "span_0", name: "my-span", kind: "foo", time: 0.0, attributes: NSDictionary(), links: NSArray(), parentId: "", resolve: promise.resolve, reject: promise.reject)
    module.endSpan(spanBridgeId: "span_0", time: 0.0)

    let exportedSpans = try await getExportedSpans()
    XCTAssertEqual(exportedSpans.count, 1)
    XCTAssertEqual(exportedSpans[0].kind, SpanKind.internal)
  }
   
  func testSetStatusInvalid() async throws {
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "", spanBridgeId: "span_0", name: "my-span", kind: "foo", time: 0.0, attributes: NSDictionary(), links: NSArray(), parentId: "", resolve: promise.resolve, reject: promise.reject)
    module.setStatus(spanBridgeId: "span_0", status: NSDictionary(dictionary: ["code": "foo"]))
    module.endSpan(spanBridgeId: "span_0", time: 0.0)

    let exportedSpans = try await getExportedSpans()
    XCTAssertEqual(exportedSpans.count, 1)
    XCTAssertEqual(exportedSpans[0].status.description, "Status{statusCode=unset}")
  }

  func testStartSpanWithSchemaUrl() async throws {
    // schemaUrl should form part of the unique key so should not find the tracer we setup
    // in beforeEach if we set a different value
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "schema", spanBridgeId: "span_0", name: "my-span", kind: "", time: 0.0, attributes: NSDictionary(), links: NSArray(), parentId: "", resolve: promise.resolve, reject: promise.reject)
    module.endSpan(spanBridgeId: "span_0", time: 0.0)

    var exportedSpans = try await getExportedSpans()
    XCTAssertEqual(exportedSpans.count, 0)
    
    // Create a tracer with that schemaUrl, should work now
    
    module.getTracer(name: "test", version: "v1", schemaUrl: "schema")
    module.startSpan(tracerName: "test", tracerVersion: "v1", tracerSchemaUrl: "schema", spanBridgeId: "span_0", name: "my-span", kind: "", time: 0.0, attributes: NSDictionary(), links: NSArray(), parentId: "", resolve: promise.resolve, reject: promise.reject)
    module.endSpan(spanBridgeId: "span_0", time: 0.0)

    exportedSpans = try await getExportedSpans()
    XCTAssertEqual(exportedSpans.count, 1)
    XCTAssertEqual(exportedSpans[0].name, "my-span")
    XCTAssertTrue(exportedSpans[0].hasEnded)
  }
}
