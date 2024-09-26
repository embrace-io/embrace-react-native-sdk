#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNEmbraceOTLP, NSObject)

RCT_EXTERN_METHOD(setHttpExporters:(NSDictionary *)spanConfigDict
                  logConfigDict:(NSDictionary *)logConfigDict
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setGrpExporters:(NSDictionary *)spanConfigDict
                  logConfigDict:(NSDictionary *)logConfigDict
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

@end
