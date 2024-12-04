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

let SDK_BASE_CONFIG: NSDictionary = [
    "appId": "abcde",
    "endpointBaseUrl": "http://localhost/dev/null"
]

final class RNEmbraceOTLPTests: XCTestCase {
    var module: RNEmbraceOTLP!
    var promise: Promise!

    override func setUp() async throws {
        module = RNEmbraceOTLP()
        promise = Promise()
    }

    // happy path
    func testStartNativeEmbraceSDK() throws {
        let expectation = self.expectation(description: "testStartNativeEmbraceSDK")

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

        module.startNativeEmbraceSDK(sdkConfigDict: SDK_BASE_CONFIG,
                                     otlpExportConfigDict: [
                                        "traceExporter": traceExportConfig,
                                        "logExporter": logExportConfig
                                    ],
                                     resolve: { result in
                                        self.promise.resolve(val: result)
                                        expectation.fulfill()
                                    },
                                     rejecter: promise.reject)

        waitForExpectations(timeout: 3)
        XCTAssertEqual(promise.resolveCalls.count, 1)
    }

    func testStartWithMissingExporters() throws {
        let expectation = self.expectation(description: "testStartWithMissingExporters")

        module.startNativeEmbraceSDK(sdkConfigDict: SDK_BASE_CONFIG,
                                     otlpExportConfigDict: [:], // empty config
                                     resolve: { result in
                                        self.promise.resolve(val: result)
                                        expectation.fulfill()
                                    },
                                     rejecter: promise.reject)

        waitForExpectations(timeout: 3)

        // TODO: Test that log is printed
        // [Embrace] Neither Traces nor Logs configuration were found, skipping custom export.
        XCTAssertEqual(promise.resolveCalls.count, 1)
    }

    func testStartWithTraceExporterOnly() throws {
        let expectation = self.expectation(description: "testStartWithTraceExporterOnly")
        expectation.expectedFulfillmentCount = 4

        // happy path only with Trace config
        module.startNativeEmbraceSDK(sdkConfigDict: SDK_BASE_CONFIG,
                                     otlpExportConfigDict: ["traceExporter": [
                                        "endpoint": "https://test-trace-endpoint/v1",
                                        "headers": [("Authorization", "base64_instance:token")],
                                        "timeout": NSNumber(200000)
                                    ]],
                                     resolve: { result in
                                        self.promise.resolve(val: result)
                                        expectation.fulfill()
                                    },
                                     rejecter: promise.reject)

        // with just en endpoint
        module.startNativeEmbraceSDK(sdkConfigDict: SDK_BASE_CONFIG,
                                     otlpExportConfigDict: [
                                        "traceExporter": ["endpoint": "https://test-trace-endpoint/v1"]
                                     ],
                                     resolve: { result in
                                        self.promise.resolve(val: result)
                                        expectation.fulfill()
                                    },
                                     rejecter: promise.reject)

        // with endpoint + empty headers (no timeout)
        module.startNativeEmbraceSDK(sdkConfigDict: SDK_BASE_CONFIG,
                                     otlpExportConfigDict: [
                                        "traceExporter": [
                                            "endpoint": "https://test-trace-endpoint/v1",
                                            "headers": [:]
                                        ]
                                    ],
                                     resolve: { result in
                                        self.promise.resolve(val: result)
                                        expectation.fulfill()
                                    },
                                     rejecter: promise.reject)

        // with endpoint + headers (no timeout)
        module.startNativeEmbraceSDK(sdkConfigDict: SDK_BASE_CONFIG,
                                     otlpExportConfigDict: ["traceExporter": [
                                        "endpoint": "https://test-trace-endpoint/v1",
                                        "headers": [("header", "token"), ("another_header", "another_token")]
                                     ]],
                                     resolve: { result in
                                        self.promise.resolve(val: result)
                                        expectation.fulfill()
                                    },
                                     rejecter: promise.reject)

        waitForExpectations(timeout: 3)
        XCTAssertEqual(promise.resolveCalls.count, 4)
    }

    func testStartWithLogExporterOnly() throws {
        let expectation = self.expectation(description: "testStartWithLogExporterOnly")
        expectation.expectedFulfillmentCount = 4

        // happy path only with Trace config
        module.startNativeEmbraceSDK(sdkConfigDict: SDK_BASE_CONFIG,
                                     otlpExportConfigDict: ["logExporter": [
                                        "endpoint": "https://test-log-endpoint/v1",
                                        "headers": [("Authorization", "base64_instance:token")],
                                        "timeout": NSNumber(200000)
                                    ]],
                                     resolve: { result in
                                        self.promise.resolve(val: result)
                                        expectation.fulfill()
                                    },
                                     rejecter: promise.reject)

        // with just en endpoint
        module.startNativeEmbraceSDK(sdkConfigDict: SDK_BASE_CONFIG,
                                     otlpExportConfigDict: [
                                        "logExporter": ["endpoint": "https://test-log-endpoint/v1"]
                                     ],
                                     resolve: { result in
                                        self.promise.resolve(val: result)
                                        expectation.fulfill()
                                    },
                                     rejecter: promise.reject)

        // with endpoint + empty headers (no timeout)
        module.startNativeEmbraceSDK(sdkConfigDict: SDK_BASE_CONFIG,
                                     otlpExportConfigDict: [
                                        "logExporter": [
                                            "endpoint": "https://test-log-endpoint/v1",
                                            "headers": [:]
                                        ]
                                    ],
                                     resolve: { result in
                                        self.promise.resolve(val: result)
                                        expectation.fulfill()
                                    },
                                     rejecter: promise.reject)

        // with endpoint + headers (no timeout)
        module.startNativeEmbraceSDK(sdkConfigDict: SDK_BASE_CONFIG,
                                     otlpExportConfigDict: [
                                        "logExporter": [
                                            "endpoint": "https://test-log-endpoint/v1",
                                            "headers": [("header", "token"), ("another_header", "another_token")]
                                         ]
                                     ],
                                     resolve: { result in
                                        self.promise.resolve(val: result)
                                        expectation.fulfill()
                                    },
                                     rejecter: promise.reject)

        waitForExpectations(timeout: 3)
        XCTAssertEqual(promise.resolveCalls.count, 4)
    }
}
