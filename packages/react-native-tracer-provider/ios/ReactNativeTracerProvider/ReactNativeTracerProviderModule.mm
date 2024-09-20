#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ReactNativeTracerProviderModule, NSObject)

RCT_EXTERN_METHOD(setupTracer:(NSString *)name version:(NSString *)version schemaUrl:(NSString *)schemaUrl)

RCT_EXTERN_METHOD(startSpan:(NSString *)tracerName tracerVersion:(NSString *)tracerVersion tracerSchemaUrl:(NSString *)tracerSchemaUrl spanBridgeId:(NSString *)spanBridgeId name:(NSString *)name kind:(NSString *)kind time:(double)time attributes:(NSDictionary)attributes links:(NSArray)links parentId:(NSString *)parentId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setAttributes:(NSString *)spanBridgeId attributes:(NSDictionary)attributes)

RCT_EXTERN_METHOD(addEvent:(NSString *)spanBridgeId eventName:(NSString *)eventName attributes:(NSDictionary)attributes time:(double)time)

RCT_EXTERN_METHOD(addLinks:(NSString *)spanBridgeId links:(NSArray)links)

RCT_EXTERN_METHOD(setStatus:(NSString *)spanBridgeId status:(NSDictionary)status)

RCT_EXTERN_METHOD(updateName:(NSString *)spanBridgeId name:(NSString *)name)

RCT_EXTERN_METHOD(endSpan:(NSString *)spanBridgeId time:(double)time)

RCT_EXTERN_METHOD(clearCompletedSpans)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
