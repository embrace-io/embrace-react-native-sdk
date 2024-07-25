import XCTest
import EmbraceIO
import EmbraceOTelInternal
import OpenTelemetryApi
@testable import RNEmbrace

class TestExporter: EmbraceSpanExporter {
    var exportedSpans: [SpanData] = []

    func export(spans: [SpanData]) -> SpanExporterResultCode {
        exportedSpans.append(contentsOf: spans)
        return SpanExporterResultCode.success
    }

    func flush() -> SpanExporterResultCode {
        return SpanExporterResultCode.success
    }

    func reset() {
        exportedSpans.removeAll()
    }

    func shutdown() {}
}

class Promise {
    var resolveCalls: [Any?] = []
    var rejectCalls: [String] = []

    func resolve(val: Any?) {
        resolveCalls.append(val)
    }

    func reject(a: String?, b: String?, c: Error?) {
        rejectCalls.append(b!)
    }

    func reset() {
        resolveCalls.removeAll()
        rejectCalls.removeAll()
    }
}

private let EMBRACE_INTERNAL_SPAN_NAMES = ["emb-session", "emb-sdk-start", "emb-process-launch",
                                           "POST /v2/logs", "POST /v2/spans"]

class EmbraceManagerTests: XCTestCase {
    var module: EmbraceManager!
    var promise: Promise!

    override func setUp() async throws {
        promise = Promise()
        module = EmbraceManager()
    }

    func testStartNativeEmbraceSDK() async throws {
        module.startNativeEmbraceSDK("myApp", resolve: promise.resolve, rejecter: promise.reject)

        try await Task.sleep(nanoseconds: UInt64(5.0 * Double(NSEC_PER_SEC)))
        XCTAssertEqual(promise.resolveCalls.count, 1)
        XCTAssertTrue((promise.resolveCalls[0] as? Bool)!)

        module.isStarted(promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 2)
        XCTAssertTrue((promise.resolveCalls[1] as? Bool)!)
    }
}

class EmbraceSpansTests: XCTestCase {
    static var exporter: TestExporter!
    var module: EmbraceManager!
    var promise: Promise!

    override class func setUp() {
        super.setUp()
        exporter = TestExporter()

        do {
            try Embrace
                .setup( options: .init(
                    appId: "myApp",
                    export:
                        OpenTelemetryExport(
                            spanExporter: self.exporter
                        )
                ) )
                .start()
        } catch {
        }
    }

    override func setUp() async throws {
        promise = Promise()
        module = EmbraceManager()
        EmbraceSpansTests.exporter.reset()
    }

    func getExportedSpans() async throws -> [SpanData] {
        try await Task.sleep(nanoseconds: UInt64(5.0 * Double(NSEC_PER_SEC)))
        return EmbraceSpansTests.exporter.exportedSpans.filter { span in
            !EMBRACE_INTERNAL_SPAN_NAMES.contains(span.name)
        }
    }

    func testStartSpan() async throws {
        module.startSpan("my-span", parentSpanId: "", startTimeMS: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        module.startSpan("span-never-stopped", parentSpanId: "", startTimeMS: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 2)
        let spanId = (promise.resolveCalls[0] as? String)!
        module.stopSpan(spanId, errorCodeString: "", endTimeMS: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 3)
        XCTAssertTrue((promise.resolveCalls[2] as? Bool)!)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 1)
        XCTAssertEqual(exportedSpans[0].name, "my-span")
        XCTAssertNil(exportedSpans[0].parentSpanId)
        XCTAssertEqual(exportedSpans[0].attributes.count, 1)
        XCTAssertEqual(exportedSpans[0].attributes["emb.type"]!.description, "perf")
        XCTAssertEqual(exportedSpans[0].status, Status.ok)
        XCTAssertTrue(exportedSpans[0].hasEnded)
    }

    func testStartSpanWithParent() async throws {
        module.startSpan("parent-span", parentSpanId: "", startTimeMS: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let parentSpanId = (promise.resolveCalls[0] as? String)!
        promise.reset()

        module.startSpan("child-span", parentSpanId: parentSpanId, startTimeMS: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let childSpanId = (promise.resolveCalls[0] as? String)!

        module.stopSpan(parentSpanId, errorCodeString: "", endTimeMS: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        module.stopSpan(childSpanId, errorCodeString: "", endTimeMS: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 2)
        XCTAssertEqual(exportedSpans[0].name, "parent-span")
        XCTAssertNil(exportedSpans[0].parentSpanId)
        XCTAssertEqual(exportedSpans[1].name, "child-span")
        XCTAssertEqual(exportedSpans[1].parentSpanId?.hexString, exportedSpans[0].spanId.hexString)
    }

    func testStartSpanWithStoppedParent() async throws {
        module.startSpan("stopped-parent-span", parentSpanId: "", startTimeMS: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let parentSpanId = (promise.resolveCalls[0] as? String)!
        module.stopSpan(parentSpanId, errorCodeString: "", endTimeMS: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        promise.reset()

        module.startSpan("child-span", parentSpanId: parentSpanId, startTimeMS: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let childSpanId = (promise.resolveCalls[0] as? String)!
        module.stopSpan(childSpanId, errorCodeString: "", endTimeMS: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 2)
        XCTAssertEqual(exportedSpans[0].name, "stopped-parent-span")
        XCTAssertNil(exportedSpans[0].parentSpanId)
        XCTAssertEqual(exportedSpans[1].name, "child-span")
        XCTAssertEqual(exportedSpans[1].parentSpanId?.hexString, exportedSpans[0].spanId.hexString)
    }

    func testStartSpanWithTimes() async throws {
        module.startSpan("span-with-times", parentSpanId: "", startTimeMS: 1721765402001.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let spanId = (promise.resolveCalls[0] as? String)!
        module.stopSpan(spanId, errorCodeString: "", endTimeMS: 1721765409002.0,
                        resolver: promise.resolve, rejecter: promise.reject)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 1)
        XCTAssertEqual(exportedSpans[0].name, "span-with-times")
        XCTAssertEqual(exportedSpans[0].startTime, Date(timeIntervalSince1970: 1721765402.001))
        XCTAssertEqual(exportedSpans[0].endTime, Date(timeIntervalSince1970: 1721765409.002))
    }

    func testStopSpanWithErrorCode() async throws {
        module.startSpan("failure-span", parentSpanId: "", startTimeMS: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        module.startSpan("user-abandon-span", parentSpanId: "", startTimeMS: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        module.startSpan("unknown-span", parentSpanId: "", startTimeMS: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        module.startSpan("invalid-error-code-span", parentSpanId: "", startTimeMS: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 4)
        let failureSpanId = (promise.resolveCalls[0] as? String)!
        let userAbandonSpanId = (promise.resolveCalls[1] as? String)!
        let unknownSpanId = (promise.resolveCalls[2] as? String)!
        let invalidErrorCodeSpanId = (promise.resolveCalls[3] as? String)!

        module.stopSpan(failureSpanId, errorCodeString: "Failure", endTimeMS: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        module.stopSpan(userAbandonSpanId, errorCodeString: "UserAbandon", endTimeMS: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        module.stopSpan(unknownSpanId, errorCodeString: "Unknown", endTimeMS: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        module.stopSpan(invalidErrorCodeSpanId, errorCodeString: "foo", endTimeMS: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 4)
        XCTAssertEqual(exportedSpans[0].name, "failure-span")
        XCTAssertEqual(exportedSpans[0].status, Status.error(description: "failure"))
        XCTAssertEqual(exportedSpans[0].attributes["emb.error_code"]!.description, "failure")

        XCTAssertEqual(exportedSpans[1].name, "user-abandon-span")
        XCTAssertEqual(exportedSpans[1].status, Status.error(description: "userAbandon"))
        XCTAssertEqual(exportedSpans[1].attributes["emb.error_code"]!.description, "userAbandon")

        XCTAssertEqual(exportedSpans[2].name, "unknown-span")
        XCTAssertEqual(exportedSpans[2].status, Status.error(description: "unknown"))
        XCTAssertEqual(exportedSpans[2].attributes["emb.error_code"]!.description, "unknown")

        XCTAssertEqual(exportedSpans[3].name, "invalid-error-code-span")
        XCTAssertEqual(exportedSpans[3].status, Status.ok)
        XCTAssertNil(exportedSpans[3].attributes["emb.error_code"])
    }

    func testStopSpanInvalidId() async throws {
        module.stopSpan("invalid", errorCodeString: "", endTimeMS: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 0)
        XCTAssertEqual(promise.rejectCalls.count, 1)
        XCTAssertEqual(promise.rejectCalls[0], "Could not retrieve a span with the given id")
    }

    func testAddSpanEvent() async throws {
        module.startSpan("my-span", parentSpanId: "", startTimeMS: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let spanId = (promise.resolveCalls[0] as? String)!

        module.addSpanEventToSpan(spanId, name: "my-event", time: 1721765404001.0, attributes: NSDictionary(),
                                  resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 2)
        XCTAssertTrue((promise.resolveCalls[1] as? Bool)!)
        module.stopSpan(spanId, errorCodeString: "", endTimeMS: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        // Events added after the span ends should be ignored
        module.addSpanEventToSpan(spanId, name: "my-event-after-stop", time: 0.0, attributes: NSDictionary(),
                                  resolver: promise.resolve, rejecter: promise.reject)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 1)
        XCTAssertEqual(exportedSpans[0].name, "my-span")
        XCTAssertEqual(exportedSpans[0].events.count, 1)
        XCTAssertEqual(exportedSpans[0].events[0].name, "my-event")
        XCTAssertEqual(exportedSpans[0].events[0].timestamp, Date(timeIntervalSince1970: 1721765404.001))
        XCTAssertEqual(exportedSpans[0].events[0].attributes.count, 0)
    }

    func testAddSpanEventWithAttributes() async throws {
        module.startSpan("my-span", parentSpanId: "", startTimeMS: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let spanId = (promise.resolveCalls[0] as? String)!

        module.addSpanEventToSpan(spanId, name: "my-event", time: 1721765404001.0,
                                  attributes: NSDictionary(dictionary: [
                                    "my-attr1": "foo",
                                    "my-attr2": "bar"
                                  ]),
                                  resolver: promise.resolve, rejecter: promise.reject)
        module.stopSpan(spanId, errorCodeString: "", endTimeMS: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 1)
        XCTAssertEqual(exportedSpans[0].name, "my-span")
        XCTAssertEqual(exportedSpans[0].events.count, 1)
        XCTAssertEqual(exportedSpans[0].events[0].name, "my-event")
        XCTAssertEqual(exportedSpans[0].events[0].timestamp, Date(timeIntervalSince1970: 1721765404.001))
        XCTAssertEqual(exportedSpans[0].events[0].attributes.count, 2)
        XCTAssertEqual(exportedSpans[0].events[0].attributes["my-attr1"]!.description, "foo")
        XCTAssertEqual(exportedSpans[0].events[0].attributes["my-attr2"]!.description, "bar")
    }

    func testAddSpanEventInvalidId() async throws {
        module.addSpanEventToSpan("invalid", name: "my-event", time: 1721765404001.0, attributes: NSDictionary(),
                                  resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 0)
        XCTAssertEqual(promise.rejectCalls.count, 1)
        XCTAssertEqual(promise.rejectCalls[0], "Could not retrieve a span with the given id")
    }

    func testAddSpanAttribute() async throws {
        module.startSpan("my-span", parentSpanId: "", startTimeMS: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let spanId = (promise.resolveCalls[0] as? String)!

        module.addSpanAttributeToSpan(spanId, key: "my-attr1", value: "foo",
                                      resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 2)
        XCTAssertTrue((promise.resolveCalls[1] as? Bool)!)
        module.addSpanAttributeToSpan(spanId, key: "my-attr2", value: "bar",
                                      resolver: promise.resolve, rejecter: promise.reject)
        module.stopSpan(spanId, errorCodeString: "", endTimeMS: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        // Attributes added after the span ends should be ignored
        module.addSpanAttributeToSpan(spanId, key: "my-attr3", value: "baz",
                                      resolver: promise.resolve, rejecter: promise.reject)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 1)
        XCTAssertEqual(exportedSpans[0].name, "my-span")
        XCTAssertEqual(exportedSpans[0].attributes.count, 3)
        XCTAssertEqual(exportedSpans[0].attributes["emb.type"]!.description, "perf")
        XCTAssertEqual(exportedSpans[0].attributes["my-attr1"]!.description, "foo")
        XCTAssertEqual(exportedSpans[0].attributes["my-attr2"]!.description, "bar")
    }

    func testAddSpanAttributeInvalidId() async throws {
        module.addSpanAttributeToSpan("invalid", key: "my-attr1", value: "foo",
                                      resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 0)
        XCTAssertEqual(promise.rejectCalls.count, 1)
        XCTAssertEqual(promise.rejectCalls[0], "Could not retrieve a span with the given id")
    }

    func testRecordCompletedSpan() async throws {
        let attributes = NSDictionary(dictionary: [
            "my-attr1": "foo",
            "my-attr2": "bar"
        ])
        let events = NSArray(array: [
            NSDictionary(dictionary: [
                "name": "event-1",
                "timeStampMs": 1721765405077.0
            ]),
            NSDictionary(dictionary: [
                "name": "event-2",
                "timeStampMs": 1721765406088.0,
                "attributes": NSDictionary(dictionary: [
                    "event-2-attr-1": "foo",
                    "event-2-attr-2": "bar"
                ])
            ])
        ])

        module.recordCompletedSpan("my-span", startTimeMS: 1721765404001.0, endTimeMS: 1721765407003.0,
                                   errorCodeString: "", parentSpanId: "", attributes: attributes, events: events,
                                   resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        XCTAssertTrue((promise.resolveCalls[0] as? Bool)!)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 1)
        XCTAssertEqual(exportedSpans[0].name, "my-span")
        XCTAssertNil(exportedSpans[0].parentSpanId)
        XCTAssertEqual(exportedSpans[0].attributes.count, 3)
        XCTAssertEqual(exportedSpans[0].attributes["emb.type"]!.description, "perf")
        XCTAssertEqual(exportedSpans[0].attributes["my-attr1"]!.description, "foo")
        XCTAssertEqual(exportedSpans[0].attributes["my-attr2"]!.description, "bar")
        XCTAssertEqual(exportedSpans[0].startTime, Date(timeIntervalSince1970: 1721765404.001))
        XCTAssertEqual(exportedSpans[0].endTime, Date(timeIntervalSince1970: 1721765407.003))
        XCTAssertEqual(exportedSpans[0].events.count, 2)
        XCTAssertEqual(exportedSpans[0].events[0].name, "event-1")
        XCTAssertEqual(exportedSpans[0].events[0].timestamp, Date(timeIntervalSince1970: 1721765405.077))
        XCTAssertEqual(exportedSpans[0].events[0].attributes.count, 0)
        XCTAssertEqual(exportedSpans[0].events[1].name, "event-2")
        XCTAssertEqual(exportedSpans[0].events[1].timestamp, Date(timeIntervalSince1970: 1721765406.088))
        XCTAssertEqual(exportedSpans[0].events[1].attributes.count, 2)
        XCTAssertEqual(exportedSpans[0].events[1].attributes["event-2-attr-1"]!.description, "foo")
        XCTAssertEqual(exportedSpans[0].events[1].attributes["event-2-attr-2"]!.description, "bar")
        XCTAssertEqual(exportedSpans[0].status, Status.unset)
        XCTAssertTrue(exportedSpans[0].hasEnded)
    }

    func testRecordCompletedSpanWithParent() async throws {
        module.startSpan("parent-span", parentSpanId: "", startTimeMS: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let parentSpanId = (promise.resolveCalls[0] as? String)!
        module.stopSpan(parentSpanId, errorCodeString: "", endTimeMS: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        promise.reset()

        module.recordCompletedSpan("my-span-valid-parent", startTimeMS: 0.0, endTimeMS: 0.0,
                                   errorCodeString: "", parentSpanId: parentSpanId,
                                   attributes: NSDictionary(), events: NSArray(),
                                   resolver: promise.resolve, rejecter: promise.reject)
        // An invalid parent ID shouldn't prevent the span from otherwise being recorded
        module.recordCompletedSpan("my-span-invalid-parent", startTimeMS: 0.0, endTimeMS: 0.0,
                                   errorCodeString: "", parentSpanId: "invalid",
                                   attributes: NSDictionary(), events: NSArray(),
                                   resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 2)
        XCTAssertTrue((promise.resolveCalls[0] as? Bool)!)
        XCTAssertTrue((promise.resolveCalls[1] as? Bool)!)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 3)
        XCTAssertEqual(exportedSpans[0].name, "parent-span")
        XCTAssertEqual(exportedSpans[1].name, "my-span-valid-parent")
        XCTAssertEqual(exportedSpans[1].parentSpanId?.hexString, exportedSpans[0].spanId.hexString)
        XCTAssertEqual(exportedSpans[1].attributes.count, 1)
        XCTAssertEqual(exportedSpans[1].attributes["emb.type"]!.description, "perf")
        XCTAssertEqual(exportedSpans[1].events.count, 0)
        XCTAssertTrue(exportedSpans[1].hasEnded)
        XCTAssertEqual(exportedSpans[2].name, "my-span-invalid-parent")
        XCTAssertNil(exportedSpans[2].parentSpanId)
        XCTAssertEqual(exportedSpans[2].attributes.count, 1)
        XCTAssertEqual(exportedSpans[2].attributes["emb.type"]!.description, "perf")
        XCTAssertEqual(exportedSpans[2].events.count, 0)
        XCTAssertTrue(exportedSpans[2].hasEnded)
    }

    // TODO fails on 6.2 currently
    func skipped_testRecordCompletedSpanWithErrorCode() async throws {
        module.recordCompletedSpan("my-span", startTimeMS: 0.0, endTimeMS: 0.0,
                                   errorCodeString: "Failure", parentSpanId: "",
                                   attributes: NSDictionary(), events: NSArray(),
                                   resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        XCTAssertTrue((promise.resolveCalls[0] as? Bool)!)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 1)
        XCTAssertEqual(exportedSpans[0].name, "my-span")
        XCTAssertEqual(exportedSpans[0].status, Status.error(description: "failure"))
        XCTAssertEqual(exportedSpans[0].attributes["emb.error_code"]!.description, "failure")
    }

    func testCompletedSpansRemovedOnSessionEnd() async throws {
        module.startSpan("stopped-span", parentSpanId: "", startTimeMS: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        module.startSpan("active-span", parentSpanId: "", startTimeMS: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 2)
        let stoppedSpanId = (promise.resolveCalls[0] as? String)!
        let activeSpanId = (promise.resolveCalls[1] as? String)!
        module.stopSpan(stoppedSpanId, errorCodeString: "", endTimeMS: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        promise.reset()

        // Before the session end accessing both spans should be valid
        module.addSpanAttributeToSpan(stoppedSpanId, key: "attr1", value: "foo",
                                      resolver: promise.resolve, rejecter: promise.reject)
        module.addSpanAttributeToSpan(activeSpanId, key: "attr1", value: "foo",
                                      resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 2)
        XCTAssertTrue((promise.resolveCalls[0] as? Bool)!)
        XCTAssertTrue((promise.resolveCalls[1] as? Bool)!)
        promise.reset()

        Embrace.client?.endCurrentSession()
        // After ending the session the completed span should no longer be accessible
        module.addSpanAttributeToSpan(activeSpanId, key: "attr2", value: "bar",
                                      resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        XCTAssertTrue((promise.resolveCalls[0] as? Bool)!)
        module.addSpanAttributeToSpan(stoppedSpanId, key: "attr2", value: "bar",
                                      resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.rejectCalls.count, 1)
        XCTAssertEqual(promise.rejectCalls[0], "Could not retrieve a span with the given id")
        promise.reset()

        // Stopping the 2nd span and ending the session again should clear it as well
        module.stopSpan(activeSpanId, errorCodeString: "", endTimeMS: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        Embrace.client?.endCurrentSession()
        module.addSpanAttributeToSpan(stoppedSpanId, key: "attr2", value: "bar",
                                      resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.rejectCalls.count, 1)
        XCTAssertEqual(promise.rejectCalls[0], "Could not retrieve a span with the given id")

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 2)
   }

}

class EmbraceSpansSDKNotStartedTests: XCTestCase {
    var module: EmbraceManager!
    var promise: Promise!

    override func setUp() async throws {
        promise = Promise()
        module = EmbraceManager()
    }

    func testStartSpanEmbraceNotStarted() async throws {
        module.startSpan("my-span", parentSpanId: "", startTimeMS: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 0)
        XCTAssertEqual(promise.rejectCalls.count, 1)
        XCTAssertEqual(promise.rejectCalls[0], "Error starting span, Embrace SDK may not be initialized")
    }

    func testRecordCompletedSpanEmbraceNotStarted() async throws {
        module.recordCompletedSpan("my-span", startTimeMS: 0.0, endTimeMS: 0.0,
                                   errorCodeString: "", parentSpanId: "",
                                   attributes: NSDictionary(), events: NSArray(),
                                   resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 0)
        XCTAssertEqual(promise.rejectCalls.count, 1)
        XCTAssertEqual(promise.rejectCalls[0], "Error recording span, Embrace SDK may not be initialized")
    }
   }