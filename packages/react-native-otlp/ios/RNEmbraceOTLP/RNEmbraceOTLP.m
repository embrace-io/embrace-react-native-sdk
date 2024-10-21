#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNEmbraceOTLP, NSObject)

RCT_EXTERN_METHOD(startNativeEmbraceSDK:(NSDictionary)sdkConfig
                  otlpExportConfigDict:(NSDictionary)otlpExportConfigDict
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

@end
