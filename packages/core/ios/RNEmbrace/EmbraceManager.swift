import Foundation
import React
import EmbraceIO
import EmbraceCrash
import EmbraceCommonInternal // TODO should not be needed
import EmbraceOTelInternal // TODO should not be needed

#if canImport(CodePush)
import CodePush
#endif

enum EmbraceKeys: String {
  case reactNativeVersion = "io.embrace.reactnative.version"
  case embraceReactNativeSdkVersion = "io.embrace.reactnative.sdk.version"
  case javaScriptPatchNumber = "io.embrace.javascript.patch"
  case javaScriptBundleURL = "io.embrace.jsbundle.url"
}


// Keys defined in packages/spans/interfaces/ISpans.ts
private let EVENT_NAME_KEY = "name";
private let EVENT_TIMESTAMP_KEY = "timeStampMs";
private let EVENT_ATTRIBUTES_KEY = "attributes";

@objc(EmbraceManager)
class EmbraceManager: NSObject {
  private var spanRepository = SpanRepository()

  @objc
  func setJavaScriptBundlePath(_ path: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      try Embrace.client?.metadata.addResource(key: EmbraceKeys.javaScriptBundleURL.rawValue, value: path)
      resolve(true)
    }  catch let error {
      reject("SET_JS_BUNDLE_PATH_ERROR", "Error setting JavaScript bundle path", error)
    }
  }
  
  @objc
  func isStarted(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if let embraceStarted = Embrace.client?.started {
      resolve(embraceStarted)
    } else {
      resolve(false)
    }
  }
  
@objc(startNativeEmbraceSDK:resolver:rejecter:)
  func startNativeEmbraceSDK(_ appId: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
        do {
          
          var embraceOptions: Embrace.Options {
            return .init(
                appId: appId,
                appGroupId: nil,
                platform: .reactNative,
                captureServices: .automatic,
                crashReporter: EmbraceCrashReporter()
            )
          }
          
          try Embrace.setup(options: embraceOptions)
            .start()
          
          resolve(true)
        } catch let error {
          reject("START_EMBRACE_SDK", "Error starting Embrace SDK", error)
        }
    }
  }
  
  @objc
  func getDeviceId(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if let deviceId = Embrace.client?.currentDeviceId() {
      resolve(deviceId)
    } else {
      reject("GET_DEVICE_ID", "Error getting deviceId", nil)
    }
  }
  
  @objc
  func setUserIdentifier(_ userIdentifier: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Embrace.client?.metadata.userIdentifier = userIdentifier
    resolve(true)
  }
  
  
  @objc
  func getCurrentSessionId(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if let sessionId = Embrace.client?.currentSessionId() {
      resolve(sessionId)
    } else {
      reject("GET_SESSION_ID", "Error getting sessionId", nil)
    }
  }
  
  @objc
  func addBreadcrumb(_ event: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    //TODO Refactor SPAN
    //      do {
    //        try Embrace.client?.add(event: event)
    //          resolve(true)
    //      } catch {
    //          reject(false)
    //      }
  }
  
  @objc
  func setReactNativeSDKVersion(_ version: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      try Embrace.client?.metadata.addResource(key: EmbraceKeys.embraceReactNativeSdkVersion.rawValue, value: version)
      resolve(true)
    } catch let error {
      reject("SET_RN_SDK_VERSION", "Error setting ReactNative SDK version", error)
    }
  }
  
  
  @objc
  func setUserName(_ userName: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Embrace.client?.metadata.userName = userName
    resolve(true)
  }
  
  @objc
  func clearUserEmail(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Embrace.client?.metadata.userEmail = nil
    resolve(true)
  }
  
  @objc
  func setJavaScriptPatchNumber(_ patch: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      try Embrace.client?.metadata.addResource(key: EmbraceKeys.javaScriptPatchNumber.rawValue, value: patch)
      resolve(true)
    } catch let error {
      reject("SET_JAVASCRIPT_PATCH_NUMBER", "Error setting JavasScript Patch Number", error)
    }
  }
  
  @objc
  func clearUserIdentifier(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Embrace.client?.metadata.userIdentifier = nil
    resolve(true)
  }
  
  @objc
  func clearUsername(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Embrace.client?.metadata.userName = nil
    resolve(true)
  }
  
  
  @objc
  func endSession(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Embrace.client?.endCurrentSession()
    resolve(true)
  }
  
  @objc
  func checkAndSetCodePushBundleURL(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
#if canImport(CodePush)
      guard let url = try CodePush.bundleURL() else {
        reject("GET_CODEPUSH_BUNDLE_URL", "Error getting Codepush Bundle URL", nil)
        return
      }
      
      try Embrace.client?.metadata.addResource(key: EmbraceKeys.javaScriptBundleURL.rawValue, value: url.path)
      resolve(true)
      
#else
      resolve(false)
#endif
    } catch let error {
      reject("CHECK_AND_SET_CODEPUSH_BUNDLE_URL", "Error setting Codepush Bundle URL", error)
    }
  }
  
  @objc
  func clearAllUserPersonas(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    // This is pending to implement from ios
    //    do {
    //      try Embrace.client?.metadata.removeAllPersonaTags()
    //      resolve(true)
    //    } catch let error {
    //    reject("CLEAR_ALL_USER_PERSOMAS", "Error clearing all UserPersonas", error)
    //  }
  }
  
  @objc
  func setReactNativeVersion(_ version: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      try Embrace.client?.metadata.addResource(key: EmbraceKeys.reactNativeVersion.rawValue, value: version)
      resolve(true)
    } catch let error {
      reject("SET_RECT_NATIVE_VERSION", "Error setting React Native Number", error)
    }
  }
  
  @objc
  func removeSessionProperty(_ key: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      // TODO REfactor to include lifespan
      try Embrace.client?.metadata.removeProperty(key: key)
      resolve(true)
    } catch let error {
      reject("REMOVE_SESSION_PROPERTY", "Error removing Session Property", error)
    }
  }
  
  @objc
  func setUserEmail(_ userEmail: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Embrace.client?.metadata.userEmail = userEmail
    resolve(true)
  }
  
  @objc
  func addSessionProperty(
    _ key: String,
    value: String,
    permanent: Bool,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
      let lifespan:MetadataLifespan = permanent ? .permanent : .session
      try Embrace.client?.metadata.addProperty(key:key, value:value, lifespan:lifespan)
      resolve(true)
    } catch let error {
      reject("ADD_SESSION_PROPERTY", "Error adding Session Property", error)
    }
  }
  
  @objc
  func clearUserPersona(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    // This is pending to implement from ios
    //    do {
    //      try Embrace.client?.metadata.removePersonaTag()
    //      resolve(true)
    //    } catch {
    //      reject(false)
    //    }
  }
  
  @objc
  func logMessageWithSeverityAndProperties(
    _ message: String,
    severity: String,
    properties: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    
    let severityValue = self.severityFromString(from:severity)
    guard let attributes = properties as? [String: String] else {
      reject("LOG_MESSAGE_INVALID_PROPERTIES", "Properties should be [String: String]", nil)
      return
    }
    Embrace.client?.log(
      message,
      severity: severityValue,
      attributes: attributes
    )
    resolve(true)
    
  }
  
  private func severityFromString(from inputString: String) -> LogSeverity {
    switch inputString {
    case "info":
      return .info
    case "warning":
      return .warn
    default:
      return .error
    }
  }
    
    /*
     * Spans API
     */
    
    private func dateFrom(ms: Double) -> Date {
        return Date(timeIntervalSince1970: TimeInterval(ms / 1000.0))
    }
    
    private func attributeValuesFrom(dict: NSDictionary) -> [String : AttributeValue] {
        var attributes = [String : AttributeValue]()
        
        for (key, value) in dict {
            if let key = key as? String, let value = value as? String {
                attributes.updateValue(AttributeValue(value), forKey: key)
            }
        }
        
        return attributes
    }
    
    private func attributeStringsFrom(dict: NSDictionary) -> [String : String] {
        var attributes = [String : String]()
        
        for (key, value) in dict {
            if let key = key as? String, let value = value as? String {
                attributes.updateValue(value, forKey: key)
            }
        }
        
        return attributes
    }
    
    private func spanErrorCodeFrom(str: String) -> SpanErrorCode? {
        switch str {
        case "Failure":
            return .failure
        case "UserAbandon":
            return .userAbandon
        case "Unknown":
            return .unknown
        default:
            return nil
        }
    }
    
    private func errorCodeFrom(str: String) -> ErrorCode? {
        switch str {
        case "Failure":
            return .failure
        case "UserAbandon":
            return .userAbandon
        case "Unknown":
            return .unknown
        default:
            return nil
        }
    }
    
    private func eventsFrom(array: NSArray) -> [RecordingSpanEvent] {
        var events = [RecordingSpanEvent]()
        
        for evt in array {
            if let evt = evt as? NSDictionary {
                let name = evt.value(forKey: EVENT_NAME_KEY) as? String
                let timeStampMs = evt.value(forKey: EVENT_TIMESTAMP_KEY) as? Double
                let attributes = evt.value(forKey: EVENT_ATTRIBUTES_KEY) as? NSDictionary
                
                if name == nil || timeStampMs == nil {
                    continue
                }
                
                if attributes == nil {
                    events.append(RecordingSpanEvent(name: name!, timestamp: dateFrom(ms: timeStampMs!)))
                } else {
                    events.append(RecordingSpanEvent(name: name!, timestamp: dateFrom(ms: timeStampMs!), attributes: attributeValuesFrom(dict:attributes!)))
                }
            }
        }
        
        return events
    }
    
    @objc
    func startSpan(
        _ name: String,
        parentSpanId: String,
        startTimeMS: NSNumber,
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        let spanBuilder = Embrace.client?.buildSpan(name: name)
        
        if spanBuilder == nil {
            reject("START_SPAN_ERROR", "Error starting span, Embrace SDK may not be initialized", nil)
            return
        }
        
        if !parentSpanId.isEmpty, let parent = spanRepository.get(spanId: parentSpanId) {
            spanBuilder?.setParent(parent)
        } else {
            spanBuilder?.setNoParent()
        }
        
        if !startTimeMS.doubleValue.isZero {
            spanBuilder?.setStartTime(time: dateFrom(ms:startTimeMS.doubleValue))
        }
        
        let span = spanBuilder?.startSpan()
        
        if span != nil {
            spanRepository.spanStarted(span:span!)
            resolve(span?.context.spanId.hexString)
        } else {
            reject("START_SPAN_ERROR", "Error starting span", nil)
        }
    }
    
    @objc
    func stopSpan(
        _ spanId: String,
        errorCodeString: String,
        endTimeMS: NSNumber,
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        let span = spanRepository.get(spanId: spanId)
        
        if span == nil {
            reject("STOP_SPAN_ERROR", "Could not retrieve a span with the given id", nil)
            return
        }
        
        let errorCode = spanErrorCodeFrom(str: errorCodeString)
        
        if endTimeMS.doubleValue.isZero {
            span?.end(errorCode: errorCode)
        } else {
            span?.end(errorCode: errorCode, time: dateFrom(ms: endTimeMS.doubleValue))
        }
        
        spanRepository.spanEnded(span:span!)
        
        resolve(true)
    }
    
    @objc
    func addSpanEventToSpan(
        _ spanId: String,
        name: String,
        time: Double,
        attributes: NSDictionary,
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        let span = spanRepository.get(spanId: spanId)
        
        if span == nil {
            reject("ADD_SPAN_EVENT_TO_SPAN_ERROR", "Could not retrieve a span with the given id", nil)
            return
        }
        
        if attributes.count == 0 {
            span?.addEvent(name: name, timestamp: dateFrom(ms: time))
        } else {
            span?.addEvent(name: name, attributes: attributeValuesFrom(dict: attributes), timestamp: dateFrom(ms: time))
        }
        
        resolve(true)
    }
    
    @objc
    func addSpanAttributeToSpan(
        _ spanId: String,
        key: String,
        value: String,
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        let span = spanRepository.get(spanId: spanId)
        
        if span == nil {
            reject("ADD_SPAN_ATTRIBUTE_TO_SPAN_ERROR", "Could not retrieve a span with the given id", nil)
            return
        }
        
        span?.setAttribute(key: key, value: value)
        
        resolve(true)
    }
    
    @objc
    func recordCompletedSpan(
        _ name: String,
        startTimeMS: Double,
        endTimeMS: Double,
        errorCodeString: String,
        parentSpanId: String,
        attributes: NSDictionary,
        events: NSArray,
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        var parent: Span? = nil
        if !parentSpanId.isEmpty {
            parent = spanRepository.get(spanId: parentSpanId)
        }
        
        if Embrace.client == nil {
            reject("RECORD_COMPLETED_SPAN_ERROR", "Error recording span, Embrace SDK may not be initialized", nil)
            return
        }
        
        Embrace.client?.recordCompletedSpan(name: name, type: SpanType.performance, parent: parent,
                                            startTime: dateFrom(ms: startTimeMS), endTime: dateFrom(ms: endTimeMS),
                                            attributes: attributeStringsFrom(dict: attributes),
                                            events: eventsFrom(array: events),
                                            errorCode: errorCodeFrom(str: errorCodeString))
        
        resolve(true);
    }
    
}
