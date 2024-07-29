import Foundation
import EmbraceIO
import EmbraceCore
import EmbraceCrash
import EmbraceCommonInternal

#if canImport(CodePush)
import CodePush
#endif

enum EmbraceKeys: String {
  case reactNativeVersion = "io.embrace.reactnative.version"
  case embraceReactNativeSdkVersion = "io.embrace.reactnative.sdk.version"
  case javaScriptPatchNumber = "io.embrace.javascript.patch"
  case javaScriptBundleURL = "io.embrace.jsbundle.url"
}

@objc(EmbraceManager)
class EmbraceManager: NSObject {
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
  func getLastRunEndState(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if let endState = Embrace.client?.lastRunEndState(){
      resolve(endState)
    } else {
      reject("GET_LAST_RUN_END_STATE", "Error getting Last Run End State", nil)
    }
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
  
  @objc(addUserPersona:resolver:rejecter:)
  func addUserPersona(_ persona: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      try Embrace.client?.metadata.add(persona: persona, lifespan: .session)
      resolve(true)
    } catch let error {
      reject("ADD_USER_PERSONA", "Error adding User Persona", error)
    }
  }
  
  @objc
  func clearAllUserPersonas(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      try Embrace.client?.metadata.removeAllPersonas()
      resolve(true)
    } catch let error {
      reject("CLEAR_ALL_USER_PERSONAS", "Error clearing all User Personas", error)
    }
  }
  
  @objc(setReactNativeVersion:resolver:rejecter:)
  func setReactNativeVersion(_ version: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      try Embrace.client?.metadata.addResource(key: EmbraceKeys.reactNativeVersion.rawValue, value: version)
      resolve(true)
    } catch let error {
      reject("SET_RECT_NATIVE_VERSION", "Error setting React Native Number", error)
    }
  }
  
  @objc(removeSessionProperty:resolver:rejecter:)
  func removeSessionProperty(_ key: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      // TODO REfactor to include lifespan
      try Embrace.client?.metadata.removeProperty(key: key)
      resolve(true)
    } catch let error {
      reject("REMOVE_SESSION_PROPERTY", "Error removing Session Property", error)
    }
  }
  

  @objc(setUserEmail:resolver:rejecter:)
  func setUserEmail(_ userEmail: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Embrace.client?.metadata.userEmail = userEmail
    resolve(true)
  }
  
  @objc(setUserEmail:value:resolver:rejecter:)
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
  
  @objc(clearUserPersona:resolver:rejecter:)
  func clearUserPersona(_ persona:String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      try Embrace.client?.metadata.remove(persona: persona, lifespan: .session)
      resolve(true)
    }catch let error {
      reject("CLEAR_USER_PERSONA", "Error removing User Persona", error)
    }
  }
  
  @objc(clearUserPersona:severity:properties:resolver:rejecter:)
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
}
