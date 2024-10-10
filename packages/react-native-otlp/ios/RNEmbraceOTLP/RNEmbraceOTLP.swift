import React
import Foundation
import EmbraceIO
import OpenTelemetrySdk
import EmbraceCommonInternal

@objc class CustomExporterConfig: NSObject {
    var endpoint: String
    var timeout: NSNumber?
    var header: [(String, String)]?

    init(endpoint: String, timeout: NSNumber?, header: [(String, String)]?) {
        self.endpoint = endpoint
        self.timeout = timeout
        self.header = header
    }

    // Helper method to create `CustomExporterConfig` from NSDictionary (JS object)
    @objc static func fromDictionary(_ dict: NSDictionary) -> CustomExporterConfig {
        let endpoint = dict["endpoint"] as! String
        let timeout = dict["timeout"] as? NSNumber

        var headers: [(String, String)] = []
        if let headerDicts = dict["header"] as? [NSDictionary] {
            for headerDict in headerDicts {
                let tuples: [(String, String)] = headerDict.allKeys.compactMap { key in
                    guard let keyString = key as? String,
                          let value = headerDict[key] as? String else {
                        return nil
                    }
                    return (keyString, value)
                }
                
                headers.append(contentsOf: tuples)
            }
        }

        return CustomExporterConfig(endpoint: endpoint, timeout: timeout, header: headers)
    }
}

func convertToTimeInterval(from number: NSNumber?) -> TimeInterval? {
    guard let number = number else {
        return nil
    }
    return number.doubleValue
}

@objc(RNEmbraceOTLP)
class RNEmbraceOTLP: NSObject {
  // Http starts
  private func setOtlpHttpTraceExporter(endpoint: String,
                                        timeout: NSNumber,
                                        header: [(String,String)]?) -> OtlpHttpTraceExporter {
    
    return OtlpHttpTraceExporter(endpoint: URL(string: endpoint)!, // NOTE: make sure about extra validations (format/non-empty)
                                 config: OtlpConfiguration(
                                    timeout: convertToTimeInterval(from: timeout)!, // NOTE: make sure about extra validations (not-nil)
                                    headers: header
                                 )
    );
  }
  
  private func setOtlpHttpLogExporter(endpoint: String,
                                      timeout: NSNumber?,
                                      header: [(String,String)]?) -> OtlpHttpLogExporter {
    return OtlpHttpLogExporter(endpoint: URL(string: endpoint)!, // NOTE: make sure about extra validations (format/non-empty)
                               config: OtlpConfiguration(
                                  timeout: convertToTimeInterval(from: timeout)!,  // NOTE: make sure about extra validations (not-nil)
                                  headers: header
                               )
    );
  }
  
  @objc(setHttpExporters:logConfigDict:resolver:rejecter:)
  func setHttpExporters(_ spanConfigDict: NSDictionary?,
                          logConfigDict: NSDictionary?,
                          resolver resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    if (spanConfigDict == nil && logConfigDict == nil) {
      reject("SET_OTLP_HTTP_CUSTOM_EXPORTER", "Error setting http custom exporter, it should receive at least one configuration", nil)
      return
    }
    
    var customSpanExporter: OtlpHttpTraceExporter? = nil
    var customLogExporter: OtlpHttpLogExporter? = nil
        
    // OTLP HTTP Trace Exporter
    if spanConfigDict != nil {
      var spanConfig = CustomExporterConfig.fromDictionary(spanConfigDict!)
      customSpanExporter = self.setOtlpHttpTraceExporter(endpoint: spanConfig.endpoint,
                                                         timeout: spanConfig.timeout!,
                                                         header: spanConfig.header!);
    }
    
    // OTLP HTTP Log Exporter
    if logConfigDict != nil {
      var logConfig = CustomExporterConfig.fromDictionary(logConfigDict!)
      customLogExporter = self.setOtlpHttpLogExporter(endpoint: logConfig.endpoint,
                                                      timeout: logConfig.timeout!,
                                                      header: logConfig.header!)
    }
    
    OpenTelemetryExport(spanExporter: customSpanExporter, logExporter: customLogExporter)

    resolve(true)
    return
  }
  // Http ends
  
//  // Grpc starts
//  private func setOtlpGrpcTraceExporter(endpoint: String,
//                                        timeout: NSNumber,
//                                        header: [(String,String)]?) -> OtlpTraceExporter {
//    return OtlpTraceExporter(endpoint: endpoint,
//                               config: OtlpConfiguration(
//                                  timeout: timeout as TimeInterval,
//                                  headers: header
//                               )
//    );
//  }
//  
//  private func setOtlpGrpcLogExporter(endpoint: String,
//                                      header: [(String,String)]?,
//                                      timeout: NSNumber?) -> OtlpLogExporter {
//    return OtlpLogExporter(endpoint: endpoint,
//                             config: OtlpConfiguration(
//                                timeout: timeout as TimeInterval,
//                                headers: header
//                             )
//    );
//  }
//
//  @objc(setGrpcExporters:logConfig:resolver:rejecter:)
//  func setGrpExporters(_ spanConfigDict: NSDictionary?,
//                              logConfigDict: NSDictionary?,
//                              resolver resolve: @escaping RCTPromiseResolveBlock,
//                              rejecter reject: @escaping RCTPromiseRejectBlock) -> OpenTelemetryExport? {
//    if (spanConfigDict == nil && logConfigDict == nil) {
//      reject("SET_OTLP_GRPC_CUSTOM_EXPORTER", "Error setting grpc custom exporter, it should receive at least one configuration", nil)
//      return nil
//    }
//
//    let customSpanExporter: OtlpTraceExporter?
//    let customLogExporter: OtlpLogExporter?
//    
//    // OTLP GRPC Trace Exporter
//    if spanConfigDict != nil {
//      var spanConfig = CustomExporterConfig.fromDictionary(spanConfigDict!)
//      customSpanExporter = this.setOtlpGrpcTraceExporter(endpoint: spanConfig.endpoint,
//                                                         header: spanConfig.header,
//                                                         timeout: spanConfig?.timeout);
//    }
//    
//    // OTLP GRPC Log Exporter
//    if logConfigDict != nil {
//      var spanConfig = CustomExporterConfig.fromDictionary(logConfigDict!)
//      customLogExporter = this.setOtlpGrpcLogExporter(endpoint: logConfig.endpoint,
//                                                      header: logConfig.header,
//                                                      timeout: logConfig.timeout)
//    }
//    
//    resolve(OpenTelemetryExport(spanExporter: customSpanExporter, logExporter: customLogExporter))
//  }
}
