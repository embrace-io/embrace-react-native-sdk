#import <React/RCTBridgeModule.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <RNEmbraceCoreSpec/RNEmbraceCoreSpec.h>
#endif

#if __has_include(<RNEmbraceCore/RNEmbraceCore-Swift.h>)
#import <RNEmbraceCore/RNEmbraceCore-Swift.h>
#else
#import "RNEmbraceCore-Swift.h"
#endif

@interface EmbraceTracerProvider : NSObject <RCTBridgeModule>
@end

#ifdef RCT_NEW_ARCH_ENABLED
@interface EmbraceTracerProvider () <NativeEmbraceTracerProviderSpec>
@end
#endif

@implementation EmbraceTracerProvider {
  EmbraceTracerProviderImpl *_impl;
}

RCT_EXPORT_MODULE(EmbraceTracerProvider)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (dispatch_queue_t)methodQueue
{
  static dispatch_queue_t queue;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    queue = dispatch_queue_create("io.embrace.rnembracecore.tracerprovider", DISPATCH_QUEUE_SERIAL);
  });
  return queue;
}

- (EmbraceTracerProviderImpl *)impl
{
  if (!_impl) {
    _impl = [EmbraceTracerProviderImpl new];
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
  return std::make_shared<facebook::react::NativeEmbraceTracerProviderSpecJSI>(params);
}
#endif

@end
