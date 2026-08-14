import Foundation
import EmbraceIO

class SDKConfig: NSObject {
    public let appId: String?
    public let disableCrashReporter: Bool
    public let disableAutomaticViewCapture: Bool
    public let endpointBaseUrl: String?
    public let disableNetworkSpanForwarding: Bool
    public let ignoredURLs: [String]

    public init(from: NSDictionary) {
        self.appId = from["appId"] as? String
        self.disableCrashReporter = from["disableCrashReporter"] as? Bool ?? false
        self.disableAutomaticViewCapture = from["disableAutomaticViewCapture"] as? Bool ?? false
        self.endpointBaseUrl = from["endpointBaseUrl"] as? String
        self.disableNetworkSpanForwarding = from["disableNetworkSpanForwarding"] as? Bool ?? false
        self.ignoredURLs = from["disabledUrlPatterns"] as? [String] ?? []
    }
}

/// Builds the `EmbraceIO.Options` used to setup the SDK.
///
/// Starts from the SDK defaults and only overrides what the JS layer asked for through `SDKConfig`.
func initEmbraceOptions(config: SDKConfig, exporters: OpenTelemetryExport?) -> EmbraceIO.Options {
    let captureServices = captureServicesOptions(config: config)
    let crashReporter = config.disableCrashReporter ? nil : KSCrashReporter()
    let otel = exporters.map {
        EmbraceIO.OTelOptions(spanExporter: $0.spanExporter, logExporter: $0.logExporter)
    }

    // Without an `appId` the SDK can only run in export-only mode, driven by a local configuration.
    if config.appId == nil, let otel = otel {
        return .withLocalConfiguration(
            platform: .reactNative,
            captureServices: captureServices,
            crashReporter: crashReporter,
            otel: otel
        )
    }

    return .withAppId(
        config.appId ?? "",
        platform: .reactNative,
        endpoints: config.endpointBaseUrl.map { Embrace.Endpoints(baseURL: $0, configBaseURL: $0) },
        captureServices: captureServices,
        crashReporter: crashReporter,
        otel: otel
    )
}

/// The default set of capture services, adjusted for the options the JS layer exposes.
private func captureServicesOptions(config: SDKConfig) -> EmbraceIO.CaptureServicesOptions {
    let builder = CaptureServicesOptionsBuilder()
        .addDefaults()
        .addUrlSessionCaptureService(
            withOptions: .init(
                // allowing to enable/disable NSF by code
                injectTracingHeader: !config.disableNetworkSpanForwarding,
                requestsDataSource: nil,
                // disabling tracking for ignored urls
                ignoredURLs: config.ignoredURLs
            )
        )

    if config.disableAutomaticViewCapture {
        builder.remove(embraceType: .view)
    }

    return builder.build()
}
