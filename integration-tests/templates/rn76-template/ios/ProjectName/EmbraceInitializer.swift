import Foundation
import EmbraceIO

@objcMembers class EmbraceInitializer: NSObject {
    private static let appId = "REPLACE_ME"
    private static let endpointBaseUrl: String? = nil
    private static let disableViewCapture = false
    private static let enableNetworkSpanForwarding = false
    private static let disabledUrlPatterns: [String] = []

    static func start() -> Void {
        let captureServices = CaptureServicesOptionsBuilder()
            .addUrlSessionCaptureService(withOptions: URLSessionCaptureService.Options(
                requestsDataSource: nil,
                ignoredURLs: disabledUrlPatterns,
                traceparent: URLSessionCaptureService.Traceparent(
                    onlyAllowDomains: enableNetworkSpanForwarding ? nil : []
                )
            ))
            .addDefaults()

        if disableViewCapture {
            captureServices.remove(ofType: ViewCaptureService.self)
        }

        do {
            try EmbraceIO.start(
                options: .withAppId(
                    appId,
                    platform: .reactNative,
                    endpoints: endpointBaseUrl.map { EmbraceEndpoints(baseURL: $0, configBaseURL: $0) },
                    captureServices: captureServices.build()
                )
            )
        } catch let e {
            print("Error starting Embrace \(e.localizedDescription)")
        }
    }
}
