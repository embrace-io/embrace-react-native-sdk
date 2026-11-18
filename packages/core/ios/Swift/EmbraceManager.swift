import Foundation
import React
import OSLog
import EmbraceIO
// CocoaPods merges every embrace-apple-sdk subspec into a single EmbraceIO module,
// whereas SPM keeps them as separate modules that have to be imported on their own.
#if EMBRACE_USE_SPM
import EmbraceCaptureService
#endif

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

@objc(EmbraceManagerImpl)
public class EmbraceManager: NSObject {
    private var log = OSLog(subsystem: "Embrace", category: "ReactNativeEmbraceManager")
    var isSDKStarted: () -> Bool = { EmbraceIO.shared.state == .started }
    var addResources: ([String: String]) -> Void = { EmbraceIO.shared.addResources($0) }
    var defaultBundlePath: () -> String? = { Bundle.main.path(forResource: "main", ofType: "jsbundle") }
    var bundleIDQueue: DispatchQueue = .global(qos: .utility)

    @objc(initializeReactNativeSDK:)
    public func initializeReactNativeSDK(_ config: NSDictionary) -> Bool {
        guard isSDKStarted() else {
            return false
        }

        addResource(HOSTED_PLATFORM_VERSION_RESOURCE_KEY, config["reactNativeVersion"])
        addResource(HOSTED_SDK_VERSION_RESOURCE_KEY, config["sdkVersion"])
        addResource(JAVASCRIPT_PATCH_NUMBER_RESOURCE_KEY, config["javaScriptPatchNumber"])

        if config["resolveDefaultBundlePath"] as? Bool == true {
            resolveAndSetDefaultBundleID()
        }

        return true
    }

    private func addResource(_ key: String, _ value: Any?) {
        guard let value = value as? String else {
            return
        }

        addResources([key: value])
    }

    private var captureService: ReactNativeCaptureService {
        let service = ReactNativeCaptureService.shared
        if service.isUninstalled {
            EmbraceIO.shared.add(captureService: service)
        }
        return service
    }

    private func resolveAndSetDefaultBundleID() {
        guard let path = defaultBundlePath() else {
            os_log("Unable to find the default JS bundle, call setJavaScriptBundlePath to enable crash symbolication",
                   log: log, type: .error)
            return
        }

        bundleIDQueue.async {
            do {
                let bundleID = try computeBundleID(path: path)
                self.addResource(REACT_NATIVE_BUNDLE_ID_RESOURCE_KEY, bundleID.id)
            } catch let error {
                os_log("Error computing the default JS bundle ID: %{public}@", log: self.log, type: .error, error.localizedDescription)
            }
        }
    }

    @objc(setJavaScriptBundlePath:resolver:rejecter:)
    public func setJavaScriptBundlePath(_ path: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.global(qos: .background).async {
            do {
                let bundleID = try computeBundleID(path: path)
                self.addResources([REACT_NATIVE_BUNDLE_ID_RESOURCE_KEY: bundleID.id])
                resolve(true)
            } catch let error {
                reject("SET_JS_BUNDLE_PATH_ERROR", "Error setting JavaScript bundle path", error)
            }
        }
    }

    @objc
    public func getDeviceId(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if let deviceId = EmbraceIO.shared.deviceId {
            resolve(deviceId)
        } else {
            reject("GET_DEVICE_ID", "Error getting deviceId", nil)
        }
    }

    @objc(setUserIdentifier:resolver:rejecter:)
    public func setUserIdentifier(_ userIdentifier: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard isSDKStarted() else {
            reject("SET_USER_IDENTIFIER_ERROR", "Embrace SDK may not be initialized", nil)
            return
        }
        EmbraceIO.shared.userIdentifier = userIdentifier
        resolve(true)
    }

    @objc
    public func getCurrentSessionId(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if let sessionId = EmbraceIO.shared.currentUserSessionId {
            resolve(sessionId)
        } else {
            reject("GET_SESSION_ID", "Error getting sessionId", nil)
        }
    }

    @objc(addBreadcrumb:resolver:rejecter:)
    public func addBreadcrumb(_ event: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard isSDKStarted() else {
            reject("ADD_BREADCRUMB", "Error adding breadcrumb", nil)
            return
        }
        EmbraceIO.shared.addBreadcrumb(event)
        resolve(true)
    }

    // Should match strings defined in: packages/core/src/interfaces/Types.ts
    private func lastRunEndStateToString(endState: EmbraceLastRunEndState) -> String {
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
    public func getLastRunEndState(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard isSDKStarted() else {
            reject("GET_LAST_RUN_END_STATE", "Error getting Last Run End State", nil)
            return
        }
        resolve(lastRunEndStateToString(endState: EmbraceIO.shared.lastRunEndState()))
    }

    @objc(setUsername:resolver:rejecter:)
    public func setUsername(_ userName: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        logUnsupportedUserField("setUsername")
        resolve(false)
    }

    @objc
    public func clearUserEmail(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        logUnsupportedUserField("clearUserEmail")
        resolve(false)
    }

    @objc(setJavaScriptPatchNumber:resolver:rejecter:)
    public func setJavaScriptPatchNumber(_ patch: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        addResources([JAVASCRIPT_PATCH_NUMBER_RESOURCE_KEY: patch])
        resolve(true)
    }

    @objc
    public func clearUserIdentifier(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard isSDKStarted() else {
            reject("CLEAR_USER_IDENTIFIER_ERROR", "Embrace SDK may not be initialized", nil)
            return
        }
        EmbraceIO.shared.userIdentifier = nil
        resolve(true)
    }

    @objc
    public func clearUsername(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        logUnsupportedUserField("clearUsername")
        resolve(false)
    }

    @objc
    public func endSession(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard isSDKStarted() else {
            reject("END_SESSION_ERROR", "Embrace SDK may not be initialized", nil)
            return
        }
        EmbraceIO.shared.endUserSession()
        resolve(true)
    }

    @objc(addUserPersona:resolver:rejecter:)
    public func addUserPersona(_ persona: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        EmbraceIO.shared.addPersona(persona, lifespan: .userSession)
        resolve(true)
    }

    @objc
    public func clearAllUserPersonas(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard isSDKStarted() else {
            reject("CLEAR_ALL_USER_PERSONAS_ERROR", "Embrace SDK may not be initialized", nil)
            return
        }
        EmbraceIO.shared.removeAllPersonas(lifespans: [.permanent, .process, .userSession])
        resolve(true)
    }

    @objc(clearUserPersona:resolver:rejecter:)
    public func clearUserPersona(_ persona: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        EmbraceIO.shared.removePersona(persona, lifespan: .userSession)
        resolve(true)
    }

    @objc(removeSessionProperty:resolver:rejecter:)
    public func removeSessionProperty(_ key: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Depending on on how `addSessionProperty` was called we may have added this key as either
        // .userSession or .permanent so remove both here, multiple calls to remove are safe
        EmbraceIO.shared.setProperty(key: key, value: nil, lifespan: .permanent)
        EmbraceIO.shared.setProperty(key: key, value: nil, lifespan: .userSession)
        resolve(true)
    }

    @objc(setUserEmail:resolver:rejecter:)
    public func setUserEmail(_ userEmail: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        logUnsupportedUserField("setUserEmail")
        resolve(false)
    }

    @objc(addSessionProperty:value:permanent:resolver:rejecter:)
    public func addSessionProperty(
        _ key: String,
        value: String,
        permanent: Bool,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        EmbraceIO.shared.setProperty(key: key, value: value, lifespan: permanent ? .permanent : .userSession)
        resolve(true)
    }

    @objc(logMessageWithSeverityAndProperties:severity:properties:stacktrace:includeStacktrace:resolver:rejecter:)
    public func logMessageWithSeverityAndProperties(
        _ message: String,
        severity: String,
        properties: NSDictionary,
        stacktrace: String,
        includeStacktrace: Bool,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard isSDKStarted() else {
            reject("LOG_MESSAGE_ERROR", "Embrace SDK may not be initialized", nil)
            return
        }

        let severityValue = self.severityFromString(from: severity)
        guard var attributes = properties as? [String: String] else {
            reject("LOG_MESSAGE_INVALID_PROPERTIES", "Properties should be [String: String]", nil)
            return
        }

        let isInfoLog = severityValue == .info

        var stackTraceBehavior: EmbraceStackTraceBehavior = .notIncluded
        if includeStacktrace == true {
            if stacktrace.isEmpty {
                stackTraceBehavior = .default // will include the iOS Stacktrace if no JS is passed
            } else {
                // we don't want to send info stacktraces to sdk for 'info' logs, this is already prevented in the js layer as well
                if !isInfoLog {
                    attributes.updateValue(stacktrace, forKey: "emb.stacktrace.rn")
                }
            }
        }

        captureService.log(
            message,
            severity: severityValue,
            attributes: attributes,
            stackTraceBehavior: stackTraceBehavior
        )
        resolve(true)

    }

    private func severityFromString(from inputString: String) -> EmbraceLogSeverity {
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
    public func logNetworkRequest(
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
        guard isSDKStarted() else {
            reject("RECORD_LOG_NETWORK_REQUEST_ERROR", "Error recording a network request, Embrace SDK may not be initialized", nil)
            return
        }

        var attributes: EmbraceAttributes = [
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

        guard let span = EmbraceIO.shared.createSpan(
            name: createNetworkSpanName(url: url, httpMethod: httpMethod),
            type: .networkRequest,
            startTime: dateFrom(ms: startInMillis),
            attributes: attributes
        ) else {
            reject("LOG_NETWORK_REQUEST_ERROR", "Failed to create network span", nil)
            return
        }

        injectW3cTraceparent(span: span)
        span.end(errorCode: nil, endTime: dateFrom(ms: endInMillis))
        resolve(true)
    }

    @objc(logNetworkClientError:httpMethod:startInMillis:endInMillis:errorType:errorMessage:resolver:rejecter:)
    public func logNetworkClientError(
        _ url: String,
        httpMethod: String,
        startInMillis: Double,
        endInMillis: Double,
        errorType: String,
        errorMessage: String,
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        guard isSDKStarted() else {
            reject("RECORD_LOG_NETWORK_CLIENT_ERROR_ERROR", "Error recording a network client error, Embrace SDK may not be initialized", nil)
            return
        }

        guard let span = EmbraceIO.shared.createSpan(
            name: createNetworkSpanName(url: url, httpMethod: httpMethod),
            type: .networkRequest,
            startTime: dateFrom(ms: startInMillis),
            attributes: [
                "http.request.method": httpMethod.uppercased(),
                "url.full": url,
                "error.message": errorMessage,
                "error.type": errorType
            ]
        ) else {
            reject("LOG_NETWORK_CLIENT_ERROR_ERROR", "Failed to create network client error span", nil)
            return
        }

        injectW3cTraceparent(span: span)
        span.end(errorCode: .failure, endTime: dateFrom(ms: endInMillis))
        resolve(true)
    }

    private func dateFrom(ms: Double) -> Date {
        return Date(timeIntervalSince1970: TimeInterval(ms / 1000.0))
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
    public func logHandledError(
        _ message: String,
        stacktrace: String,
        properties: NSDictionary,
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        guard isSDKStarted() else {
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

        captureService.log(
            message,
            severity: .error,
            type: .message,
            attributes: attributes,
            // will always include a js stacktrace as per implementation
            stackTraceBehavior: .notIncluded
        )

        resolve(true)
    }

    @objc(logUnhandledJSException:message:type:stacktrace:resolver:rejecter:)
    public func logUnhandledJSException(
        _ name: String,
        message: String,
        type: String,
        stacktrace: String,
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        guard isSDKStarted() else {
            reject("LOG_UNHANDLED_JS_EXCEPTION_ERROR", "Error recording a unhandled js exception, Embrace SDK may not be initialized", nil)
            return
        }

        // injecting custom ID for js exception
        let jsExceptionUUID = UUID().uuidString

        let attributes: EmbraceAttributes = [
            "emb.ios.react_native_crash.js_exception": stacktrace,

            "exception.message": message,
            "exception.type": type,
            "exception.id": jsExceptionUUID
        ]

        captureService.log(
            name,
            severity: .error,
            type: EmbraceType(system: "ios.react_native_crash"),
            attributes: attributes,
            // will always include a js stacktrace as per implementation
            stackTraceBehavior: .notIncluded
        )

        // Unhandled JS exceptions will also generate a native crash log, so we append the
        // JS exception UUID to the native crash - the backend uses this to dedupe/discard the native log
        EmbraceIO.shared.appendCrashInfo(key: EMB_EXC, value: jsExceptionUUID)
        resolve(true)
    }

    func injectW3cTraceparent(span: EmbraceSpan) {
        span.setAttribute(key: "emb.w3c_traceparent", value: "00-\(span.context.traceId)-\(span.context.spanId)-01")
    }

    private func logUnsupportedUserField(_ method: String) {
        os_log("%{public}@ is not supported by the Embrace iOS SDK and does nothing", log: log, type: .error, method)
    }
}
