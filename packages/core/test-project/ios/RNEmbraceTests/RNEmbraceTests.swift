import XCTest
import EmbraceIO
import EmbraceOTelInternal
import OpenTelemetryApi
import OpenTelemetrySdk
import EmbraceCommonInternal

@testable import RNEmbrace

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

class TestLogExporter: LogRecordExporter {
    var exportedLogs: [OpenTelemetrySdk.ReadableLogRecord] = []

    func export(logRecords: [OpenTelemetrySdk.ReadableLogRecord], explicitTimeout: TimeInterval?) -> OpenTelemetrySdk.ExportResult {
        exportedLogs.append(contentsOf: logRecords)
        return OpenTelemetrySdk.ExportResult.success
    }

    func reset(explicitTimeout: TimeInterval?) {
        exportedLogs.removeAll()
    }

    func forceFlush(explicitTimeout: TimeInterval?) -> OpenTelemetrySdk.ExportResult {
        return OpenTelemetrySdk.ExportResult.success
    }

    func shutdown(explicitTimeout: TimeInterval?) {}
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

private let EMBRACE_INTERNAL_SPAN_NAMES = ["emb-session", "emb-sdk-start", "emb-setup", "emb-process-launch",
                                           "POST /v2/logs", "POST /v2/spans"]

// There isn't a way to stop the Embrace SDK once started so this Test case must run before the subsequent ones that start the SDK
// prepend 'Aa' as a hack to force it first in the alphabetical execution order
class AaEmbraceSpansSDKNotStartedTests: XCTestCase {
    var module: EmbraceManager!
    var promise: Promise!

    override func setUp() async throws {
        promise = Promise()
        module = EmbraceManager()
    }

    func testStartSpanEmbraceNotStarted() async throws {
        module.startSpan("my-span", parentSpanId: "", startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 0)
        XCTAssertEqual(promise.rejectCalls.count, 1)
        XCTAssertEqual(promise.rejectCalls[0], "Error starting span, Embrace SDK may not be initialized")
    }

    func testRecordCompletedSpanEmbraceNotStarted() async throws {
        module.recordCompletedSpan("my-span", startTimeMs: 0.0, endTimeMs: 0.0,
                                   errorCodeString: "", parentSpanId: "",
                                   attributes: NSDictionary(), events: NSArray(),
                                   resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 0)
        XCTAssertEqual(promise.rejectCalls.count, 1)
        XCTAssertEqual(promise.rejectCalls[0], "Error recording span, Embrace SDK may not be initialized")
    }
}

class EmbraceManagerTests: XCTestCase {
    static var logExporter: TestLogExporter!
    static var spanExporter: TestSpanExporter!
    var module: EmbraceManager!
    var promise: Promise!

    override class func setUp() {
        super.setUp()
        logExporter = TestLogExporter()
        spanExporter = TestSpanExporter()

        do {
            try Embrace
                .setup( options: .init(
                    appId: "myApp",
                    export:
                        OpenTelemetryExport(
                            spanExporter: self.spanExporter,
                            logExporter: self.logExporter
                        )
                ) )
                .start()
        } catch let error as EmbraceCore.Embrace {
            print(error)
        } catch {
            print(error.localizedDescription)
        }
    }

    override func setUp() async throws {
        promise = Promise()
        module = EmbraceManager()
        EmbraceManagerTests.logExporter.reset(explicitTimeout: nil)
        EmbraceManagerTests.spanExporter.reset(explicitTimeout: nil)
    }

    func getExportedLogs() async throws -> [OpenTelemetrySdk.ReadableLogRecord] {
        try await Task.sleep(nanoseconds: UInt64(20.0 * Double(NSEC_PER_SEC)))
        return EmbraceManagerTests.logExporter.exportedLogs
    }

    func getExportedSpans() async throws -> [SpanData] {
        try await Task.sleep(nanoseconds: UInt64(20.0 * Double(NSEC_PER_SEC)))
        return EmbraceManagerTests.spanExporter.exportedSpans.filter { span in
            !EMBRACE_INTERNAL_SPAN_NAMES.contains(span.name)
        }
    }

    /* TODO may not be feasible to test this since it starts the Embrace SDK when it has already been started
    func testStartNativeEmbraceSDK() async throws {
        module.startNativeEmbraceSDK(configDict: NSDictionary(dictionary: ["appId": "myApp"]),
                                     resolve: promise.resolve, rejecter: promise.reject)
        try await Task.sleep(nanoseconds: UInt64(5.0 * Double(NSEC_PER_SEC)))
        XCTAssertEqual(promise.resolveCalls.count, 1)
        XCTAssertTrue((promise.resolveCalls[0] as? Bool)!)

        module.isStarted(promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 2)
        XCTAssertTrue((promise.resolveCalls[1] as? Bool)!)
    }
     */
     

    func testParseSDKConfig() {
        let config = SDKConfig(from: NSDictionary(dictionary: [
            "appId": "myApp",
            "appGroupId": "myAppGroup",
            "disableCrashReporter": true,
            "disableAutomaticViewCapture": true,
            "endpointBaseUrl": "http://example.com"
        ]))

        XCTAssertEqual(config.appId, "myApp")
        XCTAssertEqual(config.appGroupId, "myAppGroup")
        XCTAssertTrue(config.disableCrashReporter)
        XCTAssertTrue(config.disableAutomaticViewCapture)
        XCTAssertEqual(config.endpointBaseUrl, "http://example.com")
    }

    func testParseSDKConfigDefaults() {
        let config = SDKConfig(from: NSDictionary(dictionary: ["appId": "myApp"]))

        XCTAssertEqual(config.appId, "myApp")
        XCTAssertNil(config.appGroupId)
        XCTAssertFalse(config.disableCrashReporter)
        XCTAssertFalse(config.disableAutomaticViewCapture)
        XCTAssertNil(config.endpointBaseUrl)
    }

    func testLogHandledError() async throws {
        module.logHandledError("my handled error", stacktrace: "stacktrace as string", properties: NSDictionary(), resolver: promise.resolve, rejecter: promise.reject)

        let exportedLogs = try await getExportedLogs()

        XCTAssertEqual(promise.resolveCalls.count, 1)
        XCTAssertEqual(exportedLogs.count, 1)
        XCTAssertEqual(exportedLogs[0].severity?.description, "ERROR")
        XCTAssertEqual(exportedLogs[0].body?.description, "my handled error")

        XCTAssertEqual(exportedLogs[0].attributes["emb.stacktrace.rn"]!.description, "stacktrace as string")
        // should not be present since the js one is added
        XCTAssertNil(exportedLogs[0].attributes["emb.stacktrace.ios"])

        XCTAssertNotNil(exportedLogs[0].attributes["emb.session_id"]!.description)
        XCTAssertEqual(exportedLogs[0].attributes["emb.type"]!.description, "sys.log")
        XCTAssertEqual(exportedLogs[0].attributes["emb.state"]!.description, "foreground")
        XCTAssertEqual(exportedLogs[0].attributes["emb.exception_handling"]!.description, "handled")
    }

    func testLogUnhandledJSException() async throws {
        module.logUnhandledJSException("my unhandled exception", message: "unhandled message", type: "Error", stacktrace: "stacktrace as string", resolver: promise.resolve, rejecter: promise.reject)

        let exportedLogs = try await getExportedLogs()
        XCTAssertEqual(promise.resolveCalls.count, 1)
        XCTAssertEqual(exportedLogs.count, 1)

        XCTAssertEqual(exportedLogs[0].severity?.description, "ERROR")
        XCTAssertEqual(exportedLogs[0].body?.description, "my unhandled exception")

        XCTAssertNotNil(exportedLogs[0].attributes["emb.session_id"]!.description)

        XCTAssertEqual(exportedLogs[0].attributes["emb.type"]!.description, "sys.ios.react_native_crash")

        XCTAssertEqual(exportedLogs[0].attributes["emb.ios.react_native_crash.js_exception"]!.description, "stacktrace as string")
        // should not be present since the js one is added
        XCTAssertNil(exportedLogs[0].attributes["emb.stacktrace.ios"])

        XCTAssertEqual(exportedLogs[0].attributes["emb.state"]!.description, "foreground")

        XCTAssertEqual(exportedLogs[0].attributes["exception.message"]!.description, "unhandled message")
        XCTAssertEqual(exportedLogs[0].attributes["exception.type"]!.description, "Error")
        XCTAssertNotNil(exportedLogs[0].attributes["exception.id"])
    }

    func testLogMessageWithSeverity() async throws {
        module.logMessageWithSeverityAndProperties("my log message", severity: "warning", properties: NSDictionary(),
                                                   stacktrace: "",
                                                   resolver: promise.resolve, rejecter: promise.reject)

        let exportedLogs = try await getExportedLogs()

        XCTAssertEqual(promise.resolveCalls.count, 1)
        XCTAssertEqual(exportedLogs.count, 1)
        XCTAssertEqual(exportedLogs[0].severity?.description, "WARN")
        XCTAssertEqual(exportedLogs[0].body?.description, "my log message")
        XCTAssertEqual(exportedLogs[0].attributes["emb.type"]!.description, "sys.log")

        // empty js stacktrace
        XCTAssertNil(exportedLogs[0].attributes["emb.stacktrace.rn"])
        // if the js stacktrace is empty, will add the native one
        XCTAssertNotNil(exportedLogs[0].attributes["emb.stacktrace.ios"])
    }

    func testLogMessageWithSeverityAndProperties() async throws {
        module.logMessageWithSeverityAndProperties("my log message", severity: "error", properties: NSDictionary(dictionary: [
                                                    "prop1": "foo",
                                                    "prop2": "bar"
                                                  ]),
                                                   stacktrace: "",
                                                   resolver: promise.resolve, rejecter: promise.reject)

        let exportedLogs = try await getExportedLogs()

        XCTAssertEqual(promise.resolveCalls.count, 1)
        XCTAssertEqual(exportedLogs.count, 1)
        XCTAssertEqual(exportedLogs[0].severity?.description, "ERROR")
        XCTAssertEqual(exportedLogs[0].body?.description, "my log message")
        XCTAssertEqual(exportedLogs[0].attributes["emb.type"]!.description, "sys.log")
        XCTAssertEqual(exportedLogs[0].attributes["prop1"]!.description, "foo")
        XCTAssertEqual(exportedLogs[0].attributes["prop2"]!.description, "bar")

        XCTAssertNil(exportedLogs[0].attributes["emb.stacktrace.rn"])
        // if the js stacktrace is empty, will add the native one
        XCTAssertNotNil(exportedLogs[0].attributes["emb.stacktrace.ios"])
    }

    func testLogMessageWithStackTrace() async throws {
        module.logMessageWithSeverityAndProperties("my log message", severity: "warning", properties: NSDictionary(),
                                                   stacktrace: "my stack trace",
                                                   resolver: promise.resolve, rejecter: promise.reject)

        let exportedLogs = try await getExportedLogs()

        XCTAssertEqual(promise.resolveCalls.count, 1)
        XCTAssertEqual(exportedLogs.count, 1)
        XCTAssertEqual(exportedLogs[0].severity?.description, "WARN")
        XCTAssertEqual(exportedLogs[0].body?.description, "my log message")
        XCTAssertEqual(exportedLogs[0].attributes["emb.type"]!.description, "sys.log")
        XCTAssertEqual(exportedLogs[0].attributes["emb.stacktrace.rn"]!.description, "my stack trace")
    }

    func testStartSpan() async throws {
        module.startSpan("my-span", parentSpanId: "", startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        module.startSpan("span-never-stopped", parentSpanId: "", startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 2)
        let spanId = (promise.resolveCalls[0] as? String)!
        module.stopSpan(spanId, errorCodeString: "", endTimeMs: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 3)
        XCTAssertTrue((promise.resolveCalls[2] as? Bool)!)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 1)
        XCTAssertEqual(exportedSpans[0].name, "my-span")
        XCTAssertNil(exportedSpans[0].parentSpanId)
        XCTAssertEqual(exportedSpans[0].attributes.count, 2)
        XCTAssertEqual(exportedSpans[0].attributes["emb.type"]!.description, "perf")
        XCTAssertEqual(exportedSpans[0].attributes["emb.key"]!.description, "true")
        XCTAssertEqual(exportedSpans[0].status, Status.ok)
        XCTAssertTrue(exportedSpans[0].hasEnded)
    }

    func testStartSpanWithParent() async throws {
        module.startSpan("parent-span", parentSpanId: "", startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let parentSpanId = (promise.resolveCalls[0] as? String)!
        promise.reset()

        module.startSpan("child-span", parentSpanId: parentSpanId, startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let childSpanId = (promise.resolveCalls[0] as? String)!

        module.stopSpan(parentSpanId, errorCodeString: "", endTimeMs: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        module.stopSpan(childSpanId, errorCodeString: "", endTimeMs: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 2)
        XCTAssertEqual(exportedSpans[0].name, "parent-span")
        XCTAssertNil(exportedSpans[0].parentSpanId)
        XCTAssertEqual(exportedSpans[1].name, "child-span")
        XCTAssertEqual(exportedSpans[1].parentSpanId?.hexString, exportedSpans[0].spanId.hexString)
    }

    func testStartSpanWithStoppedParent() async throws {
        module.startSpan("stopped-parent-span", parentSpanId: "", startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let parentSpanId = (promise.resolveCalls[0] as? String)!
        module.stopSpan(parentSpanId, errorCodeString: "", endTimeMs: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        promise.reset()

        module.startSpan("child-span", parentSpanId: parentSpanId, startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let childSpanId = (promise.resolveCalls[0] as? String)!
        module.stopSpan(childSpanId, errorCodeString: "", endTimeMs: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 2)
        XCTAssertEqual(exportedSpans[0].name, "stopped-parent-span")
        XCTAssertNil(exportedSpans[0].parentSpanId)
        XCTAssertEqual(exportedSpans[1].name, "child-span")
        XCTAssertEqual(exportedSpans[1].parentSpanId?.hexString, exportedSpans[0].spanId.hexString)
    }

    func testStartSpanWithTimes() async throws {
        module.startSpan("span-with-times", parentSpanId: "", startTimeMs: 1721765402001.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let spanId = (promise.resolveCalls[0] as? String)!
        module.stopSpan(spanId, errorCodeString: "", endTimeMs: 1721765409002.0,
                        resolver: promise.resolve, rejecter: promise.reject)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 1)
        XCTAssertEqual(exportedSpans[0].name, "span-with-times")
        XCTAssertEqual(exportedSpans[0].startTime, Date(timeIntervalSince1970: 1721765402.001))
        XCTAssertEqual(exportedSpans[0].endTime, Date(timeIntervalSince1970: 1721765409.002))
    }

    func testStopSpanWithErrorCode() async throws {
        module.startSpan("failure-span", parentSpanId: "", startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        module.startSpan("user-abandon-span", parentSpanId: "", startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        module.startSpan("unknown-span", parentSpanId: "", startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        module.startSpan("invalid-error-code-span", parentSpanId: "", startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 4)
        let failureSpanId = (promise.resolveCalls[0] as? String)!
        let userAbandonSpanId = (promise.resolveCalls[1] as? String)!
        let unknownSpanId = (promise.resolveCalls[2] as? String)!
        let invalidErrorCodeSpanId = (promise.resolveCalls[3] as? String)!

        module.stopSpan(failureSpanId, errorCodeString: "Failure", endTimeMs: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        module.stopSpan(userAbandonSpanId, errorCodeString: "UserAbandon", endTimeMs: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        module.stopSpan(unknownSpanId, errorCodeString: "Unknown", endTimeMs: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        module.stopSpan(invalidErrorCodeSpanId, errorCodeString: "foo", endTimeMs: 0.0,
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
        module.stopSpan("invalid", errorCodeString: "", endTimeMs: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 0)
        XCTAssertEqual(promise.rejectCalls.count, 1)
        XCTAssertEqual(promise.rejectCalls[0], "Could not retrieve a span with the given id")
    }

    func testAddSpanEvent() async throws {
        module.startSpan("my-span", parentSpanId: "", startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let spanId = (promise.resolveCalls[0] as? String)!

        module.addSpanEventToSpan(spanId, name: "my-event", time: 1721765404001.0, attributes: NSDictionary(),
                                  resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 2)
        XCTAssertTrue((promise.resolveCalls[1] as? Bool)!)
        module.stopSpan(spanId, errorCodeString: "", endTimeMs: 0.0,
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
        module.startSpan("my-span", parentSpanId: "", startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let spanId = (promise.resolveCalls[0] as? String)!

        module.addSpanEventToSpan(spanId, name: "my-event", time: 1721765404001.0,
                                  attributes: NSDictionary(dictionary: [
                                    "my-attr1": "foo",
                                    "my-attr2": "bar"
                                  ]),
                                  resolver: promise.resolve, rejecter: promise.reject)
        module.stopSpan(spanId, errorCodeString: "", endTimeMs: 0.0,
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
        module.startSpan("my-span", parentSpanId: "", startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let spanId = (promise.resolveCalls[0] as? String)!

        module.addSpanAttributeToSpan(spanId, key: "my-attr1", value: "foo",
                                      resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 2)
        XCTAssertTrue((promise.resolveCalls[1] as? Bool)!)
        module.addSpanAttributeToSpan(spanId, key: "my-attr2", value: "bar",
                                      resolver: promise.resolve, rejecter: promise.reject)
        module.stopSpan(spanId, errorCodeString: "", endTimeMs: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        // Attributes added after the span ends should be ignored
        module.addSpanAttributeToSpan(spanId, key: "my-attr3", value: "baz",
                                      resolver: promise.resolve, rejecter: promise.reject)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 1)
        XCTAssertEqual(exportedSpans[0].name, "my-span")
        XCTAssertEqual(exportedSpans[0].attributes.count, 4)
        XCTAssertEqual(exportedSpans[0].attributes["emb.type"]!.description, "perf")
        XCTAssertEqual(exportedSpans[0].attributes["emb.key"]!.description, "true")
        XCTAssertEqual(exportedSpans[0].attributes["my-attr1"]!.description, "foo")
        XCTAssertEqual(exportedSpans[0].attributes["my-attr2"]!.description, "bar")
    }

    func testAddSpanAttributeDuplicate() async throws {
        module.startSpan("my-span", parentSpanId: "", startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let spanId = (promise.resolveCalls[0] as? String)!

        module.addSpanAttributeToSpan(spanId, key: "my-attr1", value: "foo",
                                      resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 2)
        XCTAssertTrue((promise.resolveCalls[1] as? Bool)!)
        // Add the same key again, the value should get overridden
        module.addSpanAttributeToSpan(spanId, key: "my-attr1", value: "bar",
                                      resolver: promise.resolve, rejecter: promise.reject)
        module.stopSpan(spanId, errorCodeString: "", endTimeMs: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 1)
        XCTAssertEqual(exportedSpans[0].name, "my-span")
        XCTAssertEqual(exportedSpans[0].attributes.count, 3)
        XCTAssertEqual(exportedSpans[0].attributes["emb.type"]!.description, "perf")
        XCTAssertEqual(exportedSpans[0].attributes["emb.key"]!.description, "true")
        XCTAssertEqual(exportedSpans[0].attributes["my-attr1"]!.description, "bar")
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

        module.recordCompletedSpan("my-span", startTimeMs: 1721765404001.0, endTimeMs: 1721765407003.0,
                                   errorCodeString: "", parentSpanId: "", attributes: attributes, events: events,
                                   resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        XCTAssertTrue((promise.resolveCalls[0] as? Bool)!)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 1)
        XCTAssertEqual(exportedSpans[0].name, "my-span")
        XCTAssertNil(exportedSpans[0].parentSpanId)
        XCTAssertEqual(exportedSpans[0].attributes.count, 4)
        XCTAssertEqual(exportedSpans[0].attributes["emb.type"]!.description, "perf")
        XCTAssertEqual(exportedSpans[0].attributes["emb.key"]!.description, "true")
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
        XCTAssertEqual(exportedSpans[0].status, Status.ok)
        XCTAssertTrue(exportedSpans[0].hasEnded)
    }

    func testRecordCompletedSpanWithParent() async throws {
        module.startSpan("parent-span", parentSpanId: "", startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let parentSpanId = (promise.resolveCalls[0] as? String)!
        module.stopSpan(parentSpanId, errorCodeString: "", endTimeMs: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        promise.reset()

        module.recordCompletedSpan("my-span-valid-parent", startTimeMs: 0.0, endTimeMs: 0.0,
                                   errorCodeString: "", parentSpanId: parentSpanId,
                                   attributes: NSDictionary(), events: NSArray(),
                                   resolver: promise.resolve, rejecter: promise.reject)
        // An invalid parent ID shouldn't prevent the span from otherwise being recorded
        module.recordCompletedSpan("my-span-invalid-parent", startTimeMs: 0.0, endTimeMs: 0.0,
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
        XCTAssertEqual(exportedSpans[1].attributes.count, 2)
        XCTAssertEqual(exportedSpans[1].attributes["emb.type"]!.description, "perf")
        XCTAssertEqual(exportedSpans[0].attributes["emb.key"]!.description, "true")
        XCTAssertEqual(exportedSpans[1].events.count, 0)
        XCTAssertTrue(exportedSpans[1].hasEnded)
        XCTAssertEqual(exportedSpans[2].name, "my-span-invalid-parent")
        XCTAssertNil(exportedSpans[2].parentSpanId)
        XCTAssertEqual(exportedSpans[2].attributes.count, 2)
        XCTAssertEqual(exportedSpans[2].attributes["emb.type"]!.description, "perf")
        XCTAssertEqual(exportedSpans[0].attributes["emb.key"]!.description, "true")
        XCTAssertEqual(exportedSpans[2].events.count, 0)
        XCTAssertTrue(exportedSpans[2].hasEnded)
    }

    func testRecordCompletedSpanWithErrorCode() async throws {
        module.recordCompletedSpan("my-span", startTimeMs: 0.0, endTimeMs: 0.0,
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
        module.startSpan("stopped-span", parentSpanId: "", startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        module.startSpan("active-span", parentSpanId: "", startTimeMs: 0.0,
                         resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 2)
        let stoppedSpanId = (promise.resolveCalls[0] as? String)!
        let activeSpanId = (promise.resolveCalls[1] as? String)!
        module.stopSpan(stoppedSpanId, errorCodeString: "", endTimeMs: 0.0,
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
        module.stopSpan(activeSpanId, errorCodeString: "", endTimeMs: 0.0,
                        resolver: promise.resolve, rejecter: promise.reject)
        Embrace.client?.endCurrentSession()
        module.addSpanAttributeToSpan(stoppedSpanId, key: "attr2", value: "bar",
                                      resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.rejectCalls.count, 1)
        XCTAssertEqual(promise.rejectCalls[0], "Could not retrieve a span with the given id")

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 2)
   }

    func testLogNetworkRequest() async throws {
        module.logNetworkRequest("https://otest.com/v1/products", httpMethod: "get", startInMillis: 1723221815889, endInMillis: 1723221815891, bytesSent: 1000, bytesReceived: 2000, statusCode: 200, resolver: promise.resolve, rejecter: promise.reject)

        XCTAssertEqual(promise.resolveCalls.count, 1)
        XCTAssertTrue((promise.resolveCalls[0] as? Bool)!)

        module.logNetworkRequest("https://otest.com/", httpMethod: "POST", startInMillis: 1723221815889, endInMillis: 1723221815891, bytesSent: -1, bytesReceived: -2, statusCode: -1, resolver: promise.resolve, rejecter: promise.reject)

        module.logNetworkRequest("https://otest.com/v2/error", httpMethod: "POST", startInMillis: 1723221815889, endInMillis: 1723221815891, bytesSent: -1, bytesReceived: -2, statusCode: 500, resolver: promise.resolve, rejecter: promise.reject)

        let exportedSpans = try await getExportedSpans()

        XCTAssertEqual(exportedSpans[0].name, "emb-GET /v1/products")
        XCTAssertEqual(exportedSpans[0].startTime, Date(timeIntervalSince1970: 1723221815.889))
        XCTAssertEqual(exportedSpans[0].endTime, Date(timeIntervalSince1970: 1723221815.891))
        XCTAssertEqual(exportedSpans[0].attributes["emb.type"]!.description, "perf.network_request")
        XCTAssertEqual(exportedSpans[0].attributes["url.full"]!.description, "https://otest.com/v1/products")
        XCTAssertEqual(exportedSpans[0].attributes["http.request.method"]!.description, "GET")
        XCTAssertEqual(exportedSpans[0].attributes["http.response.body.size"]!.description, "2000")
        XCTAssertEqual(exportedSpans[0].attributes["http.request.body.size"]!.description, "1000")
        XCTAssertEqual(exportedSpans[0].attributes["http.response.status_code"]!.description, "200")

        XCTAssertEqual(exportedSpans[1].name, "emb-POST")
        XCTAssertEqual(exportedSpans[1].startTime, Date(timeIntervalSince1970: 1723221815.889))
        XCTAssertEqual(exportedSpans[1].endTime, Date(timeIntervalSince1970: 1723221815.891))
        XCTAssertEqual(exportedSpans[1].attributes["url.full"]!.description, "https://otest.com/")

        // negative values should not be added
        XCTAssertNil(exportedSpans[1].attributes["http.response.body.size"])
        XCTAssertNil(exportedSpans[1].attributes["http.request.body.size"])
        XCTAssertNil(exportedSpans[1].attributes["http.response.status_code"])

        XCTAssertEqual(exportedSpans[2].name, "emb-POST /v2/error")
        XCTAssertEqual(exportedSpans[2].startTime, Date(timeIntervalSince1970: 1723221815.889))
        XCTAssertEqual(exportedSpans[2].endTime, Date(timeIntervalSince1970: 1723221815.891))
        XCTAssertEqual(exportedSpans[2].attributes["url.full"]!.description, "https://otest.com/v2/error")
        XCTAssertEqual(exportedSpans[2].attributes["http.response.status_code"]!.description, "500")
        XCTAssertEqual(exportedSpans[2].status, Status.ok)
    }

    func testLogNetworkClientError() async throws {
        module.logNetworkClientError("https://otest.com/v1/products", httpMethod: "get", startInMillis: 1723221815889, endInMillis: 1723221815891, errorType: "custom error", errorMessage: "this is my error", resolver: promise.resolve, rejecter: promise.reject)

        XCTAssertEqual(promise.resolveCalls.count, 1)
        XCTAssertTrue((promise.resolveCalls[0] as? Bool)!)

        let exportedSpans = try await getExportedSpans()

        XCTAssertEqual(exportedSpans[0].name, "emb-GET /v1/products")
        XCTAssertEqual(exportedSpans[0].attributes["emb.type"]!.description, "perf.network_request")
        XCTAssertEqual(exportedSpans[0].attributes["url.full"]!.description, "https://otest.com/v1/products")
        XCTAssertEqual(exportedSpans[0].attributes["http.request.method"]!.description, "GET")
        XCTAssertEqual(exportedSpans[0].attributes["error.message"]!.description, "this is my error")
        XCTAssertEqual(exportedSpans[0].attributes["error.type"]!.description, "custom error")
    }

    func testStartEndView() async throws {
        module.startView("my-view", resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        let viewSpanId = (promise.resolveCalls[0] as? String)!
        module.startView("my-not-ended-view", resolver: promise.resolve, rejecter: promise.reject)
        promise.reset()

        module.endView(viewSpanId, resolver: promise.resolve, rejecter: promise.reject)
        XCTAssertEqual(promise.resolveCalls.count, 1)
        XCTAssertTrue((promise.resolveCalls[0] as? Bool)!)

        let exportedSpans = try await getExportedSpans()
        XCTAssertEqual(exportedSpans.count, 1)
        XCTAssertEqual(exportedSpans[0].name, "emb-screen-view")
        XCTAssertEqual(exportedSpans[0].attributes["emb.type"]!.description, "ux.view")
        XCTAssertEqual(exportedSpans[0].attributes["view.name"]!.description, "my-view")
    }
}

class ComputeBundleIDTests: XCTestCase {
    override func tearDownWithError() throws {
          UserDefaults.standard.removePersistentDomain(forName: "EmbraceReactNative")
    }

    // https://nshipster.com/temporary-files/
    func writeTempFile(contents: String, url: URL? = nil) throws -> URL {
        var to = url
        if to == nil {
            let tmpDir = try FileManager.default.url(for: .itemReplacementDirectory,
                                    in: .userDomainMask,
                                    appropriateFor: URL(fileURLWithPath: "sample_bundle.js"),
                                    create: true)

            to = tmpDir.appendingPathComponent(ProcessInfo().globallyUniqueString)
        }

        try contents.write(to: to!, atomically: true, encoding: String.Encoding.utf8)

        return to!
    }

    func testEmptyPath() {
       XCTAssertThrowsError(try computeBundleID(path: "")) { error in
           XCTAssertEqual(error as? ComputeBundleIDErrors, ComputeBundleIDErrors.emptyPath)
       }
    }

    func testNothingCached() {
        let fileURL = try? writeTempFile(contents: "console.log('my js bundle');")
        let bundleID = try? computeBundleID(path: fileURL!.path())
        XCTAssertEqual(bundleID?.id, "29da484ad2a259e9de64a991cfec7f10")
        XCTAssertFalse(bundleID!.cached)
    }

    func testDifferentPath() {
        let fileURL = try? writeTempFile(contents: "console.log('my js bundle');")
        var bundleID = try? computeBundleID(path: fileURL!.path())
        XCTAssertEqual(bundleID?.id, "29da484ad2a259e9de64a991cfec7f10")
        XCTAssertFalse(bundleID!.cached)

        let otherURL = try? writeTempFile(contents: "console.log('my other bundle');")
        bundleID = try? computeBundleID(path: otherURL!.path())
        XCTAssertEqual(bundleID?.id, "9a7ef24cdaf5cdb927eab12cb0bfd30d")
        XCTAssertFalse(bundleID!.cached)
    }

    func testSamePathNotModified() {
        let fileURL = try? writeTempFile(contents: "console.log('my js bundle');")
        var bundleID = try? computeBundleID(path: fileURL!.path())
        XCTAssertEqual(bundleID?.id, "29da484ad2a259e9de64a991cfec7f10")
        XCTAssertFalse(bundleID!.cached)

        bundleID = try? computeBundleID(path: fileURL!.path())
        XCTAssertEqual(bundleID?.id, "29da484ad2a259e9de64a991cfec7f10")
        XCTAssertTrue(bundleID!.cached)
    }

    func testSamePathModified() {
        let fileURL = try? writeTempFile(contents: "console.log('my js bundle');")
        var bundleID = try? computeBundleID(path: fileURL!.path())
        XCTAssertEqual(bundleID?.id, "29da484ad2a259e9de64a991cfec7f10")
        XCTAssertFalse(bundleID!.cached)

        let sameURL = try? writeTempFile(contents: "console.log('my other bundle');", url: fileURL)
        XCTAssertEqual(fileURL, sameURL)
        bundleID = try? computeBundleID(path: sameURL!.path())
        XCTAssertEqual(bundleID?.id, "9a7ef24cdaf5cdb927eab12cb0bfd30d")
        XCTAssertFalse(bundleID!.cached)
    }
}
