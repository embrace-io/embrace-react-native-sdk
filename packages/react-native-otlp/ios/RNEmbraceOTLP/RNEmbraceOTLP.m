#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNEmbraceOTLP, NSObject)

RCT_EXTERN_METHOD(setCustomExporter:(NSString *)endpoint
                  header:(NSString *)header
                  token:(NSString *)token
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

@end
