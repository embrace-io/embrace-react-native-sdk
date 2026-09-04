#import <React/RCTBridgeModule.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <RNEmbraceCoreSpec/RNEmbraceCoreSpec.h>
#endif

#if __has_include(<RNEmbraceCore/RNEmbraceCore-Swift.h>)
#import <RNEmbraceCore/RNEmbraceCore-Swift.h>
#else
#import "RNEmbraceCore-Swift.h"
#endif

// Declared here rather than in a header: s.source_files sweeps every .h into the pod
// umbrella, and a header exposing std::shared_ptr breaks the mixed-language module map.
@interface EmbraceManager : NSObject <RCTBridgeModule>
@end

#ifdef RCT_NEW_ARCH_ENABLED
@interface EmbraceManager () <NativeEmbraceManagerSpec>
@end
#endif

@implementation EmbraceManager {
  EmbraceManagerImpl *_impl;
}

RCT_EXPORT_MODULE(EmbraceManager)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (EmbraceManagerImpl *)impl
{
  if (!_impl) {
    _impl = [EmbraceManagerImpl new];
  }
  return _impl;
}

RCT_EXPORT_METHOD(isStarted:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl isStarted:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(startNativeEmbraceSDK:(NSDictionary *)config
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl startNativeEmbraceSDK:config resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(setJavaScriptBundlePath:(NSString *)path
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl setJavaScriptBundlePath:path resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(getDefaultJavaScriptBundlePath:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl getDefaultJavaScriptBundlePath:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(setJavaScriptPatchNumber:(NSString *)patch
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl setJavaScriptPatchNumber:patch resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(setReactNativeSDKVersion:(NSString *)version
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl setReactNativeSDKVersion:version resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(setReactNativeVersion:(NSString *)version
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl setReactNativeVersion:version resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(getDeviceId:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl getDeviceId:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(getCurrentSessionId:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl getCurrentSessionId:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(getLastRunEndState:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl getLastRunEndState:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(endSession:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl endSession:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(addSessionProperty:(NSString *)key
                  value:(NSString *)value
                  permanent:(BOOL)permanent
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl addSessionProperty:key value:value permanent:permanent resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(removeSessionProperty:(NSString *)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl removeSessionProperty:key resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(setUserIdentifier:(NSString *)userIdentifier
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl setUserIdentifier:userIdentifier resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(clearUserIdentifier:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl clearUserIdentifier:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(setUsername:(NSString *)userName
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl setUsername:userName resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(clearUsername:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl clearUsername:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(setUserEmail:(NSString *)userEmail
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl setUserEmail:userEmail resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(clearUserEmail:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl clearUserEmail:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(addUserPersona:(NSString *)persona
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl addUserPersona:persona resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(clearUserPersona:(NSString *)persona
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl clearUserPersona:persona resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(clearAllUserPersonas:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl clearAllUserPersonas:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(addBreadcrumb:(NSString *)event
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl addBreadcrumb:event resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(logMessageWithSeverityAndProperties:(NSString *)message
                  severity:(NSString *)severity
                  properties:(NSDictionary *)properties
                  stacktrace:(NSString *)stacktrace
                  includeStacktrace:(BOOL)includeStacktrace
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl logMessageWithSeverityAndProperties:message
                                        severity:severity
                                      properties:properties
                                      stacktrace:stacktrace
                               includeStacktrace:includeStacktrace
                                        resolver:resolve
                                        rejecter:reject];
}

RCT_EXPORT_METHOD(logHandledError:(NSString *)message
                  stacktrace:(NSString *)stacktrace
                  properties:(NSDictionary *)properties
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl logHandledError:message
                  stacktrace:stacktrace
                  properties:properties
                    resolver:resolve
                    rejecter:reject];
}

RCT_EXPORT_METHOD(logUnhandledJSException:(NSString *)name
                  message:(NSString *)message
                  type:(NSString *)type
                  stacktrace:(NSString *)stacktrace
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl logUnhandledJSException:name
                             message:message
                                type:type
                          stacktrace:stacktrace
                            resolver:resolve
                            rejecter:reject];
}

RCT_EXPORT_METHOD(logNetworkRequest:(NSString *)url
                  httpMethod:(NSString *)httpMethod
                  startInMillis:(double)startInMillis
                  endInMillis:(double)endInMillis
                  bytesSent:(double)bytesSent
                  bytesReceived:(double)bytesReceived
                  statusCode:(double)statusCode
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl logNetworkRequest:url
                    httpMethod:httpMethod
                 startInMillis:startInMillis
                   endInMillis:endInMillis
                     bytesSent:bytesSent
                 bytesReceived:bytesReceived
                    statusCode:statusCode
                      resolver:resolve
                      rejecter:reject];
}

RCT_EXPORT_METHOD(logNetworkClientError:(NSString *)url
                  httpMethod:(NSString *)httpMethod
                  startInMillis:(double)startInMillis
                  endInMillis:(double)endInMillis
                  errorType:(NSString *)errorType
                  errorMessage:(NSString *)errorMessage
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.impl logNetworkClientError:url
                        httpMethod:httpMethod
                     startInMillis:startInMillis
                       endInMillis:endInMillis
                         errorType:errorType
                      errorMessage:errorMessage
                          resolver:resolve
                          rejecter:reject];
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeEmbraceManagerSpecJSI>(params);
}
#endif

@end
