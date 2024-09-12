import React
import Foundation

@objc(RNEmbraceOTLP)
class RNEmbraceOTLP: NSObject {
    @objc(setCustomExporter:header:token:resolver:rejecter:)
    func setCustomExporter (_ endpoint: String,
                            header: String,
                            token: String,
                            resolver resolve: RCTPromiseResolveBlock,
                            rejecter reject: RCTPromiseRejectBlock) {
        

        resolve(true)
    }
}
