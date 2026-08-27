package io.embrace.rnembracecore;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;

public class EmbraceManagerModule extends NativeEmbraceManagerSpec {
    private final EmbraceManagerModuleImpl impl;

    public EmbraceManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.impl = new EmbraceManagerModuleImpl(reactContext);
    }

    @Override
    public void isStarted(Promise promise) {
        impl.isStarted(promise);
    }

    @Override
    public void startNativeEmbraceSDK(ReadableMap config, Promise promise) {
        impl.startNativeEmbraceSDK(config, promise);
    }

    @Override
    public void setJavaScriptBundlePath(String path, Promise promise) {
        impl.setJavaScriptBundlePath(path, promise);
    }

    @Override
    public void getDefaultJavaScriptBundlePath(Promise promise) {
        impl.getDefaultJavaScriptBundlePath(promise);
    }

    @Override
    public void setJavaScriptPatchNumber(String patch, Promise promise) {
        impl.setJavaScriptPatchNumber(patch, promise);
    }

    @Override
    public void setReactNativeSDKVersion(String version, Promise promise) {
        impl.setReactNativeSDKVersion(version, promise);
    }

    @Override
    public void setReactNativeVersion(String version, Promise promise) {
        impl.setReactNativeVersion(version, promise);
    }

    @Override
    public void getDeviceId(Promise promise) {
        impl.getDeviceId(promise);
    }

    @Override
    public void getCurrentSessionId(Promise promise) {
        impl.getCurrentSessionId(promise);
    }

    @Override
    public void getLastRunEndState(Promise promise) {
        impl.getLastRunEndState(promise);
    }

    @Override
    public void endSession(Promise promise) {
        impl.endSession(promise);
    }

    @Override
    public void addSessionProperty(String key, String value, boolean permanent, Promise promise) {
        impl.addSessionProperty(key, value, permanent, promise);
    }

    @Override
    public void removeSessionProperty(String key, Promise promise) {
        impl.removeSessionProperty(key, promise);
    }

    @Override
    public void setUserIdentifier(String userIdentifier, Promise promise) {
        impl.setUserIdentifier(userIdentifier, promise);
    }

    @Override
    public void clearUserIdentifier(Promise promise) {
        impl.clearUserIdentifier(promise);
    }

    @Override
    public void setUsername(String userName, Promise promise) {
        impl.setUsername(userName, promise);
    }

    @Override
    public void clearUsername(Promise promise) {
        impl.clearUsername(promise);
    }

    @Override
    public void setUserEmail(String userEmail, Promise promise) {
        impl.setUserEmail(userEmail, promise);
    }

    @Override
    public void clearUserEmail(Promise promise) {
        impl.clearUserEmail(promise);
    }

    @Override
    public void addUserPersona(String persona, Promise promise) {
        impl.addUserPersona(persona, promise);
    }

    @Override
    public void clearUserPersona(String persona, Promise promise) {
        impl.clearUserPersona(persona, promise);
    }

    @Override
    public void clearAllUserPersonas(Promise promise) {
        impl.clearAllUserPersonas(promise);
    }

    @Override
    public void addBreadcrumb(String event, Promise promise) {
        impl.addBreadcrumb(event, promise);
    }

    @Override
    public void logMessageWithSeverityAndProperties(String message, String severity, ReadableMap properties,
                                                    String stacktrace, boolean includeStacktrace, Promise promise) {
        impl.logMessageWithSeverityAndProperties(message, severity, properties, stacktrace, includeStacktrace, promise);
    }

    @Override
    public void logHandledError(String message, String stacktrace, ReadableMap properties, Promise promise) {
        impl.logHandledError(message, stacktrace, properties, promise);
    }

    @Override
    public void logUnhandledJSException(String name, String message, String type, String stacktrace, Promise promise) {
        impl.logUnhandledJSException(name, message, type, stacktrace, promise);
    }

    @Override
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

    @Override
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
