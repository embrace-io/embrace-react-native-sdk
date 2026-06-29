import Foundation
import EmbraceIO
import OpenTelemetrySdk
import OpenTelemetryProtocolExporterCommon
import OpenTelemetryProtocolExporterHttp

@objcMembers class EmbraceInitializer: NSObject {
    // Start the EmbraceSDK natively WITH custom OTLP exporters.
    static func start() -> Void {
        let spanExporterHeaders: [(String, String)] = [("Authorization", "Bearer test-token")]
        let spanExporterURLConfig = URLSessionConfiguration.default
        spanExporterURLConfig.httpAdditionalHeaders = Dictionary(uniqueKeysWithValues: spanExporterHeaders)
        let spanExporter = OtlpHttpTraceExporter(
            endpoint: URL(string: "https://otlp.example.com:4318/v1/traces")!,
            config: OtlpConfiguration(timeout: 15, headers: spanExporterHeaders),
            httpClient: BaseHTTPClient(session: URLSession(configuration: spanExporterURLConfig)),
            envVarHeaders: spanExporterHeaders
        )
        let logExporterHeaders: [(String, String)] = []
        let logExporterURLConfig = URLSessionConfiguration.default
        logExporterURLConfig.httpAdditionalHeaders = Dictionary(uniqueKeysWithValues: logExporterHeaders)
        let logExporter = OtlpHttpLogExporter(
            endpoint: URL(string: "https://otlp.example.com:4318/v1/logs")!,
            config: OtlpConfiguration(timeout: OtlpConfiguration.DefaultTimeoutInterval, headers: logExporterHeaders),
            httpClient: BaseHTTPClient(session: URLSession(configuration: logExporterURLConfig)),
            envVarHeaders: logExporterHeaders
        )
        let export = OpenTelemetryExport(spanExporter: spanExporter, logExporter: logExporter)

        let servicesBuilder = CaptureServiceBuilder()
        servicesBuilder.add(.urlSession(options: URLSessionCaptureService.Options(
            injectTracingHeader: true,
            requestsDataSource: nil,
            ignoredURLs: ["otlp.example.com:4318"]
        )))
        servicesBuilder.addDefaults()

        do {
            try Embrace
                .setup(
                    options: Embrace.Options(
                        appId: "ios789",
                        appGroupId: nil,
                        platform: .reactNative,
                        endpoints: nil,
                        captureServices: servicesBuilder.build(),
                        crashReporter: KSCrashReporter(),
                        export: export
                    )
                )
                .start()
        } catch let e {
            print("Error starting Embrace \(e.localizedDescription)")
        }
    }
}
