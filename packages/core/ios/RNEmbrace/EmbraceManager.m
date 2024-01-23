#import "EmbraceManager.h"
#import <Embrace/Embrace.h>

#if __has_include(<CodePush/CodePush.h>)
#import <CodePush/CodePush.h>
#endif

@implementation EmbraceManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(endAppStartup:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] endAppStartup];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(endAppStartupWithProperties:(NSDictionary*)properties resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] endAppStartupWithProperties: properties];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(isStarted:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    BOOL success = [[Embrace sharedInstance] isStarted];
    resolve(@(success));
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}



RCT_EXPORT_METHOD(setUserIdentifier:(NSString*)userIdentifier resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] setUserIdentifier:userIdentifier];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(setUsername:(NSString*)username resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] setUsername:username];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(setUserEmail:(NSString*)userEmail resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] setUserEmail:userEmail];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(clearUserEmail:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] clearUserEmail];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(clearUserIdentifier:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] clearUserIdentifier];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(clearUsername:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] clearUsername];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(addBreadcrumb:(NSString*)message resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] logBreadcrumbWithMessage:message];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(startMomentWithName:(NSString*)name resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] startMomentWithName:name];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(startMomentWithNameAndIdentifier:(NSString*)name identifier:(NSString*)identifier resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] startMomentWithName:name identifier:identifier];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(startMomentWithNameAndIdentifierAndProperties:(NSString*)name identifier:(NSString*)identifier properties:(NSDictionary*)properties resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] startMomentWithName:name identifier:identifier properties:properties];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(endMomentWithName:(NSString*)name properties:(NSDictionary*)properties resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] endMomentWithName:name properties:properties];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(endMomentWithNameAndIdentifier:(NSString*)name identifier:(NSString*)identifier properties:(NSDictionary*)properties resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] endMomentWithName:name identifier:identifier properties:properties];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(addUserPersona:(NSString*)persona resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] setUserPersona:persona];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(clearUserPersona:(NSString*)persona resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] clearUserPersona:persona];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(clearAllUserPersonas:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] clearAllUserPersonas];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

-(EMBSeverity)severityFromString:(NSString*)inputString {
  if ([inputString isEqualToString:@"info"]) {
    return EMBSeverityInfo;
  } else if ([inputString isEqualToString:@"warning"]) {
    return EMBSeverityWarning;
  }
  return EMBSeverityError;
}

RCT_EXPORT_METHOD(logMessageWithSeverity:(NSString*)message severity:(NSString*)severity resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] logMessage:message withSeverity:[self severityFromString:severity]];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}


RCT_EXPORT_METHOD(
  logMessageWithSeverityAndProperties:(NSString*)message
                             severity:(NSString*)severity
                           properties:(NSDictionary*)properties
                         jsStackTrace:(NSString *)jsStackTrace
                             resolver:(RCTPromiseResolveBlock)resolve
                             rejecter:(RCTPromiseRejectBlock)reject
) {
  @try {
    [[RNEmbrace sharedInstance] logMessage:message withSeverity:[self severityFromString:severity] properties:properties takeScreenshot:NO jsStackTrace:jsStackTrace wasHandled:YES];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(logHandledError:(NSString*)message jsStackTrace:(NSString *)jsStackTrace properties:(NSDictionary*)properties resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[RNEmbrace sharedInstance] logMessage:message withSeverity:EMBSeverityError properties:properties takeScreenshot:NO jsStackTrace:jsStackTrace wasHandled:YES];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(startView:(NSString*)viewName resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    SEL selector = NSSelectorFromString(@"startViewWithName:");
    Embrace *instance = [Embrace sharedInstance];
    if ([instance respondsToSelector:selector]) {
        IMP imp = [instance methodForSelector:selector];
        ((void (*)(id, SEL, NSString *))imp)(instance, _cmd, viewName);
    } else {
      NSLog(@"Custom Views Not Supported");
    }
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
   
}

RCT_EXPORT_METHOD(endView:(NSString*)viewName resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    SEL selector = NSSelectorFromString(@"endViewWithName:");
    Embrace *instance = [Embrace sharedInstance];
    if ([instance respondsToSelector:selector]) {
        IMP imp = [instance methodForSelector:selector];
        ((void (*)(id, SEL, NSString *))imp)(instance, _cmd, viewName);
    } else{
      NSLog(@"Custom Views Not Supported");
    }    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(logRNAction:(NSString *)actionName startTime:(nonnull NSDate *)startTime endTime:(NSDate *)endTime properties:(NSDictionary *)properties payloadSize:(NSInteger *)payloadSize output:(NSString *)output resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[RNEmbrace sharedInstance] logRNA:actionName output:output payloadSize:payloadSize properties:properties startTime:startTime endTime:endTime];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(logUnhandledJSException:(NSString *)name message:(NSString *)message type:(NSString *)type stackTrace:(NSString *)stackTrace resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[RNEmbrace sharedInstance] logUnhandledJSException:name message:message type:type stackTrace:stackTrace];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(setJavaScriptPatchNumber:(NSString *)number resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[RNEmbrace sharedInstance] setJavaScriptPatchNumber:number];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(setReactNativeSDKVersion:(NSString *)version resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[RNEmbrace sharedInstance] setEmbraceReactNativeSdkVersion:version];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(setJavaScriptBundlePath:(NSString *)path resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[RNEmbrace sharedInstance] setJavaScriptBundleURL:path];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(setReactNativeVersion:(NSString *)version resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[RNEmbrace sharedInstance] setReactNativeVersion:version];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(checkAndSetCodePushBundleURL:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    #if __has_include(<CodePush/CodePush.h>)
      NSURL *url = [CodePush bundleURL];
      [[RNEmbrace sharedInstance] setJavaScriptBundleURL:url.path];
      resolve(@YES);
    #else
      resolve(@NO);
    #endif
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(addSessionProperty:(NSString*)key value:(NSString*)value permanent:(BOOL)permanent resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    BOOL success = [[Embrace sharedInstance] addSessionProperty:value withKey:key permanent:permanent];
    resolve(@(success));
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(removeSessionProperty:(NSString*)key resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] removeSessionPropertyWithKey:key];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(trackWebViewPerformance:(NSString*)tag message:(NSString*)message resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] trackWebViewPerformance:tag message:message];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD (getSessionProperties:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    NSDictionary *props = [[Embrace sharedInstance] getSessionProperties];
    resolve(props);
  } @catch (NSException *exception) {
    resolve(nil);
  }
}

RCT_EXPORT_METHOD(endSession:(BOOL)clearUserInfo resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] endSession:clearUserInfo];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(setUserAsPayer:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] setUserAsPayer];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(clearUserAsPayer:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[Embrace sharedInstance] clearUserAsPayer];
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(getDeviceId:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {

  @try {
    NSString *deviceId = [[Embrace sharedInstance] getDeviceId];
    resolve(deviceId);
  } @catch (NSException *exception) {
    resolve(nil);
  }
}


RCT_EXPORT_METHOD(getLastRunEndState:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EMBLastRunEndState lastEndState = [Embrace sharedInstance].lastRunEndState;
  if(lastEndState == EMBLastRunEndStateInvalid)
  {
    resolve(@"INVALID");
  }
  if (lastEndState == EMBLastRunEndStateCrash){
    resolve(@"CRASH");
  }
  if (lastEndState == EMBLastRunEndStateCleanExit){
    resolve(@"CLEAN_EXIT");
  }
}

RCT_EXPORT_METHOD(getCurrentSessionId:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    NSString *sessionId = [[Embrace sharedInstance] getCurrentSessionId];
    resolve(sessionId);
  } @catch (NSException *exception) {
    resolve(nil);
  }
}

RCT_EXPORT_METHOD(startNativeEmbraceSDK:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    dispatch_async(dispatch_get_main_queue(), ^{
      NSDictionary *emptyDictionary = [NSDictionary dictionary];
      [[Embrace sharedInstance] startWithLaunchOptions:emptyDictionary framework:EMBAppFrameworkReactNative];
    });
    resolve(@YES);
  } @catch (NSException *exception) {
    resolve(@NO);
  }
}

RCT_EXPORT_METHOD(
  logNetworkRequest:
    (NSString*)url 
    method:(NSString*)method 
    startms:(nonnull NSNumber*)startms 
    endms:(nonnull NSNumber*)endms 
    bytesSent:(NSInteger)bytesSent 
    bytesReceived:(NSInteger)bytesReceived 
    statusCode:(NSInteger)statusCode 
    error:(NSString*)error 
    resolver:(RCTPromiseResolveBlock)resolve 
    rejecter:(RCTPromiseRejectBlock)reject) {
    if (url == nil) {
        NSLog(@"Url cannot be null when logging a network request, ignoring.");
        resolve(@NO);
        return;
    }
    
    @try {
      NSURL *urlObj = [NSURL URLWithString:[NSString stringWithUTF8String:[url UTF8String]]];
          // Divide by 1000 because the startms method is returning milliseconds since the epoch, not seconds since the epoch
          NSDate *startTime = [NSDate dateWithTimeIntervalSince1970:startms.doubleValue/1000];
          NSDate *endTime = [NSDate dateWithTimeIntervalSince1970:endms.doubleValue/1000];
          NSError *errorObj = nil;
          if (error != nil) {
              NSString *errorStr = [NSString stringWithUTF8String:[error UTF8String]];
              errorObj = [NSError errorWithDomain:@"NativeInterface" code:statusCode userInfo:@{@"userinfo": errorStr}];
          }

      EMBNetworkRequest *request = 
        [EMBNetworkRequest 
          networkRequestWithURL:urlObj 
          method:method 
          startTime:startTime 
          endTime:endTime 
          bytesIn:bytesReceived 
          bytesOut:bytesSent 
          responseCode:statusCode 
          error:errorObj 
          traceId:nil];
      [[Embrace sharedInstance] logNetworkRequest:request];
      resolve(@YES);
    } @catch (NSException *exception) {
      resolve(@NO);
    }
   
}

RCT_EXPORT_METHOD(
  logNetworkClientError:
    (NSString*)url 
    method:(NSString*)method 
    startms:(nonnull NSNumber*)startms 
    endms:(nonnull NSNumber*)endms 
    errorType:(NSString*)errorType
    error:(NSString*)error 
    resolver:(RCTPromiseResolveBlock)resolve 
    rejecter:(RCTPromiseRejectBlock)reject) {
    if (url == nil) {
        NSLog(@"Url cannot be null when logging a network request, ignoring.");
        resolve(@NO);
        return;
    }
    
    @try {
      NSURL *urlObj = [NSURL URLWithString:[NSString stringWithUTF8String:[url UTF8String]]];
          // Divide by 1000 because the startms method is returning milliseconds since the epoch, not seconds since the epoch
          NSDate *startTime = [NSDate dateWithTimeIntervalSince1970:startms.doubleValue/1000];
          NSDate *endTime = [NSDate dateWithTimeIntervalSince1970:endms.doubleValue/1000];
          NSError *errorObj = nil;
          if (error != nil) {
              NSString *errorStr = [NSString stringWithUTF8String:[error UTF8String]];
              errorObj = [NSError errorWithDomain:@"NativeInterface" code:0 userInfo:@{@"userinfo": errorStr, @"NSLocalizedDescriptionKey":errorType}];
          }

      EMBNetworkRequest *request = 
        [EMBNetworkRequest 
          networkRequestWithURL:urlObj 
          method:method 
          startTime:startTime 
          endTime:endTime 
          bytesIn:nil 
          bytesOut:nil 
          responseCode:nil 
          error:errorObj 
          traceId:nil];
      [[Embrace sharedInstance] logNetworkRequest:request];
      resolve(@YES);
    } @catch (NSException *exception) {
      resolve(@NO);
    }
   
}
@end
