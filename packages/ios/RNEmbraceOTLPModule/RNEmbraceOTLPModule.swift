import Foundation

@objc(RNEmbraceOTLPModule)
class RNEmbraceOTLPModule: NSObject {
    @objc(setCustomExporter:header:token:resolver:rejecter:)
    func setCustomExporter (_ endpoint: String,
                            header: String,
                            token: String,
                            resolver resolve: RCTPromiseResolveBlock,
                            rejecter reject: RCTPromiseRejectBlock) {
        
        print("Native Module: RNEMbraceOTLP.setCustomExporter")

        resolve(true)
    }
}
