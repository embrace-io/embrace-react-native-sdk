import Foundation
import React
import OSLog
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
private let EVENT_NAME_KEY = "name"
private let EVENT_TIMESTAMP_KEY = "timeStampMs"
private let EVENT_ATTRIBUTES_KEY = "attributes"

@objc(EmbraceManager)
class EmbraceManager: NSObject {
    private var log = OSLog(subsystem: "Embrace", category: "ReactNativeEmbraceManager")
    private var spanRepository = SpanRepository()

    @objc(setJavaScriptBundlePath:resolver:rejecter:)
    func setJavaScriptBundlePath(_ path: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        do {
            try Embrace.client?.metadata.addResource(key: EmbraceKeys.javaScriptBundleURL.rawValue, value: path, lifespan: .process)
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
    
    @objc(setUserIdentifier:resolver:rejecter:)
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
    
    @objc(addBreadcrumb:resolver:rejecter:)
    func addBreadcrumb(_ event: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Add function returns empty if it sucess, so I specify true as return
        if ((Embrace.client?.add(event: .breadcrumb(event))) != nil){
            resolve(true)
        } else {
            reject("ADD_BREADCRUMB", "Error adding breadcrumb", nil)
        }
    }
    
    @objc
    func getLastRunEndState(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if let endState = Embrace.client?.lastRunEndState(){
            resolve(endState)
        } else {
            reject("GET_LAST_RUN_END_STATE", "Error getting Last Run End State", nil)
        }
    }
    
    @objc(setReactNativeSDKVersion:resolver:rejecter:)
    func setReactNativeSDKVersion(_ version: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        do {
            try Embrace.client?.metadata.addResource(key: EmbraceKeys.embraceReactNativeSdkVersion.rawValue, value: version, lifespan: .process)
            resolve(true)
        } catch let error {
            reject("SET_RN_SDK_VERSION", "Error setting ReactNative SDK version", error)
        }
    }
    
    
    @objc(setUsername:resolver:rejecter:)
    func setUsername(_ userName: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        Embrace.client?.metadata.userName = userName
        resolve(true)
    }
    
    @objc
    func clearUserEmail(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        Embrace.client?.metadata.userEmail = nil
        resolve(true)
    }
    
    @objc(setJavaScriptPatchNumber:resolver:rejecter:)
    func setJavaScriptPatchNumber(_ patch: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        do {
            try Embrace.client?.metadata.addResource(key: EmbraceKeys.javaScriptPatchNumber.rawValue, value: patch, lifespan: .process)
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
            
            try Embrace.client?.metadata.addResource(key: EmbraceKeys.javaScriptBundleURL.rawValue, value: url.path, .process)
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

    @objc(clearUserPersona:resolver:rejecter:)
    func clearUserPersona(_ persona:String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        do {
            try Embrace.client?.metadata.remove(persona: PersonaTag(persona), lifespan: .session)
            resolve(true)
        }catch let error {
            reject("CLEAR_USER_PERSONA", "Error removing User Persona", error)
        }
    }
    
    @objc(setReactNativeVersion:resolver:rejecter:)
    func setReactNativeVersion(_ version: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        do {
            try Embrace.client?.metadata.addResource(key: EmbraceKeys.reactNativeVersion.rawValue, value: version, lifespan: .process)
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
    
    @objc(addSessionProperty:value:permanent:resolver:rejecter:)
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
    
    @objc(logMessageWithSeverityAndProperties:severity:properties:resolver:rejecter:)
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

    @objc
    func setUserAsPayer(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        do {
            try Embrace.client?.metadata.add(persona: "payer")
            resolve(true)
        } catch let error {
            reject("SET_USER_PAYER", "Error adding User Payer", error)
        }
    }
        
    @objc
    func clearUserAsPayer(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        do {
            try Embrace.client?.metadata.remove(persona: "payer", lifespan:.session)
            resolve(true)
        }catch let error {
            reject("CLEAR_USER_PAYER", "Error removing User Payer", error)
        }
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

    private func attributeValuesFrom(dict: NSDictionary) -> [String: AttributeValue] {
        var attributes = [String: AttributeValue]()

        for (key, value) in dict {
            if let key = key as? String, let value = value as? String {
                attributes.updateValue(AttributeValue(value), forKey: key)
            } else {
                os_log("unexpected non-string attribute for span", log: log, type: .error)
            }
        }

        return attributes
    }

    private func attributeStringsFrom(dict: NSDictionary) -> [String: String] {
        var attributes = [String: String]()

        for (key, value) in dict {
            if let key = key as? String, let value = value as? String {
                attributes.updateValue(value, forKey: key)
            } else {
                os_log("unexpected non-string attribute for span", log: log, type: .error)
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

                if name == nil {
                    os_log("missing name for event", log: log, type: .error)
                    continue
                }

                if timeStampMs == nil {
                    os_log("missing timestamp for event: %@", log: log, type: .error, name!)
                    continue
                }

                if attributes == nil {
                    events.append(RecordingSpanEvent(name: name!, timestamp: dateFrom(ms: timeStampMs!)))
                } else {
                    events.append(RecordingSpanEvent(name: name!, timestamp: dateFrom(ms: timeStampMs!),
                                                     attributes: attributeValuesFrom(dict: attributes!)))
                }
            }
        }

        return events
    }

    @objc(startSpan:parentSpanId:startTimeMs:resolver:rejecter:)
    func startSpan(
        _ name: String,
        parentSpanId: String,
        startTimeMs: NSNumber,
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
            // TODO, do we also need to do this in the case that there's parent?
            spanBuilder?.markAsKeySpan()
        }

        if !startTimeMs.doubleValue.isZero {
            spanBuilder?.setStartTime(time: dateFrom(ms: startTimeMs.doubleValue))
        }

        let span = spanBuilder?.startSpan()

        var id = ""
        if span != nil {
            id = spanRepository.spanStarted(span: span!)
        }

        if id.isEmpty {
            reject("START_SPAN_ERROR", "Error starting span", nil)
        } else {
            resolve(id)
        }
    }

    @objc(stopSpan:errorCodeString:endTimeMs:resolver:rejecter:)
    func stopSpan(
        _ spanId: String,
        errorCodeString: String,
        endTimeMs: NSNumber,
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        let span = spanRepository.get(spanId: spanId)

        if span == nil {
            reject("STOP_SPAN_ERROR", "Could not retrieve a span with the given id", nil)
            return
        }

        let errorCode = spanErrorCodeFrom(str: errorCodeString)

        if endTimeMs.doubleValue.isZero {
            span?.end(errorCode: errorCode)
        } else {
            span?.end(errorCode: errorCode, time: dateFrom(ms: endTimeMs.doubleValue))
        }

        spanRepository.spanEnded(span: span!)

        resolve(true)
    }

    @objc(addSpanEventToSpan:name:time:attributes:resolver:rejecter:)
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

    @objc(addSpanAttributeToSpan:key:value:resolver:rejecter:)
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

    @objc(recordCompletedSpan:startTimeMs:endTimeMs:errorCodeString:parentSpanId:attributes:events:resolver:rejecter:)
    func recordCompletedSpan(
        _ name: String,
        startTimeMs: Double,
        endTimeMs: Double,
        errorCodeString: String,
        parentSpanId: String,
        attributes: NSDictionary,
        events: NSArray,
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        var parent: Span?
        if !parentSpanId.isEmpty {
            parent = spanRepository.get(spanId: parentSpanId)
        }

        if Embrace.client == nil {
            reject("RECORD_COMPLETED_SPAN_ERROR", "Error recording span, Embrace SDK may not be initialized", nil)
            return
        }

        var attributeStrings = attributeStringsFrom(dict: attributes)
        attributeStrings.updateValue("true", forKey: "emb.key")
        Embrace.client?.recordCompletedSpan(name: name, type: SpanType.performance, parent: parent,
                                            startTime: dateFrom(ms: startTimeMs), endTime: dateFrom(ms: endTimeMs),
                                            attributes: attributeStrings,
                                            events: eventsFrom(array: events),
                                            errorCode: errorCodeFrom(str: errorCodeString))

        resolve(true)
    }
}
