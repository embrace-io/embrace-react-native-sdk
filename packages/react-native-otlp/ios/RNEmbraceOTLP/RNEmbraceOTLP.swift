import React
import Foundation
import EmbraceIO
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
    
    let urlConfig = URLSessionConfiguration.default
    urlConfig.httpAdditionalHeaders = ["Authorization": "Basic \(token)"]
    
//    try? Embrace
//      .setup(
//        options: Embrace.Options(
//          appId: "AppID",
//          logLevel: .debug,
//          export: OpenTelemetryExport(
//            spanExporter: OtlpHttpTraceExporter(
//              endpoint: URL(string: "https://otlp-gateway-prod-us-west-0.grafana.net/otlp/v1/traces")!,
//              useSession: URLSession(configuration: urlConfig)
//            ),
//            logExporter: OtlpHttpLogExporter(
//              endpoint: URL(string: "https://otlp-gateway-prod-us-west-0.grafana.net/otlp/v1/logs")!,
//              useSession: URLSession(configuration: urlConfig)
//            )
//          )
//        )
//      )
//      .start()
    
    
    resolve(true)
  }

  @objc
  func initCustomExporter() {

  }
}
