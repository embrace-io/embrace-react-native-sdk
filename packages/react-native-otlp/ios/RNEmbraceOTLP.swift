import React
import JavaScriptCore
import Foundation
import EmbraceIO
import EmbraceCrash
import OpenTelemetrySdk
import EmbraceCommonInternal
import OSLog

@objc class RNExporterConfig: NSObject {
    var endpoint: String?
    var timeout: TimeInterval
    var headers: [(String, String)]?

  init(endpoint: String?, timeout: TimeInterval, headers: [(String, String)]?) {
    self.endpoint = endpoint
    self.timeout = timeout
    self.headers = headers
  }

  @objc static func parse(_ dict: NSDictionary) -> RNExporterConfig {
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

      return RNExporterConfig(endpoint: endpoint, timeout: timeoutInterval, headers: headers)
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
        let config = RNExporterConfig.parse(spanConfigDict)

        if let spanEndpoint = config.endpoint {
            let spanTimeout = config.timeout
            let spanHeaders = config.headers

            customSpanExporter = self.setOtlpHttpTraceExporter(endpoint: spanEndpoint, timeout: spanTimeout, headers: spanHeaders)
        }
    }

    // OTLP HTTP Log Exporter
    if let logConfigDict = logConfigDict {
        let config = RNExporterConfig.parse(logConfigDict)

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

        let traceExporter = otlpExportConfigDict.value(forKey: "traceExporter") as? NSDictionary
        let logExporter = otlpExportConfigDict.value(forKey: "logExporter") as? NSDictionary

        DispatchQueue.main.async {
            do {
                var exportConfig: OpenTelemetryExport?
                if traceExporter == nil && logExporter == nil {
                    os_log("[Embrace] Neither Traces nor Logs configuration were found, skipping custom export.", log: self.log, type: .info)
                } else {
                    exportConfig = self.setHttpExporters(traceExporter, logConfigDict: logExporter)
                }
                
                // injecting exporters to helper
                try Embrace.setup(options: initEmbraceOptions(config: config, exporters: exportConfig))
                    .start()

                resolve(true)
            } catch let error {
                reject("START_EMBRACE_SDK", "Error starting Embrace SDK", error)
            }
        }
    }
}
