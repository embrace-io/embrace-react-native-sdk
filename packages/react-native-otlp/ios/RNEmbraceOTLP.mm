#import <React/RCTBridgeModule.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <RNEmbraceOTLPSpec/RNEmbraceOTLPSpec.h>
#endif

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

#ifdef RCT_NEW_ARCH_ENABLED
@implementation RNEmbraceOTLP (TurboModule)
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRNEmbraceOTLPSpecJSI>(params);
}
@end
#endif
