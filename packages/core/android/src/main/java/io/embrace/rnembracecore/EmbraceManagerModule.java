package io.embrace.rnembracecore;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import com.facebook.react.bridge.Promise;
import java.util.Map;
import java.util.HashMap;


import javax.annotation.Nonnull;

import io.embrace.android.embracesdk.Embrace;
import io.embrace.android.embracesdk.internal.EmbraceInternalApi;
import io.embrace.android.embracesdk.Severity;
import io.embrace.android.embracesdk.network.EmbraceNetworkRequest;
import io.embrace.android.embracesdk.network.http.HttpMethod;

public class EmbraceManagerModule extends EmbraceManagerSpec {
    public static final String NAME = "EmbraceManager";
    private final ReactApplicationContext context;

    public EmbraceManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
    }

    @Nonnull
    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void isStarted(Promise promise) {
        try {
            Boolean success = Embrace.getInstance().isStarted();
            promise.resolve(success);
        } catch(Exception e) {
            promise.reject("IS_STARTED_ERROR", "Error checking if Embrace SDK is started", e);
        }
    }

    @ReactMethod
    public void startNativeEmbraceSDK(ReadableMap config, Promise promise) {
        // config for now is only used to setup the iOS SDK, the Android SDK reads its config from a file
        try {
            Embrace.getInstance().start(this.context.getApplicationContext());
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("START_SDK_ERROR", "Error starting Embrace SDK", e);
        }
    }

    @ReactMethod
    public void setUserIdentifier(String userIdentifier, Promise promise) {
        try {
            Embrace.getInstance().setUserIdentifier(userIdentifier);
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("SET_USER_IDENTIFIER_ERROR", "Error setting user identifier", e);
        }
    }

    @ReactMethod
    public void setUsername(String username, Promise promise) {
        try {
            Embrace.getInstance().setUsername(username);
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("SET_USERNAME_ERROR", "Error setting username", e);
        }
    }

    @ReactMethod
    public void setUserEmail(String userEmail, Promise promise) {
        try {
            Embrace.getInstance().setUserEmail(userEmail);
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("SET_USER_EMAIL_ERROR", "Error setting user email", e);
        }
    }

    @ReactMethod
    public void clearUserEmail(Promise promise) {
        try {
            Embrace.getInstance().clearUserEmail();
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("CLEAR_USER_EMAIL_ERROR", "Error clearing user email", e);
        }
    }

    @ReactMethod
    public void clearUserIdentifier(Promise promise) {
        try {
            Embrace.getInstance().clearUserIdentifier();
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("CLEAR_USER_IDENTIFIER_ERROR", "Error clearing user identifier", e);
        }
    }

    @ReactMethod
    public void clearUsername(Promise promise) {
        try {
            Embrace.getInstance().clearUsername();
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("CLEAR_USERNAME_ERROR", "Error clearing username", e);
        }
    }

    @ReactMethod
    public void addBreadcrumb(String message, Promise promise) {
        try {
            Embrace.getInstance().addBreadcrumb(message);
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("ADD_BREADCRUMB_ERROR", "Error adding breadcrumb", e);
        }
    }

    @ReactMethod
    public void addUserPersona(String persona, Promise promise) {
        try {
            Embrace.getInstance().addUserPersona(persona);
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("ADD_USER_PERSONA_ERROR", "Error adding user persona", e);
        }
    }

    @ReactMethod
    public void clearUserPersona(String persona, Promise promise) {
        try {
            Embrace.getInstance().clearUserPersona(persona);
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("CLEAR_USER_PERSONA_ERROR", "Error clearing user persona", e);
        }
    }

    @ReactMethod
    public void clearAllUserPersonas(Promise promise) {
        try {
            Embrace.getInstance().clearAllUserPersonas();
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("CLEAR_ALL_USER_PERSONAS_ERROR", "Error clearing all user personas", e);
        }
    }

    @ReactMethod
    public void logMessageWithSeverityAndProperties(String message, String severity, ReadableMap properties,
                                                    String stacktrace, Boolean includeStacktrace, Promise promise) {
        try {
            final Map<String, Object> propValue = properties == null ? new HashMap<>() : properties.toHashMap();
            final Severity severityValue = getSeverityByString(severity);

            if (includeStacktrace && !stacktrace.isEmpty()) {
                // we don't want to send info stacktraces to sdk for 'info' logs,
                // this is already prevented in the js layer as well
                if (!severity.equals("info")) {
                    propValue.put("emb.stacktrace.rn", stacktrace);
                }
            }

            Embrace.getInstance().logMessage(message, severityValue, propValue);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e("Embrace", "Error logging message", e);
            promise.reject("LOG_MESSAGE_ERROR", "Error logging message", e);
        }
    }

    private Severity getSeverityByString(String severity) {
        switch (severity) {
            case "info":
                return Severity.INFO;
            case "warning":
                return Severity.WARNING;
            default:
                return Severity.ERROR;
        }
    }

    @ReactMethod
    public void logHandledError(String message, String javascriptStackTrace, ReadableMap properties, Promise promise) {
        try {
            final Map<String, Object> props = properties != null ? properties.toHashMap() : new HashMap<>();

            props.put("emb.exception_handling", "handled");

            if (!javascriptStackTrace.isEmpty()) {
                props.put("emb.stacktrace.rn", javascriptStackTrace);
            }

            Embrace.getInstance().logMessage(message, Severity.ERROR, props);
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("LOG_HANDLED_ERROR_ERROR", "Error logging handled error", e);
        }
    }

    @ReactMethod
    public void logUnhandledJSException(String name, String message, String type, String stacktrace, Promise promise) {
        try {
            EmbraceInternalApi.getInstance().getReactNativeInternalInterface().logUnhandledJsException(name, message, type, stacktrace);
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("LOG_UNHANDLED_JS_EXCEPTION_ERROR", "Error logging unhandled JS exception", e);
        }
    }

    @ReactMethod
    public void setJavaScriptPatchNumber(String number, Promise promise) {
        try {
            EmbraceInternalApi.getInstance().getReactNativeInternalInterface().setJavaScriptPatchNumber(number);
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("SET_JS_PATCH_ERROR", "Error setting JavaScript patch number", e);
        }
    }

    @ReactMethod
    public void setReactNativeSDKVersion(String number, Promise promise) {
        try {
            EmbraceInternalApi.getInstance().getReactNativeInternalInterface().setReactNativeSdkVersion(number);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("SET_RN_SDK_VERSION_ERROR", "Error setting React Native SDK version", e);
        }
    }

    @ReactMethod
    public void setReactNativeVersion(String version, Promise promise) {
        try {
            EmbraceInternalApi.getInstance().getReactNativeInternalInterface().setReactNativeVersionNumber(version);
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("SET_RN_VERSION_ERROR", "Error setting React Native version", e);
        }
    }

    @ReactMethod
    public void setJavaScriptBundlePath(String path, Promise promise) {
        try {
            EmbraceInternalApi.getInstance().getReactNativeInternalInterface().setJavaScriptBundleUrl(getReactApplicationContext().getApplicationContext() ,path);
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("SET_JS_BUNDLE_PATH_ERROR", "Error setting JavaScript bundle path", e);
        }
    }

    @ReactMethod
    public void addSessionProperty(String key, String value, boolean permanent, Promise promise) {
        try {
            Boolean success = Embrace.getInstance().addSessionProperty(key, value, permanent);
            promise.resolve(success);
        } catch(Exception e) {
            promise.reject("ADD_SESSION_PROPERTY_ERROR", "Error adding session property", e);
        }
    }

    @ReactMethod
    public void removeSessionProperty(String key, Promise promise) {
        try {
            Embrace.getInstance().removeSessionProperty(key);
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("REMOVE_SESSION_PROPERTY_ERROR", "Error removing session property", e);
        }
    }

    @ReactMethod
    public void endSession(Promise promise) {
        try {
            Embrace.getInstance().endSession();
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("END_SESSION_ERROR", "Error ending session", e);
        }
    }

    @ReactMethod()
    public void getDeviceId(Promise promise) {
        try {
            promise.resolve(Embrace.getInstance().getDeviceId());
        } catch(Exception e) {
            promise.reject("GET_DEVICE_ID_ERROR", "Error getting device ID", e);
        }
    }

    @ReactMethod()
    public void getLastRunEndState(Promise promise) {
        try {
            promise.resolve(Embrace.getInstance().getLastRunEndState().name());
        } catch(Exception e) {
            Log.e("Embrace", "Error getting the last run end state", e);
            promise.reject("GET_LAST_RUN_END_STATE_ERROR", "Error getting last run end state", e);
        }
    }

    @ReactMethod()
    public void getCurrentSessionId(Promise promise) {
        try {
            promise.resolve(Embrace.getInstance().getCurrentSessionId());
        } catch(Exception e) {
            promise.reject("GET_CURRENT_SESSION_ID_ERROR", "Error getting current session ID", e);
        }
    }

    @ReactMethod
    public void getDefaultJavaScriptBundlePath(Promise promise) {
        promise.resolve("");
    }

    @ReactMethod
    public void logNetworkRequest(String url,
                                  String httpMethod,
                                  Double startInMillis,
                                  Double endInMillis,
                                  Integer bytesSent,
                                  Integer bytesReceived,
                                  Integer statusCode,
                                  Promise promise) {
        long st = startInMillis.longValue();
        long et = endInMillis.longValue();

        HttpMethod parsedMethod = parseMethodFromString(httpMethod);
        if (parsedMethod == null) {
            promise.reject("LOG_NETWORK_REQUEST_ERROR", "Unexpected http method: " + httpMethod);
            return;
        }

        try {
            Embrace.getInstance().recordNetworkRequest(EmbraceNetworkRequest.fromCompletedRequest(
                    url,
                    parsedMethod,
                    st,
                    et,
                    bytesSent.intValue(),
                    bytesReceived.intValue(),
                    statusCode.intValue(),
                    null,
                    isNetworkSpanForwardingEnabled() ? generateW3cTraceparent() : null,
                    null
            ));

            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("LOG_NETWORK_REQUEST_ERROR", "Error logging network request", e);
        }
    }

    @ReactMethod
    public void logNetworkClientError(String url,
                                      String httpMethod,
                                      Double startInMillis,
                                      Double endInMillis,
                                      String errorType,
                                      String errorMessage, Promise promise) {
        long st = startInMillis.longValue();
        long et = endInMillis.longValue();

        HttpMethod parsedMethod = parseMethodFromString(httpMethod);
        if (parsedMethod == null) {
            promise.reject("LOG_NETWORK_CLIENT_ERROR_ERROR", "Unexpected http method: " + httpMethod);
            return;
        }

        try {
            Embrace.getInstance().recordNetworkRequest(EmbraceNetworkRequest.fromIncompleteRequest(
                    url,
                    parsedMethod,
                    st,
                    et,
                    errorType,
                    errorMessage,
                    null,
                    isNetworkSpanForwardingEnabled() ? generateW3cTraceparent() : null,
                    null
            ));
            promise.resolve(true);
        } catch(Exception e) {
            promise.reject("LOG_NETWORK_CLIENT_ERROR_ERROR", "Error logging network client error", e);
        }

    }

    public boolean isNetworkSpanForwardingEnabled() {
        return EmbraceInternalApi.getInstance().getReactNativeInternalInterface().isNetworkSpanForwardingEnabled();
    }

    public String generateW3cTraceparent() {
        return Embrace.getInstance().generateW3cTraceparent();
    }

    private HttpMethod parseMethodFromString(String httpMethod) {
        try {
            return HttpMethod.fromString(httpMethod);
        } catch(Exception e) {
            return null;
        }
    }
}
