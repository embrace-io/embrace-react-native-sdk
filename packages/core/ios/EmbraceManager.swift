import Foundation
import React
import OSLog
import EmbraceIO
import EmbraceCore
import EmbraceCrash
import EmbraceCommonInternal
import EmbraceOTelInternal
import OpenTelemetryApi
import EmbraceSemantics

private let JAVASCRIPT_PATCH_NUMBER_RESOURCE_KEY = "javascript_patch_number"
private let HOSTED_PLATFORM_VERSION_RESOURCE_KEY = "hosted_platform_version"
private let HOSTED_SDK_VERSION_RESOURCE_KEY = "hosted_sdk_version"
private let REACT_NATIVE_BUNDLE_ID_RESOURCE_KEY = "react_native_bundle_id"

// Keys defined in packages/spans/interfaces/ISpans.ts
private let EVENT_NAME_KEY = "name"
private let EVENT_TIMESTAMP_KEY = "timeStampMs"
private let EVENT_ATTRIBUTES_KEY = "attributes"

// Crash metadata
private let EMB_EXC = "emb-js"

@objc(EmbraceManager)
class EmbraceManager: NSObject {
    private var log = OSLog(subsystem: "Embrace", category: "ReactNativeEmbraceManager")
    private var spanRepository = SpanRepository()
    private var config: SDKConfig = SDKConfig(from: NSDictionary())

    @objc(setJavaScriptBundlePath:resolver:rejecter:)
    func setJavaScriptBundlePath(_ path: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.global(qos: .background).async {
            do {
                let bundleID = try computeBundleID(path: path)
                try Embrace.client?.metadata.addResource(key: REACT_NATIVE_BUNDLE_ID_RESOURCE_KEY, value: bundleID.id, lifespan: .process)
                resolve(true)
            } catch let error {
                reject("SET_JS_BUNDLE_PATH_ERROR", "Error setting JavaScript bundle path", error)
            }
        }
    }

    @objc
    func getDefaultJavaScriptBundlePath(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if  let filePath = Bundle.main.path(forResource: "main", ofType: "jsbundle") {
            resolve(filePath)
        } else {
            reject("error", "Unable to retrieve JS bundle path", nil)
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
    func startNativeEmbraceSDK(configDict: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        config = SDKConfig(from: configDict)

        DispatchQueue.main.async {
            do {
                try Embrace.setup(options: initEmbraceOptions(config: self.config, exporters: nil)).start()
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
        // Add function returns empty if it succeeds, so I specify true as return
        if (Embrace.client?.add(event: .breadcrumb(event))) != nil {
            resolve(true)
        } else {
            reject("ADD_BREADCRUMB", "Error adding breadcrumb", nil)
        }
    }

    // Should match strings defined in: packages/core/src/interfaces/Types.ts
    private func lastRunEndStateToString(endState: LastRunEndState) -> String {
        switch endState {
        case .crash:
            return "CRASH"
        case .cleanExit:
            return "CLEAN_EXIT"
        default:
            return "INVALID"
        }
    }

    @objc
    func getLastRunEndState(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if let endState = Embrace.client?.lastRunEndState() {
            resolve(lastRunEndStateToString(endState: endState))
        } else {
            reject("GET_LAST_RUN_END_STATE", "Error getting Last Run End State", nil)
        }
    }

    @objc(setReactNativeSDKVersion:resolver:rejecter:)
    func setReactNativeSDKVersion(_ version: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        do {
            try Embrace.client?.metadata.addResource(key: HOSTED_SDK_VERSION_RESOURCE_KEY, value: version, lifespan: .process)
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
            try Embrace.client?.metadata.addResource(key: JAVASCRIPT_PATCH_NUMBER_RESOURCE_KEY, value: patch, lifespan: .process)
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
        DispatchQueue.global(qos: .background).async {
            do {
                guard let url = CodePushHelper.getCodePushURL() else {
                    resolve(false)
                    return
                }

                let bundleID = try computeBundleID(path: url.path)
                try Embrace.client?.metadata.addResource(key: REACT_NATIVE_BUNDLE_ID_RESOURCE_KEY, value: bundleID.id, lifespan: .process)
                resolve(true)
            } catch let error {
                reject("CHECK_AND_SET_CODEPUSH_BUNDLE_URL", "Error setting Codepush Bundle URL", error)
            }
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
    func clearUserPersona(_ persona: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        do {
            try Embrace.client?.metadata.remove(persona: PersonaTag(persona), lifespan: .session)
            resolve(true)
        } catch let error {
            reject("CLEAR_USER_PERSONA", "Error removing User Persona", error)
        }
    }

    @objc(setReactNativeVersion:resolver:rejecter:)
    func setReactNativeVersion(_ version: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        do {
            try Embrace.client?.metadata.addResource(key: HOSTED_PLATFORM_VERSION_RESOURCE_KEY, value: version, lifespan: .process)
            resolve(true)
        } catch let error {
            reject("SET_RECT_NATIVE_VERSION", "Error setting React Native Number", error)
        }
    }

    @objc(removeSessionProperty:resolver:rejecter:)
    func removeSessionProperty(_ key: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        do {
            // Depending on on how `addSessionProperty` was called we may have added this key as either
            // .session or .permanent so remove both here, multiple calls to remove are safe
            try Embrace.client?.metadata.removeProperty(key: key, lifespan: .permanent)
            try Embrace.client?.metadata.removeProperty(key: key, lifespan: .session)

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
            let lifespan: MetadataLifespan = permanent ? .permanent : .session
            try Embrace.client?.metadata.addProperty(key: key, value: value, lifespan: lifespan)
            resolve(true)
        } catch let error {
            reject("ADD_SESSION_PROPERTY", "Error adding Session Property", error)
        }
    }

    @objc(logMessageWithSeverityAndProperties:severity:properties:stacktrace:includeStacktrace:resolver:rejecter:)
    func logMessageWithSeverityAndProperties(
        _ message: String,
        severity: String,
        properties: NSDictionary,
        stacktrace: String,
        includeStacktrace: Bool,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {

        let severityValue = self.severityFromString(from: severity)
        guard var attributes = properties as? [String: String] else {
            reject("LOG_MESSAGE_INVALID_PROPERTIES", "Properties should be [String: String]", nil)
            return
        }

        let isInfoLog = severityValue == .info

        var stackTraceBehavior: StackTraceBehavior = StackTraceBehavior.notIncluded
        if includeStacktrace == true {
            if stacktrace.isEmpty {
                stackTraceBehavior = StackTraceBehavior.default // will include the iOS Stacktrace if no JS is passed
            } else {
                // we don't want to send info stacktraces to sdk for 'info' logs, this is already prevented in the js layer as well
                if !isInfoLog {
                    attributes.updateValue(stacktrace, forKey: "emb.stacktrace.rn")
                }
            }
        }

        Embrace.client?.log(
            message,
            severity: severityValue,
            attributes: attributes,
            stackTraceBehavior: stackTraceBehavior
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
            try Embrace.client?.metadata.remove(persona: "payer", lifespan: .session)
            resolve(true)
        } catch let error {
            reject("CLEAR_USER_PAYER", "Error removing User Payer", error)
        }
    }

    @objc(startView:resolver:rejecter:)
    func startView(_ viewName: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {

        let span = Embrace.client?.buildSpan(name: "emb-screen-view")
        .setAttribute(key: "view.name", value: viewName)
        .setAttribute(key: "emb.type", value: "ux.view")
        .startSpan()

        var spanId = ""
        if span != nil {
        spanId = spanRepository.spanStarted(span: span!)
        }

        if spanId.isEmpty {
        reject("START_SPAN_ERROR", "Failed to start span", nil)
        } else {
        resolve(spanId)
        }
    }

  @objc(endView:resolver:rejecter:)
  func endView(_ spanId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {

    stopSpan(spanId, errorCodeString: "", endTimeMs: 0.0, resolver: resolve, rejecter: reject)
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

    @objc(logNetworkRequest:httpMethod:startInMillis:endInMillis:bytesSent:bytesReceived:statusCode:resolver:rejecter:)
    func logNetworkRequest(
        _ url: String,
        httpMethod: String,
        startInMillis: Double,
        endInMillis: Double,
        bytesSent: Double,
        bytesReceived: Double,
        statusCode: Double,
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        if Embrace.client == nil {
            reject("RECORD_LOG_NETWORK_REQUEST_ERROR", "Error recording a network request, Embrace SDK may not be initialized", nil)
            return
        }

        var attributes = [
            "http.request.method": httpMethod.uppercased(),
            "url.full": url
        ]

        if statusCode >= 0 {
            attributes["http.response.status_code"] = String(Int(statusCode))
        }

        if bytesSent >= 0 {
            attributes["http.request.body.size"] = String(Int(bytesSent))
        }

        if bytesReceived >= 0 {
            attributes["http.response.body.size"] = String(Int(bytesReceived))
        }

        let span = Embrace.client?
            .buildSpan(name: createNetworkSpanName(url: url, httpMethod: httpMethod),
                       type: SpanType.networkRequest,
                       attributes: attributes)
            .setStartTime(time: dateFrom(ms: startInMillis))
            .startSpan()

        if span != nil {
            // injecting the w3c traceparent only if NSF is enabled
            if !self.config.disableNetworkSpanForwarding {
                injectW3cTraceparent(span: span!)
            }

            span!.end(errorCode: nil, time: dateFrom(ms: endInMillis))
            resolve(true)
        } else {
            resolve(false)
        }
    }

    @objc(logNetworkClientError:httpMethod:startInMillis:endInMillis:errorType:errorMessage:resolver:rejecter:)
    func logNetworkClientError(
        _ url: String,
        httpMethod: String,
        startInMillis: Double,
        endInMillis: Double,
        errorType: String,
        errorMessage: String,
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        if Embrace.client == nil {
            reject("RECORD_LOG_NETWORK_CLIENT_ERROR_ERROR", "Error recording a network client error, Embrace SDK may not be initialized", nil)
            return
        }

        let attributes = attributeStringsFrom(dict: [
            "http.request.method": httpMethod.uppercased(),
            "url.full": url,
            "error.message": errorMessage,
            "error.type": errorType,

            // NOTE: this should be handled by iOS native sdk using `errorCode` value
            // To remove from here when it's done.
            "emb.error_code": "failure"
        ])

        let span = Embrace.client?
            .buildSpan(name: createNetworkSpanName(url: url, httpMethod: httpMethod),
                       type: SpanType.networkRequest,
                       attributes: attributes)
            .setStartTime(time: dateFrom(ms: startInMillis))
            .startSpan()

        if span != nil {
            // injecting the w3c traceparent only if NSF is enabled
            if !config.disableNetworkSpanForwarding {
                injectW3cTraceparent(span: span!)
            }

            // `errorCode` should be used to calc `emb.error_code` attr in native sdk
            span!.end(errorCode: SpanErrorCode.failure, time: dateFrom(ms: endInMillis))
            resolve(true)
        } else {
            resolve(false)
        }
    }

    private func dateFrom(ms: Double) -> Date {
        return Date(timeIntervalSince1970: TimeInterval(ms / 1000.0))
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

    private func createNetworkSpanName(url: String, httpMethod: String) -> String {
        var name = "emb-" + httpMethod.uppercased()

        if let fullUrl = URL(string: url) {
            let path = fullUrl.path
            if !path.isEmpty && path != "/" {
                name += " " + path
            }
        }

        return name
    }

    @objc(logHandledError:stacktrace:properties:resolver:rejecter:)
    func logHandledError(
        _ message: String,
        stacktrace: String,
        properties: NSDictionary,
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        if Embrace.client == nil {
            reject("LOG_HANDLED_ERROR_ERROR", "Error recording a log handled error, Embrace SDK may not be initialized", nil)
            return
        }

        guard var attributes = properties as? [String: String] else {
            reject("LOG_MESSAGE_INVALID_PROPERTIES", "Properties should be [String: String]", nil)
            return
        }

        // injecting stacktrace as attribute
        attributes.updateValue(stacktrace, forKey: "emb.stacktrace.rn")
        // not added by native sdk
        attributes.updateValue("handled", forKey: "emb.exception_handling")

        Embrace.client?.log(
            message,
            severity: LogSeverity.error,
            type: LogType.message,
            attributes: attributes,
            // will always include a js stacktrace as per implementation
            stackTraceBehavior: StackTraceBehavior.notIncluded
        )

        resolve(true)
    }

    @objc(logUnhandledJSException:message:type:stacktrace:resolver:rejecter:)
    func logUnhandledJSException(
        _ name: String,
        message: String,
        type: String,
        stacktrace: String,
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        if Embrace.client == nil {
            reject("LOG_UNHANDLED_JS_EXCEPTION_ERROR", "Error recording a unhandled js exception, Embrace SDK may not be initialized", nil)
            return
        }

        // injecting custom ID for js exception
        let jsExceptionUUID = UUID().uuidString

        let attributes: [String: String] = [
            "emb.type": "sys.ios.react_native_crash",
            "emb.ios.react_native_crash.js_exception": stacktrace,

            "exception.message": message,
            "exception.type": type,
            "exception.id": jsExceptionUUID
        ]

        Embrace.client?.log(
            name,
            severity: LogSeverity.error,
            type: LogType.message,
            attributes: attributes,
            // will always include a js stacktrace as per implementation
            stackTraceBehavior: StackTraceBehavior.notIncluded
        )

        do {
            // adding crash metadata
            try Embrace.client?.appendCrashInfo(key: EMB_EXC, value: jsExceptionUUID)
        } catch let error {
            reject("LOG_UNHANDLED_JS_EXCEPTION_ERROR", "Error adding metadata to Crash", error)
        }

        resolve(true)
    }

    func injectW3cTraceparent(span: any Span) {
        span.setAttribute(key: "emb.w3c_traceparent", value: EmbraceCore.W3C.traceparent(from: span.context))
    }
}
