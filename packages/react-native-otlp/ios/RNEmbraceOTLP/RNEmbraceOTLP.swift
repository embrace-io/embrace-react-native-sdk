import React
import Foundation
import EmbraceIO
import OpenTelemetrySdk
import EmbraceCommonInternal

@objc class CustomExporterConfig: NSObject {
    var endpoint: String
    var timeout: NSNumber?
    var header: [NSDictionary]?

    init(endpoint: String, timeout: NSNumber?, header: [NSDictionary]?) {
        self.endpoint = endpoint
        self.timeout = timeout
        self.header = header
    }

    // Helper method to create `CustomExporterConfig` from NSDictionary (JS object)
    @objc static func fromDictionary(_ dict: NSDictionary) -> CustomExporterConfig? {
        guard let endpoint = dict["endpoint"] as? String else {
          return nil
        }

        let timeout = dict["timeout"] as? NSNumber
        let header = dict["header"] as? [NSDictionary]
      
        return CustomExporterConfig(endpoint: endpoint, timeout: timeout, header: header)
    }

    // Convert back to NSDictionary if needed for other methods or React Native calls
    @objc func toDictionary() -> NSDictionary {
        var dict = [String: Any]()
        dict["endpoint"] = self.endpoint

        if let timeout = self.timeout {
            dict["timeout"] = timeout
        }
        
        if let header = self.header {
            dict["header"] = header
        }

        return dict as NSDictionary
    }
}


@objc(RNEmbraceOTLP)
class RNEmbraceOTLP: NSObject {
  // Http starts
  private func setOtlpHttpTraceExporter(endpoint: String,
                                        timeout: NSNumber,
                                        header: [(String,String)]?) -> OtlpHttpTraceExporter {
    return OtlpHttpTraceExporter(endpoint: endpoint,
                                 config: OtlpConfiguration(
                                    timeout: timeout as TimeInterval,
                                    headers: header
                                 )
    );
  }
  
  private func setOtlpHttpLogExporter(endpoint: String,
                                      header: [(String,String)]?,
                                      timeout: NSNumber?) -> OtlpHttpLogExporter {
    return OtlpHttpLogExporter(endpoint: endpoint,
                               config: OtlpConfiguration(
                                  timeout: timeout as TimeInterval,
                                  headers: header
                               )
    );
  }
  
  @objc(setHttpExporters:logConfigDict:resolver:rejecter:)
  func setHttpExporters(_ spanConfigDict: NSDictionary?,
                          logConfigDict: NSDictionary?,
                          resolver resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) -> OpenTelemetryExport? {
    
    if (spanConfigDict == nil && logConfigDict == nil) {
      reject("SET_OTLP_HTTP_CUSTOM_EXPORTER", "Error setting http custom exporter, it should receive at least one configuration", nil)
      return nil
    }
    
    let customSpanExporter: OtlpHttpTraceExporter?
    let customLogExporter: OtlpHttpLogExporter?
        
    // OTLP HTTP Trace Exporter
    if spanConfigDict != nil {
      var spanConfig = CustomExporterConfig.fromDictionary(spanConfigDict!)
      customSpanExporter = self.setOtlpHttpTraceExporter(endpoint: spanConfig.endpoint,
                                                               header: spanConfig.header,
                                                               timeout: spanConfig?.timeout);
    }
    
    // OTLP HTTP Log Exporter
    if logConfigDict != nil {
      var logConfig = CustomExporterConfig.fromDictionary(logConfigDict!)
      customLogExporter = self.setOtlpHttpLogExporter(endpoint: logConfig.endpoint,
                                                            header: logConfig.header,
                                                            timeout: logConfig.timeout)
    }

    resolve(OpenTelemetryExport(spanExporter: customSpanExporter, logExporter: customLogExporter))
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
