#import <React/RCTBridgeModule.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <RNEmbraceTracerProviderSpec/RNEmbraceTracerProviderSpec.h>
#endif

#if __has_include(<RNEmbraceTracerProvider/RNEmbraceTracerProvider-Swift.h>)
#import <RNEmbraceTracerProvider/RNEmbraceTracerProvider-Swift.h>
#else
#import "RNEmbraceTracerProvider-Swift.h"
#endif

@interface ReactNativeTracerProviderModule : NSObject <RCTBridgeModule>
@end

#ifdef RCT_NEW_ARCH_ENABLED
@interface ReactNativeTracerProviderModule () <NativeReactNativeTracerProviderModuleSpec>
@end
#endif

@implementation ReactNativeTracerProviderModule {
  ReactNativeTracerProviderModuleImpl *_impl;
}

RCT_EXPORT_MODULE(ReactNativeTracerProviderModule)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (dispatch_queue_t)methodQueue
{
  static dispatch_queue_t queue;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    queue = dispatch_queue_create("io.embrace.reactnativetracerprovider", DISPATCH_QUEUE_SERIAL);
  });
  return queue;
}

- (ReactNativeTracerProviderModuleImpl *)impl
{
  if (!_impl) {
    _impl = [ReactNativeTracerProviderModuleImpl new];
  }
  return _impl;
}

RCT_EXPORT_METHOD(setupTracer:(NSString *)name
                  version:(NSString *)version
                  schemaUrl:(NSString *)schemaUrl)
{
  [self.impl setupTracer:name version:version schemaUrl:schemaUrl];
}

RCT_EXPORT_METHOD(startSpan:(NSString *)tracerName
                  tracerVersion:(NSString *)tracerVersion
                  tracerSchemaUrl:(NSString *)tracerSchemaUrl
                  spanBridgeId:(NSString *)spanBridgeId
                  name:(NSString *)name
                  kind:(NSString *)kind
                  time:(double)time
                  attributes:(NSDictionary *)attributes
                  links:(NSArray *)links
                  parentId:(NSString *)parentId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl startSpan:tracerName
         tracerVersion:tracerVersion
       tracerSchemaUrl:tracerSchemaUrl
          spanBridgeId:spanBridgeId
                  name:name
                  kind:kind
                  time:time
            attributes:attributes
                 links:links
              parentId:parentId
               resolve:resolve
                reject:reject];
}

RCT_EXPORT_METHOD(setAttributes:(NSString *)spanBridgeId
                  attributes:(NSDictionary *)attributes)
{
  [self.impl setAttributes:spanBridgeId attributes:attributes];
}

RCT_EXPORT_METHOD(addEvent:(NSString *)spanBridgeId
                  eventName:(NSString *)eventName
                  attributes:(NSDictionary *)attributes
                  time:(double)time)
{
  [self.impl addEvent:spanBridgeId eventName:eventName attributes:attributes time:time];
}

RCT_EXPORT_METHOD(addLinks:(NSString *)spanBridgeId
                  links:(NSArray *)links)
{
  [self.impl addLinks:spanBridgeId links:links];
}

RCT_EXPORT_METHOD(setStatus:(NSString *)spanBridgeId
                  status:(NSDictionary *)status)
{
  [self.impl setStatus:spanBridgeId status:status];
}

RCT_EXPORT_METHOD(updateName:(NSString *)spanBridgeId
                  name:(NSString *)name)
{
  [self.impl updateName:spanBridgeId name:name];
}

RCT_EXPORT_METHOD(endSpan:(NSString *)spanBridgeId
                  endTime:(double)endTime)
{
  [self.impl endSpan:spanBridgeId time:endTime];
}

RCT_EXPORT_METHOD(clearCompletedSpans)
{
  [self.impl clearCompletedSpans];
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeReactNativeTracerProviderModuleSpecJSI>(params);
}
#endif

@end
