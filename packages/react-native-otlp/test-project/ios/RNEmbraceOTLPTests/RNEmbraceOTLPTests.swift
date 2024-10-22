import React
import XCTest
import EmbraceIO
import EmbraceOTelInternal
import OpenTelemetryApi
import OpenTelemetrySdk
import EmbraceCommonInternal

@testable import RNEmbraceOTLP

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

final class RNEmbraceOTLPTests: XCTestCase {
    var module: RNEmbraceOTLP!
    var promise: Promise!

    override func setUp() async throws {
        module = RNEmbraceOTLP()
        promise = Promise()
    }

    // happy path
    func testStartNativeEmbraceSDK() throws {
        let expectation = self.expectation(description: "Start iOS SDK")
        let sdkConfig: NSDictionary = [
            "appId": "abcde",
            "endpointBaseUrl": "http://localhost/dev/null"
        ]

        let traceExportConfig: NSDictionary = [
            "endpoint": "https://test-trace-endpoint/v1",
            "headers": [("Authorization", "base64_instance:token")],
            "timeout": NSNumber(200000)
        ]

        let logExportConfig: NSDictionary = [
            "endpoint": "https://test-log-endpoint/v1",
            "headers": [("Authorization", "base64_instance:token")],
            "timeout": NSNumber(300000)
        ]

        let otlpExportConfig: NSDictionary = [
            "traceExporter": traceExportConfig,
            "logExporter": logExportConfig
        ]

        module.startNativeEmbraceSDK(sdkConfigDict: sdkConfig,
                                     otlpExportConfigDict: otlpExportConfig,
                                     resolve: { result in
                                        self.promise.resolve(val: result)
                                        expectation.fulfill()
                                    },
                                     rejecter: promise.reject)

        waitForExpectations(timeout: 3)
        XCTAssertEqual(promise.resolveCalls.count, 1)
    }

    func testStartWithMissingConfig() async throws {
    }

    func testStartWithMissingExporters() async throws {
    }

    func testStartWithTraceExporterOnly() async throws {
    }

    func testStartWithLogExporterOnly() async throws {
    }

    func testStartWithInvalidTraceExporterConfig() async throws {
    }

    func testStartWithInvalidLogExporterConfig() async throws {
    }
}
