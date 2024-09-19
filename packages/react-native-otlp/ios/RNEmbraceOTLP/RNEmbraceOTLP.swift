import React
import Foundation
import EmbraceIO
import OpenTelemetrySdk
import EmbraceCommonInternal

@objc(RNEmbraceOTLP)
class RNEmbraceOTLP: NSObject {
  @objc(setCustomExporter:header:token:resolver:rejecter:)
  func setCustomExporter (_ endpoint: String,
                          header: String,
                          token: String,
                          resolver resolve: RCTPromiseResolveBlock,
                          rejecter reject: RCTPromiseRejectBlock) {
    
    if (token.isEmpty) {
      reject("INIT_CUSTOM_EXPORTER_ERROR", "Token can't be empty", nil)
    }
    
    if (header.isEmpty) {
      reject("INIT_CUSTOM_EXPORTER_ERROR", "Header can't be empty", nil)
    }

    resolve(true)
  }
  
  private func setCustomSpanExporter () -> NSObject {
    var spanExporter: OtlpHttpExporterBase
    
    return spanExporter.toDictionary() as NSObject
  }
  
  private func setCustomLogExporter () -> NSObject {
    
  }

  @objc
  func getCustomExporter() {

  }
}
