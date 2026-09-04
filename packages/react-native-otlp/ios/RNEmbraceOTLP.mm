#import <React/RCTBridgeModule.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <RNEmbraceOTLPSpec/RNEmbraceOTLPSpec.h>
#endif

#if __has_include(<RNEmbraceOTLP/RNEmbraceOTLP-Swift.h>)
#import <RNEmbraceOTLP/RNEmbraceOTLP-Swift.h>
#else
#import "RNEmbraceOTLP-Swift.h"
#endif

@interface RNEmbraceOTLP : NSObject <RCTBridgeModule>
@end

#ifdef RCT_NEW_ARCH_ENABLED
@interface RNEmbraceOTLP () <NativeRNEmbraceOTLPSpec>
@end
#endif

@implementation RNEmbraceOTLP {
  RNEmbraceOTLPImpl *_impl;
}

RCT_EXPORT_MODULE(RNEmbraceOTLP)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (RNEmbraceOTLPImpl *)impl
{
  if (!_impl) {
    _impl = [RNEmbraceOTLPImpl new];
  }
  return _impl;
}

RCT_EXPORT_METHOD(startNativeEmbraceSDK:(NSDictionary *)sdkConfig
                  otlpExporterConfig:(NSDictionary *)otlpExporterConfig
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl startNativeEmbraceSDK:sdkConfig
              otlpExportConfigDict:otlpExporterConfig
                          resolver:resolve
                          rejecter:reject];
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeRNEmbraceOTLPSpecJSI>(params);
}
#endif

@end
