import XCTest
import EmbraceIO
import OpenTelemetryApi
import OpenTelemetrySdk

@testable import RNEmbraceCore

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
        // Don't clear the array - the SDK might be holding references
    }

    func shutdown(explicitTimeout: TimeInterval?) {}
}

class TestLogExporter: LogRecordExporter {
    private let queue = DispatchQueue(label: "TestLogExporter")
    private var _exportedLogs: [OpenTelemetrySdk.ReadableLogRecord] = []

    var exportedLogs: [OpenTelemetrySdk.ReadableLogRecord] {
        queue.sync { _exportedLogs }
    }

    func export(logRecords: [OpenTelemetrySdk.ReadableLogRecord], explicitTimeout: TimeInterval?) -> OpenTelemetrySdk.ExportResult {
        queue.sync {
            _exportedLogs.append(contentsOf: logRecords)
        }
        return OpenTelemetrySdk.ExportResult.success
    }

    func reset(explicitTimeout: TimeInterval?) {
        // Don't actually clear the array - the SDK might be holding references
        // Tests will use getLogsSince() to get only new logs
        queue.sync { }
    }

    func forceFlush(explicitTimeout: TimeInterval?) -> OpenTelemetrySdk.ExportResult {
        // Actually wait for any pending operations to complete
        queue.sync { }
        return OpenTelemetrySdk.ExportResult.success
    }

    func shutdown(explicitTimeout: TimeInterval?) {
        // Don't clear - same reason as reset()
        queue.sync { }
    }

    func getLogsSince(index: Int) -> [OpenTelemetrySdk.ReadableLogRecord] {
        queue.sync {
            guard index < _exportedLogs.count else { return [] }
            return Array(_exportedLogs[index...])
        }
    }
}

class Promise {
    var resolveCalls: [Any?] = []
    var rejectCalls: [String] = []

    func resolve(val: Any?) {
        resolveCalls.append(val)
    }

    func reject(a: String?, b: String?, c: Error?) {
      rejectCalls.append(b ?? "unknown error")
  }

    func reset() {
        resolveCalls.removeAll()
        rejectCalls.removeAll()
    }
}

private let EMBRACE_INTERNAL_SPAN_NAMES = ["emb-session", "emb-sdk-start", "emb-setup", "emb-process-launch",
                                           "POST /dev/null/v2/logs", "POST /dev/null/v2/spans"]

private let DEFAULT_WAIT_TIME = Double(ProcessInfo.processInfo.environment["IOS_TEST_WAIT_TIME"] ?? "") ?? 5.0

class EmbraceManagerTests: XCTestCase {
    static var logExporter: TestLogExporter!
    static var spanExporter: TestSpanExporter!
    var module: EmbraceManager!
    var promise: Promise!
    var startingLogCount: Int = 0
    var startingSpanCount: Int = 0

    override class func setUp() {
        super.setUp()
        logExporter = TestLogExporter()
        spanExporter = TestSpanExporter()

        do {
            try Embrace
                .setup( options: .init(
                    appId: "myApp",
                    // Set a fake endpoint for unit tests otherwise we'll end up sending actual payloads to Embrace
                    endpoints: Embrace.Endpoints(baseURL: "http://localhost/dev/null", configBaseURL: "http://localhost/dev/null"),
                    export:
                        OpenTelemetryExport(
                            spanExporter: self.spanExporter,
                            logExporter: self.logExporter
                        )
                    )
                )
                .start()
        } catch let error as Embrace {
            print(error)
        } catch {
            print(error.localizedDescription)
        }
    }

    override func setUp() async throws {
        promise = Promise()
        module = EmbraceManager()

        // Initial wait to let Embrace SDK initialize (especially important for first test)
        try await Task.sleep(nanoseconds: UInt64(5.0 * Double(NSEC_PER_SEC)))

        // Poll until no new logs/spans arrive for 3 seconds (max 30 seconds total)
        var previousLogCount = EmbraceManagerTests.logExporter.exportedLogs.count
        var previousSpanCount = EmbraceManagerTests.spanExporter.exportedSpans.count
        var stableCount = 0
        for _ in 0..<30 {
            try await Task.sleep(nanoseconds: UInt64(1.0 * Double(NSEC_PER_SEC)))
            let currentLogCount = EmbraceManagerTests.logExporter.exportedLogs.count
            let currentSpanCount = EmbraceManagerTests.spanExporter.exportedSpans.count
            if currentLogCount == previousLogCount && currentSpanCount == previousSpanCount {
                stableCount += 1
                if stableCount >= 3 {
                    break  // No new logs/spans for 3 seconds, we're stable
                }
            } else {
                stableCount = 0
                previousLogCount = currentLogCount
                previousSpanCount = currentSpanCount
            }
        }

        // Track starting counts instead of clearing
        startingLogCount = EmbraceManagerTests.logExporter.exportedLogs.count
        startingSpanCount = EmbraceManagerTests.spanExporter.exportedSpans.count
    }

    func getExportedLogs(expectedCount: Int? = nil, timeout: TimeInterval = 60.0) async throws -> [OpenTelemetrySdk.ReadableLogRecord] {
        let startTime = Date()
        var filtered: [OpenTelemetrySdk.ReadableLogRecord] = []

        // Poll for logs until we get the expected count or timeout
        while Date().timeIntervalSince(startTime) < timeout {
            let newLogs = EmbraceManagerTests.logExporter.getLogsSince(index: startingLogCount)
            filtered = newLogs.filter { log in
                log.severity != .debug &&
                log.attributes["emb.type"]?.description != "sys.internal"
            }

            if let expected = expectedCount, filtered.count >= expected {
                break
            }

            // If no expected count, wait the default time and return
            if expectedCount == nil {
                try await Task.sleep(nanoseconds: UInt64(DEFAULT_WAIT_TIME * Double(NSEC_PER_SEC)))
                break
            }

            // Short sleep between polls
            try await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
        }

        return filtered
    }

    func getExportedSpans() async throws -> [SpanData] {
        try await Task.sleep(nanoseconds: UInt64(DEFAULT_WAIT_TIME * Double(NSEC_PER_SEC)))
        // Only get spans since this test started
        let allSpans = EmbraceManagerTests.spanExporter.exportedSpans
        guard startingSpanCount < allSpans.count else { return [] }
        let newSpans = Array(allSpans[startingSpanCount...])
        return newSpans.filter { span in
            !EMBRACE_INTERNAL_SPAN_NAMES.contains(span.name)
        }
    }

    /* TODO, currently we have no way to stop the started SDK instance so can't have another test start a new instance
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
            "disableNetworkSpanForwarding": true,
            "endpointBaseUrl": "http://example.com"
        ]))

        XCTAssertEqual(config.appId, "myApp")
        XCTAssertEqual(config.appGroupId, "myAppGroup")
        XCTAssertTrue(config.disableCrashReporter)
        XCTAssertTrue(config.disableAutomaticViewCapture)
        XCTAssertTrue(config.disableNetworkSpanForwarding)
        XCTAssertEqual(config.endpointBaseUrl, "http://example.com")
    }

    func testParseSDKConfigDefaults() {
        let config = SDKConfig(from: NSDictionary(dictionary: ["appId": "myApp"]))

        XCTAssertEqual(config.appId, "myApp")
        XCTAssertNil(config.appGroupId)
        XCTAssertFalse(config.disableCrashReporter)
        XCTAssertFalse(config.disableAutomaticViewCapture)
        XCTAssertFalse(config.disableNetworkSpanForwarding)
        XCTAssertNil(config.endpointBaseUrl)
    }

    func testLogHandledError() async throws {
        // This is the first test case that runs in alphabetical order, add an extra sleep to
        // give the Embrace SDK a chance to startup before executing
        try await Task.sleep(nanoseconds: UInt64(DEFAULT_WAIT_TIME * Double(NSEC_PER_SEC)))

        module.logHandledError("my handled error", stacktrace: "stacktrace as string", properties: NSDictionary(), resolver: promise.resolve, rejecter: promise.reject)

        let exportedLogs = try await getExportedLogs(expectedCount: 1)

        guard exportedLogs.count == 1 else {
            XCTFail("Expected 1 exported log, got \(exportedLogs.count)")
            return
        }

        XCTAssertEqual(promise.resolveCalls.count, 1)
        XCTAssertEqual(exportedLogs.count, 1)
        XCTAssertEqual(exportedLogs[0].severity?.description, "ERROR")
        XCTAssertEqual(exportedLogs[0].body?.description, "my handled error")

        XCTAssertEqual(exportedLogs[0].attributes["emb.stacktrace.rn"]?.description, "stacktrace as string")
        // should not be present since the js one is added
        XCTAssertNil(exportedLogs[0].attributes["emb.stacktrace.ios"])

        XCTAssertNotNil(exportedLogs[0].attributes["session.id"]?.description)
        XCTAssertEqual(exportedLogs[0].attributes["emb.type"]?.description, "sys.log")
        XCTAssertEqual(exportedLogs[0].attributes["emb.state"]?.description, "foreground")
        XCTAssertEqual(exportedLogs[0].attributes["emb.exception_handling"]?.description, "handled")
    }

    func testLogUnhandledJSException() async throws {
        module.logUnhandledJSException("my unhandled exception", message: "unhandled message", type: "Error", stacktrace: "stacktrace as string", resolver: promise.resolve, rejecter: promise.reject)

        let exportedLogs = try await getExportedLogs(expectedCount: 1)

        guard exportedLogs.count == 1 else {
            XCTFail("Expected 1 exported log, got \(exportedLogs.count)")
            return
        }

        XCTAssertEqual(promise.resolveCalls.count, 1)
        XCTAssertEqual(exportedLogs.count, 1)

        XCTAssertEqual(exportedLogs[0].severity?.description, "ERROR")
        XCTAssertEqual(exportedLogs[0].body?.description, "my unhandled exception")

        XCTAssertNotNil(exportedLogs[0].attributes["session.id"]?.description)

        XCTAssertEqual(exportedLogs[0].attributes["emb.type"]?.description, "sys.ios.react_native_crash")

        XCTAssertEqual(exportedLogs[0].attributes["emb.ios.react_native_crash.js_exception"]?.description, "stacktrace as string")
        // should not be present since the js one is added
        XCTAssertNil(exportedLogs[0].attributes["emb.stacktrace.ios"])

        XCTAssertEqual(exportedLogs[0].attributes["emb.state"]?.description, "foreground")

        XCTAssertEqual(exportedLogs[0].attributes["exception.message"]?.description, "unhandled message")
        XCTAssertEqual(exportedLogs[0].attributes["exception.type"]?.description, "Error")
        XCTAssertNotNil(exportedLogs[0].attributes["exception.id"])
    }

    func testLogMessageWithSeverity() async throws {
        // 1) should include Native stacktrace
        module.logMessageWithSeverityAndProperties("my log message", severity: "warning", properties: NSDictionary(),
                                                   stacktrace: "",
                                                   includeStacktrace: true,
                                                   resolver: promise.resolve, rejecter: promise.reject)

        // 2) should not include any stacktrace (neither Native nor JS)
        module.logMessageWithSeverityAndProperties("my log message without stacktrace", severity: "warning", properties: NSDictionary(),
                                                   stacktrace: "",
                                                   includeStacktrace: false,
                                                   resolver: promise.resolve, rejecter: promise.reject)

        let exportedLogs = try await getExportedLogs(expectedCount: 2)

        guard exportedLogs.count == 2 else {
            XCTFail("Expected 2 exported logs, got \(exportedLogs.count)")
            return
        }

        XCTAssertEqual(promise.resolveCalls.count, 2)
        XCTAssertEqual(exportedLogs.count, 2)

        // 1) just one stacktrace
        XCTAssertEqual(exportedLogs[0].severity?.description, "WARN")
        XCTAssertEqual(exportedLogs[0].body?.description, "my log message")
        XCTAssertEqual(exportedLogs[0].attributes["emb.type"]?.description, "sys.log")
        XCTAssertNil(exportedLogs[0].attributes["emb.stacktrace.rn"]) // empty js stacktrace
        XCTAssertNotNil(exportedLogs[0].attributes["emb.stacktrace.ios"]) // since the JS stacktrace is empty and `includeStacktrace` is `true` it will add the Native one

        // 2) no stacktrace at all
        XCTAssertEqual(exportedLogs[1].severity?.description, "WARN")
        XCTAssertEqual(exportedLogs[1].body?.description, "my log message without stacktrace")
        XCTAssertEqual(exportedLogs[1].attributes["emb.type"]?.description, "sys.log")
        XCTAssertNil(exportedLogs[1].attributes["emb.stacktrace.rn"])
        XCTAssertNil(exportedLogs[1].attributes["emb.stacktrace.ios"]) // even when the JS is empty since `includeStacktrace` is `false` it won't include stacktraces
    }

    func testLogMessageWithSeverityAndProperties() async throws {
        module.logMessageWithSeverityAndProperties("my error log", severity: "error", properties: NSDictionary(dictionary: [
                                                    "prop1": "foo",
                                                    "prop2": "bar"
                                                  ]),
                                                   stacktrace: "",
                                                   includeStacktrace: true,
                                                   resolver: promise.resolve, rejecter: promise.reject)

        module.logMessageWithSeverityAndProperties("my warning log", severity: "warning", properties: NSDictionary(dictionary: [
                                                    "prop1": "foo",
                                                    "prop2": "bar"
                                                  ]),
                                                   stacktrace: "",
                                                   includeStacktrace: true,
                                                   resolver: promise.resolve, rejecter: promise.reject)

        module.logMessageWithSeverityAndProperties("my info log", severity: "info", properties: NSDictionary(dictionary: [
                                                    "prop1": "foo",
                                                    "prop2": "bar"
                                                  ]),
                                                   stacktrace: "",
                                                   includeStacktrace: true,
                                                   resolver: promise.resolve, rejecter: promise.reject)

        let exportedLogs = try await getExportedLogs(expectedCount: 3)

        guard exportedLogs.count == 3 else {
            XCTFail("Expected 3 exported logs, got \(exportedLogs.count)")
            return
        }

        XCTAssertEqual(promise.resolveCalls.count, 3)
        XCTAssertEqual(exportedLogs.count, 3)

        // error log
        XCTAssertEqual(exportedLogs[0].severity?.description, "ERROR")
        XCTAssertEqual(exportedLogs[0].body?.description, "my error log")
        XCTAssertEqual(exportedLogs[0].attributes["emb.type"]?.description, "sys.log")
        XCTAssertEqual(exportedLogs[0].attributes["prop1"]?.description, "foo")
        XCTAssertEqual(exportedLogs[0].attributes["prop2"]?.description, "bar")
        XCTAssertNil(exportedLogs[0].attributes["emb.stacktrace.rn"])
        XCTAssertNotNil(exportedLogs[0].attributes["emb.stacktrace.ios"])

        // warning log
        XCTAssertEqual(exportedLogs[1].severity?.description, "WARN")
        XCTAssertEqual(exportedLogs[1].body?.description, "my warning log")
        XCTAssertEqual(exportedLogs[1].attributes["emb.type"]?.description, "sys.log")
        XCTAssertEqual(exportedLogs[1].attributes["prop1"]?.description, "foo")
        XCTAssertEqual(exportedLogs[1].attributes["prop2"]?.description, "bar")
        XCTAssertNil(exportedLogs[1].attributes["emb.stacktrace.rn"])
        XCTAssertNotNil(exportedLogs[1].attributes["emb.stacktrace.ios"])

        // info log
        XCTAssertEqual(exportedLogs[2].severity?.description, "INFO")
        XCTAssertEqual(exportedLogs[2].body?.description, "my info log")
        XCTAssertEqual(exportedLogs[2].attributes["emb.type"]?.description, "sys.log")
        XCTAssertEqual(exportedLogs[2].attributes["prop1"]?.description, "foo")
        XCTAssertEqual(exportedLogs[2].attributes["prop2"]?.description, "bar")
        // `info` logs should not add stacktrace even when the `includeStacktrace` boolean is passed as true
        XCTAssertNil(exportedLogs[2].attributes["emb.stacktrace.rn"])
        XCTAssertNil(exportedLogs[2].attributes["emb.stacktrace.ios"])
    }

    func testLogMessageWithJSStackTrace() async throws {
        module.logMessageWithSeverityAndProperties("my error message", severity: "error", properties: NSDictionary(),
                                                   stacktrace: "my JS stack trace",
                                                   includeStacktrace: true,
                                                   resolver: promise.resolve, rejecter: promise.reject)

        module.logMessageWithSeverityAndProperties("my warning message", severity: "warning", properties: NSDictionary(),
                                                   stacktrace: "my JS stack trace",
                                                   includeStacktrace: true,
                                                   resolver: promise.resolve, rejecter: promise.reject)

        module.logMessageWithSeverityAndProperties("my info message", severity: "info", properties: NSDictionary(),
                                                   stacktrace: "my JS stack trace",
                                                   includeStacktrace: true,
                                                   resolver: promise.resolve, rejecter: promise.reject)

        let exportedLogs = try await getExportedLogs(expectedCount: 3)

        guard exportedLogs.count == 3 else {
            XCTFail("Expected 3 exported logs, got \(exportedLogs.count)")
            return
        }

        XCTAssertEqual(promise.resolveCalls.count, 3)
        XCTAssertEqual(exportedLogs.count, 3)

        // error
        XCTAssertEqual(exportedLogs[0].severity?.description, "ERROR")
        XCTAssertEqual(exportedLogs[0].body?.description, "my error message")
        XCTAssertEqual(exportedLogs[0].attributes["emb.type"]?.description, "sys.log")
        XCTAssertEqual(exportedLogs[0].attributes["emb.stacktrace.rn"]?.description, "my JS stack trace")
        XCTAssertNil(exportedLogs[0].attributes["emb.stacktrace.ios"])

        // warning
        XCTAssertEqual(exportedLogs[1].severity?.description, "WARN")
        XCTAssertEqual(exportedLogs[1].body?.description, "my warning message")
        XCTAssertEqual(exportedLogs[1].attributes["emb.type"]?.description, "sys.log")
        XCTAssertEqual(exportedLogs[1].attributes["emb.stacktrace.rn"]?.description, "my JS stack trace")
        XCTAssertNil(exportedLogs[1].attributes["emb.stacktrace.ios"])

        // info
        XCTAssertEqual(exportedLogs[2].severity?.description, "INFO")
        XCTAssertEqual(exportedLogs[2].body?.description, "my info message")
        XCTAssertEqual(exportedLogs[2].attributes["emb.type"]?.description, "sys.log")
        // `info` logs should not add stacktrace even when the `includeStacktrace` boolean is passed as true
        XCTAssertNil(exportedLogs[2].attributes["emb.stacktrace.rn"])
        XCTAssertNil(exportedLogs[2].attributes["emb.stacktrace.ios"])
    }

    func testLogMessageWithNoStackTrace() async throws {
        // error
        module.logMessageWithSeverityAndProperties("my error message", severity: "error", properties: NSDictionary(),
                                                   stacktrace: "my JS stack trace",
                                                   includeStacktrace: false,
                                                   resolver: promise.resolve, rejecter: promise.reject)
        module.logMessageWithSeverityAndProperties("my error message", severity: "error", properties: NSDictionary(),
                                                   stacktrace: "",
                                                   includeStacktrace: false,
                                                   resolver: promise.resolve, rejecter: promise.reject)

        // warning
        module.logMessageWithSeverityAndProperties("my warning message", severity: "warning", properties: NSDictionary(),
                                                   stacktrace: "my JS stack trace",
                                                   includeStacktrace: false,
                                                   resolver: promise.resolve, rejecter: promise.reject)
        module.logMessageWithSeverityAndProperties("my warning message", severity: "warning", properties: NSDictionary(),
                                                   stacktrace: "",
                                                   includeStacktrace: false,
                                                   resolver: promise.resolve, rejecter: promise.reject)

        // info
        module.logMessageWithSeverityAndProperties("my info message", severity: "info", properties: NSDictionary(),
                                                   stacktrace: "my JS stack trace",
                                                   includeStacktrace: false,
                                                   resolver: promise.resolve, rejecter: promise.reject)
        module.logMessageWithSeverityAndProperties("my info message", severity: "info", properties: NSDictionary(),
                                                   stacktrace: "",
                                                   includeStacktrace: false,
                                                   resolver: promise.resolve, rejecter: promise.reject)

        let exportedLogs = try await getExportedLogs(expectedCount: 6)

        guard exportedLogs.count == 6 else {
            XCTFail("Expected 6 exported logs, got \(exportedLogs.count)")
            return
        }

        XCTAssertEqual(promise.resolveCalls.count, 6)
        XCTAssertEqual(exportedLogs.count, 6)

        // error log passing js stacktrace
        XCTAssertEqual(exportedLogs[0].severity?.description, "ERROR")
        XCTAssertEqual(exportedLogs[0].body?.description, "my error message")
        XCTAssertEqual(exportedLogs[0].attributes["emb.type"]?.description, "sys.log")
        XCTAssertNil(exportedLogs[0].attributes["emb.stacktrace.rn"])
        XCTAssertNil(exportedLogs[0].attributes["emb.stacktrace.ios"])
        // error log passing empty stacktrace
        XCTAssertNil(exportedLogs[1].attributes["emb.stacktrace.rn"])
        XCTAssertNil(exportedLogs[1].attributes["emb.stacktrace.ios"])

        // warning log passing js stacktrace
        XCTAssertEqual(exportedLogs[2].severity?.description, "WARN")
        XCTAssertEqual(exportedLogs[2].body?.description, "my warning message")
        XCTAssertEqual(exportedLogs[2].attributes["emb.type"]?.description, "sys.log")
        XCTAssertNil(exportedLogs[2].attributes["emb.stacktrace.rn"])
        XCTAssertNil(exportedLogs[2].attributes["emb.stacktrace.ios"])
        // warning log passing empty stacktrace
        XCTAssertNil(exportedLogs[3].attributes["emb.stacktrace.rn"])
        XCTAssertNil(exportedLogs[3].attributes["emb.stacktrace.ios"])

        // info log passing js stacktrace
        XCTAssertEqual(exportedLogs[4].severity?.description, "INFO")
        XCTAssertEqual(exportedLogs[4].body?.description, "my info message")
        XCTAssertEqual(exportedLogs[4].attributes["emb.type"]?.description, "sys.log")
        XCTAssertNil(exportedLogs[4].attributes["emb.stacktrace.rn"])
        XCTAssertNil(exportedLogs[4].attributes["emb.stacktrace.ios"])
        // info log  passing empty stacktrace
        XCTAssertNil(exportedLogs[5].attributes["emb.stacktrace.rn"])
        XCTAssertNil(exportedLogs[5].attributes["emb.stacktrace.ios"])
    }

    func testLogNetworkRequest() async throws {
        module.logNetworkRequest("https://otest.com/v1/products", httpMethod: "get", startInMillis: 1723221815889, endInMillis: 1723221815891, bytesSent: 1000, bytesReceived: 2000, statusCode: 200, resolver: promise.resolve, rejecter: promise.reject)

        XCTAssertEqual(promise.resolveCalls.count, 1)

        guard promise.resolveCalls.count == 1 else {
            XCTFail("Expected 1 resolve call, got \(promise.resolveCalls.count)")
            return
        }

        guard let boolValue = promise.resolveCalls.first as? Bool else {
            XCTFail("Expected Bool value in resolveCalls")
            return
        }
        XCTAssertTrue(boolValue)

        module.logNetworkRequest("https://otest.com/", httpMethod: "POST", startInMillis: 1723221815889, endInMillis: 1723221815891, bytesSent: -1, bytesReceived: -2, statusCode: -1, resolver: promise.resolve, rejecter: promise.reject)

        module.logNetworkRequest("https://otest.com/v2/error", httpMethod: "POST", startInMillis: 1723221815889, endInMillis: 1723221815891, bytesSent: -1, bytesReceived: -2, statusCode: 500, resolver: promise.resolve, rejecter: promise.reject)

        let exportedSpans = try await getExportedSpans()

        guard exportedSpans.count == 6 else {
            XCTFail("Expected 6 exported spans, got \(exportedSpans.count)")
            return
        }

        XCTAssertEqual(exportedSpans[1].name, "emb-GET /v1/products")
        XCTAssertEqual(exportedSpans[1].startTime, Date(timeIntervalSince1970: 1723221815.889))
        XCTAssertEqual(exportedSpans[1].endTime, Date(timeIntervalSince1970: 1723221815.891))
        XCTAssertEqual(exportedSpans[1].attributes["emb.type"]?.description, "perf.network_request")
        XCTAssertEqual(exportedSpans[1].attributes["url.full"]?.description, "https://otest.com/v1/products")
        XCTAssertEqual(exportedSpans[1].attributes["http.request.method"]?.description, "GET")
        XCTAssertEqual(exportedSpans[1].attributes["http.response.body.size"]?.description, "2000")
        XCTAssertEqual(exportedSpans[1].attributes["http.request.body.size"]?.description, "1000")
        XCTAssertEqual(exportedSpans[1].attributes["http.response.status_code"]?.description, "200")
        XCTAssertNotNil(exportedSpans[1].attributes["emb.w3c_traceparent"])

        XCTAssertEqual(exportedSpans[3].name, "emb-POST")
        XCTAssertEqual(exportedSpans[3].startTime, Date(timeIntervalSince1970: 1723221815.889))
        XCTAssertEqual(exportedSpans[3].endTime, Date(timeIntervalSince1970: 1723221815.891))
        XCTAssertEqual(exportedSpans[3].attributes["url.full"]?.description, "https://otest.com/")
        XCTAssertNotNil(exportedSpans[3].attributes["emb.w3c_traceparent"])

        // negative values should not be added
        XCTAssertNil(exportedSpans[3].attributes["http.response.body.size"])
        XCTAssertNil(exportedSpans[3].attributes["http.request.body.size"])
        XCTAssertNil(exportedSpans[3].attributes["http.response.status_code"])

        XCTAssertEqual(exportedSpans[5].name, "emb-POST /v2/error")
        XCTAssertEqual(exportedSpans[5].startTime, Date(timeIntervalSince1970: 1723221815.889))
        XCTAssertEqual(exportedSpans[5].endTime, Date(timeIntervalSince1970: 1723221815.891))
        XCTAssertEqual(exportedSpans[5].attributes["url.full"]?.description, "https://otest.com/v2/error")
        XCTAssertEqual(exportedSpans[5].attributes["http.response.status_code"]?.description, "500")
        XCTAssertEqual(exportedSpans[5].status, Status.ok)
        XCTAssertNotNil(exportedSpans[5].attributes["emb.w3c_traceparent"])
    }

    func testLogNetworkClientError() async throws {
        module.logNetworkClientError("https://otest.com/v1/products", httpMethod: "get", startInMillis: 1723221815889, endInMillis: 1723221815891, errorType: "custom error", errorMessage: "this is my error", resolver: promise.resolve, rejecter: promise.reject)

        XCTAssertEqual(promise.resolveCalls.count, 1)

        guard promise.resolveCalls.count == 1 else {
            XCTFail("Expected 1 resolve call, got \(promise.resolveCalls.count)")
            return
        }

        // XCTAssertTrue((promise.resolveCalls[0] as? Bool)!)
        guard let boolValue = promise.resolveCalls.first as? Bool else {
            XCTFail("Expected Bool value in resolveCalls")
            return
        }
        XCTAssertTrue(boolValue)

        let exportedSpans = try await getExportedSpans()

        guard exportedSpans.count == 2 else {
            XCTFail("Expected 1 exported span, got \(exportedSpans.count)")
            return
        }

        XCTAssertEqual(exportedSpans[1].name, "emb-GET /v1/products")
        XCTAssertEqual(exportedSpans[1].attributes["emb.type"]?.description, "perf.network_request")
        XCTAssertEqual(exportedSpans[1].attributes["url.full"]?.description, "https://otest.com/v1/products")
        XCTAssertEqual(exportedSpans[1].attributes["http.request.method"]?.description, "GET")
        XCTAssertEqual(exportedSpans[1].attributes["error.message"]?.description, "this is my error")
        XCTAssertEqual(exportedSpans[1].attributes["error.type"]?.description, "custom error")
        XCTAssertNotNil(exportedSpans[1].attributes["emb.w3c_traceparent"])
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

    func testNothingCached() throws {
        let fileURL = try writeTempFile(contents: "console.log('my js bundle');")
        let bundleID = try computeBundleID(path: fileURL.path())
        XCTAssertEqual(bundleID.id, "29da484ad2a259e9de64a991cfec7f10")
        XCTAssertFalse(bundleID.cached)
    }

    func testDifferentPath() throws {
        let fileURL = try writeTempFile(contents: "console.log('my js bundle');")
        var bundleID = try computeBundleID(path: fileURL.path())
        XCTAssertEqual(bundleID.id, "29da484ad2a259e9de64a991cfec7f10")
        XCTAssertFalse(bundleID.cached)

        let otherURL = try writeTempFile(contents: "console.log('my other bundle');")
        bundleID = try computeBundleID(path: otherURL.path())
        XCTAssertEqual(bundleID.id, "9a7ef24cdaf5cdb927eab12cb0bfd30d")
        XCTAssertFalse(bundleID.cached)
    }

    func testSamePathNotModified() throws {
        let fileURL = try writeTempFile(contents: "console.log('my js bundle');")
        var bundleID = try computeBundleID(path: fileURL.path())
        XCTAssertEqual(bundleID.id, "29da484ad2a259e9de64a991cfec7f10")
        XCTAssertFalse(bundleID.cached)

        bundleID = try computeBundleID(path: fileURL.path())
        XCTAssertEqual(bundleID.id, "29da484ad2a259e9de64a991cfec7f10")
        XCTAssertTrue(bundleID.cached)
    }

    func testSamePathModified() throws {
        let fileURL = try writeTempFile(contents: "console.log('my js bundle');")
        var bundleID = try computeBundleID(path: fileURL.path())
        XCTAssertEqual(bundleID.id, "29da484ad2a259e9de64a991cfec7f10")
        XCTAssertFalse(bundleID.cached)

        let sameURL = try writeTempFile(contents: "console.log('my other bundle');", url: fileURL)
        XCTAssertEqual(fileURL, sameURL)
        bundleID = try computeBundleID(path: sameURL.path())
        XCTAssertEqual(bundleID.id, "9a7ef24cdaf5cdb927eab12cb0bfd30d")
        XCTAssertFalse(bundleID.cached)
    }
}
