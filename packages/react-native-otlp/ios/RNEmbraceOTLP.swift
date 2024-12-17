import React
import JavaScriptCore
import Foundation
import EmbraceIO
import EmbraceCrash
import OpenTelemetrySdk
import EmbraceCommonInternal
import OSLog

class SDKConfig: NSObject {
    public let appId: String
    public let appGroupId: String?
    public let disableCrashReporter: Bool
    public let disableAutomaticViewCapture: Bool
    public let endpointBaseUrl: String?
    public let disableNetworkSpanForwarding: Bool
    public let ignoredURLs: [String]?

    public init(from: NSDictionary) {
        self.appId = from.value(forKey: "appId") as? String ?? ""
        self.appGroupId = from.value(forKey: "appGroupId") as? String
        self.disableCrashReporter = from.value(forKey: "disableCrashReporter") as? Bool ?? false
        self.disableAutomaticViewCapture = from.value(forKey: "disableAutomaticViewCapture") as? Bool ?? false
        self.endpointBaseUrl = from.value(forKey: "endpointBaseUrl") as? String
        self.disableNetworkSpanForwarding = from.value(forKey: "disableNetworkSpanForwarding") as? Bool ?? false
        self.ignoredURLs = from.value(forKey: "disabledUrlPatterns") as? [String] ?? []
    }
}

@objc class CustomExporterConfig: NSObject {
    var endpoint: String?
    var timeout: TimeInterval
    var headers: [(String, String)]?

  init(endpoint: String?, timeout: TimeInterval, headers: [(String, String)]?) {
    self.endpoint = endpoint
    self.timeout = timeout
    self.headers = headers
  }

  @objc static func parse(_ dict: NSDictionary) -> CustomExporterConfig {
      let endpoint = dict.value(forKey: "endpoint") as? String

      var timeoutInterval: TimeInterval = OtlpConfiguration.DefaultTimeoutInterval
      if let timeout = dict.value(forKey: "timeout") as? NSNumber {
          timeoutInterval = timeout.doubleValue
      }

    var headers: [(String, String)] = []
    if let headerDicts = dict.value(forKey: "headers") as? [NSDictionary] {
        for header in headerDicts {
            if let keyS = header.value(forKey: "key") as? String,
               let valueS = header.value(forKey: "token") as? String {
                headers.append((keyS, valueS))
            }
        }
    }

      return CustomExporterConfig(endpoint: endpoint, timeout: timeoutInterval, headers: headers)
  }
}

@objc(RNEmbraceOTLP)
class RNEmbraceOTLP: NSObject {
    private var log = OSLog(subsystem: "Embrace", category: "RNEmbraceOTLP")

  // Http starts
  private func setOtlpHttpTraceExporter(endpoint: String,
                                        timeout: TimeInterval,
                                        headers: [(String, String)]?) -> OtlpHttpTraceExporter {
      let urlConfig = URLSessionConfiguration.default
      if let headers = headers {
          let headersDict = Dictionary(uniqueKeysWithValues: headers)
          urlConfig.httpAdditionalHeaders = headersDict
      }

      return OtlpHttpTraceExporter(endpoint: URL(string: endpoint)!,
                                config: OtlpConfiguration(
                                    timeout: timeout,
                                    headers: headers
                                ),
                                useSession: URLSession(configuration: urlConfig),
                                envVarHeaders: headers
      )
  }

  private func setOtlpHttpLogExporter(endpoint: String,
                                      timeout: TimeInterval,
                                      headers: [(String, String)]?) -> OtlpHttpLogExporter {
    let urlConfig = URLSessionConfiguration.default
    if let headers = headers {
        let headersDict = Dictionary(uniqueKeysWithValues: headers)
        urlConfig.httpAdditionalHeaders = headersDict
    }

    return OtlpHttpLogExporter(endpoint: URL(string: endpoint)!,
                               config: OtlpConfiguration(
                                  timeout: timeout,
                                  headers: headers
                               ),
                               useSession: URLSession(configuration: urlConfig),
                               envVarHeaders: headers
    )
  }

  func setHttpExporters(_ spanConfigDict: NSDictionary?, logConfigDict: NSDictionary?) -> OpenTelemetryExport {
    var customSpanExporter: OtlpHttpTraceExporter?
    var customLogExporter: OtlpHttpLogExporter?

    // OTLP HTTP Trace Exporter
    if let spanConfigDict = spanConfigDict {
        let config = CustomExporterConfig.parse(spanConfigDict)

        if let spanEndpoint = config.endpoint {
            let spanTimeout = config.timeout
            let spanHeaders = config.headers

            customSpanExporter = self.setOtlpHttpTraceExporter(endpoint: spanEndpoint, timeout: spanTimeout, headers: spanHeaders)
        }
    }

    // OTLP HTTP Log Exporter
    if let logConfigDict = logConfigDict {
        let config = CustomExporterConfig.parse(logConfigDict)

        if let logEndpoint = config.endpoint {
            let logTimeout = config.timeout
            let logHeaders = config.headers

            customLogExporter = self.setOtlpHttpLogExporter(endpoint: logEndpoint, timeout: logTimeout, headers: logHeaders)
        }
    }

      return OpenTelemetryExport(spanExporter: customSpanExporter, logExporter: customLogExporter)
    }

    @objc(startNativeEmbraceSDK:otlpExportConfigDict:resolver:rejecter:)
    func startNativeEmbraceSDK(sdkConfigDict: NSDictionary,
                               otlpExportConfigDict: NSDictionary,
                               resolve: @escaping RCTPromiseResolveBlock,
                               rejecter reject: @escaping RCTPromiseRejectBlock) {
        let config = SDKConfig(from: sdkConfigDict)

        DispatchQueue.main.async {
            do {
                var embraceOptions: Embrace.Options {
                    var crashReporter: CrashReporter?
                    if config.disableCrashReporter {
                        crashReporter = nil
                    } else {
                        crashReporter = EmbraceCrashReporter()
                    }

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
                        servicesBuilder.remove(ofType: ViewCaptureService.self)
                    }

                    var endpoints: Embrace.Endpoints?
                    if config.endpointBaseUrl != nil {
                        endpoints = Embrace.Endpoints(baseURL: config.endpointBaseUrl!,
                                                      developmentBaseURL: config.endpointBaseUrl!,
                                                      configBaseURL: config.endpointBaseUrl!)
                    }

                    let traceExporter = otlpExportConfigDict.value(forKey: "traceExporter") as? NSDictionary
                    let logExporter = otlpExportConfigDict.value(forKey: "logExporter") as? NSDictionary

                    var exportConfig: OpenTelemetryExport?
                    if traceExporter == nil && logExporter == nil {
                        os_log("[Embrace] Neither Traces nor Logs configuration were found, skipping custom export.", log: self.log, type: .info)
                    } else {
                        exportConfig = self.setHttpExporters(traceExporter, logConfigDict: logExporter)
                    }

                    return .init(
                        appId: config.appId,
                        appGroupId: config.appGroupId,
                        platform: .reactNative,
                        endpoints: endpoints,
                        captureServices: servicesBuilder.build(),
                        crashReporter: crashReporter,
                        export: exportConfig
                    )
                }

                try Embrace.setup(options: embraceOptions)
                    .start()

                resolve(true)
            } catch let error {
                reject("START_EMBRACE_SDK", "Error starting Embrace SDK", error)
            }
        }
    }
}
