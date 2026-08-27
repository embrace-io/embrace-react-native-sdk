package io.embrace.rnembracecore;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import javax.annotation.Nonnull;

public class EmbraceManagerModule extends ReactContextBaseJavaModule {
    private final EmbraceManagerModuleImpl impl;

    public EmbraceManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.impl = new EmbraceManagerModuleImpl(reactContext);
    }

    @Nonnull
    @Override
    public String getName() {
        return EmbraceManagerModuleImpl.NAME;
    }

    @ReactMethod
    public void isStarted(Promise promise) {
        impl.isStarted(promise);
    }

    @ReactMethod
    public void startNativeEmbraceSDK(ReadableMap config, Promise promise) {
        impl.startNativeEmbraceSDK(config, promise);
    }

    @ReactMethod
    public void setJavaScriptBundlePath(String path, Promise promise) {
        impl.setJavaScriptBundlePath(path, promise);
    }

    @ReactMethod
    public void getDefaultJavaScriptBundlePath(Promise promise) {
        impl.getDefaultJavaScriptBundlePath(promise);
    }

    @ReactMethod
    public void setJavaScriptPatchNumber(String patch, Promise promise) {
        impl.setJavaScriptPatchNumber(patch, promise);
    }

    @ReactMethod
    public void setReactNativeSDKVersion(String version, Promise promise) {
        impl.setReactNativeSDKVersion(version, promise);
    }

    @ReactMethod
    public void setReactNativeVersion(String version, Promise promise) {
        impl.setReactNativeVersion(version, promise);
    }

    @ReactMethod
    public void getDeviceId(Promise promise) {
        impl.getDeviceId(promise);
    }

    @ReactMethod
    public void getCurrentSessionId(Promise promise) {
        impl.getCurrentSessionId(promise);
    }

    @ReactMethod
    public void getLastRunEndState(Promise promise) {
        impl.getLastRunEndState(promise);
    }

    @ReactMethod
    public void endSession(Promise promise) {
        impl.endSession(promise);
    }

    @ReactMethod
    public void addSessionProperty(String key, String value, boolean permanent, Promise promise) {
        impl.addSessionProperty(key, value, permanent, promise);
    }

    @ReactMethod
    public void removeSessionProperty(String key, Promise promise) {
        impl.removeSessionProperty(key, promise);
    }

    @ReactMethod
    public void setUserIdentifier(String userIdentifier, Promise promise) {
        impl.setUserIdentifier(userIdentifier, promise);
    }

    @ReactMethod
    public void clearUserIdentifier(Promise promise) {
        impl.clearUserIdentifier(promise);
    }

    @ReactMethod
    public void setUsername(String userName, Promise promise) {
        impl.setUsername(userName, promise);
    }

    @ReactMethod
    public void clearUsername(Promise promise) {
        impl.clearUsername(promise);
    }

    @ReactMethod
    public void setUserEmail(String userEmail, Promise promise) {
        impl.setUserEmail(userEmail, promise);
    }

    @ReactMethod
    public void clearUserEmail(Promise promise) {
        impl.clearUserEmail(promise);
    }

    @ReactMethod
    public void addUserPersona(String persona, Promise promise) {
        impl.addUserPersona(persona, promise);
    }

    @ReactMethod
    public void clearUserPersona(String persona, Promise promise) {
        impl.clearUserPersona(persona, promise);
    }

    @ReactMethod
    public void clearAllUserPersonas(Promise promise) {
        impl.clearAllUserPersonas(promise);
    }

    @ReactMethod
    public void addBreadcrumb(String event, Promise promise) {
        impl.addBreadcrumb(event, promise);
    }

    @ReactMethod
    public void logMessageWithSeverityAndProperties(String message, String severity, ReadableMap properties,
                                                    String stacktrace, boolean includeStacktrace, Promise promise) {
        impl.logMessageWithSeverityAndProperties(message, severity, properties, stacktrace, includeStacktrace, promise);
    }

    @ReactMethod
    public void logHandledError(String message, String stacktrace, ReadableMap properties, Promise promise) {
        impl.logHandledError(message, stacktrace, properties, promise);
    }

    @ReactMethod
    public void logUnhandledJSException(String name, String message, String type, String stacktrace, Promise promise) {
        impl.logUnhandledJSException(name, message, type, stacktrace, promise);
    }

    @ReactMethod
    public void logNetworkRequest(String url,
                                  String httpMethod,
                                  double startInMillis,
                                  double endInMillis,
                                  double bytesSent,
                                  double bytesReceived,
                                  double statusCode,
                                  Promise promise) {
        impl.logNetworkRequest(url, httpMethod, startInMillis, endInMillis, bytesSent, bytesReceived, statusCode, promise);
    }

    @ReactMethod
    public void logNetworkClientError(String url,
                                      String httpMethod,
                                      double startInMillis,
                                      double endInMillis,
                                      String errorType,
                                      String errorMessage,
                                      Promise promise) {
        impl.logNetworkClientError(url, httpMethod, startInMillis, endInMillis, errorType, errorMessage, promise);
    }
}
