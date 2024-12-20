import Foundation
import React
import OSLog
import EmbraceIO
import EmbraceCore
import EmbraceCrash
import EmbraceCommonInternal
import EmbraceOTelInternal
import OpenTelemetryApi

class SDKConfig: NSObject {
    public let appId: String
    public let appGroupId: String?
    public let disableCrashReporter: Bool
    public let disableAutomaticViewCapture: Bool
    public let endpointBaseUrl: String?
    public let disableNetworkSpanForwarding: Bool
    public let ignoredURLs: [String]?
    
    public init(from: NSDictionary) {
        self.appId = from["appId"] as? String ?? ""
        self.appGroupId = from["appGroupId"] as? String
        self.disableCrashReporter = from["disableCrashReporter"] as? Bool ?? false
        self.disableAutomaticViewCapture = from["disableAutomaticViewCapture"] as? Bool ?? false
        self.endpointBaseUrl = from["endpointBaseUrl"] as? String
        self.disableNetworkSpanForwarding = from["disableNetworkSpanForwarding"] as? Bool ?? false
        self.ignoredURLs = from["disabledUrlPatterns"] as? [String] ?? []
    }
}

func initEmbraceOptions(config: SDKConfig, exporters: OpenTelemetryExport?) -> Embrace.Options {
    var embraceOptions: Embrace.Options {
        var crashReporter: CrashReporter?
        crashReporter = config.disableCrashReporter ? nil : EmbraceCrashReporter()
        
        let servicesBuilder = CaptureServiceBuilder()
        
        let urlSessionServiceOptions = URLSessionCaptureService.Options(
            // allowing to enable/disable NSF by code
            injectTracingHeader: !config.disableNetworkSpanForwarding,
            requestsDataSource: nil,
            // disabling tracking for ignored urls
            ignoredURLs: config.ignoredURLs ?? []
        )
        // manually adding the URLSessionCaptureService
        servicesBuilder.add(.urlSession(options: urlSessionServiceOptions))
        
        // adding defaults
        servicesBuilder.addDefaults()
        
        if config.disableAutomaticViewCapture {
            // removing service depending on code configuration
            servicesBuilder.remove(ofType: ViewCaptureService.self)
        }
        
        var endpoints: Embrace.Endpoints?
        if config.endpointBaseUrl != nil {
            endpoints = Embrace.Endpoints(baseURL: config.endpointBaseUrl!,
                                          developmentBaseURL: config.endpointBaseUrl!,
                                          configBaseURL: config.endpointBaseUrl!)
        }
        
        return .init(
            appId: config.appId,
            appGroupId: config.appGroupId,
            platform: .reactNative,
            endpoints: endpoints,
            captureServices: servicesBuilder.build(),
            crashReporter: crashReporter,
            export: exporters
        )
    }
        
    return embraceOptions
}
