package io.embrace.rnembracecore;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;

import com.facebook.react.bridge.Promise;
import java.lang.reflect.Method;
import java.util.Map;
import java.util.HashMap;

import io.embrace.android.embracesdk.internal.network.http.InternalNetworkApiImpl;
import io.embrace.android.embracesdk.spans.ErrorCode;
import java.util.ArrayList;
import java.util.List;

import javax.annotation.Nonnull;

import io.embrace.android.embracesdk.Embrace;
import io.embrace.android.embracesdk.Severity;
import io.embrace.android.embracesdk.network.EmbraceNetworkRequest;
import io.embrace.android.embracesdk.network.http.HttpMethod;

public class EmbraceManagerModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext context;
    private final InternalNetworkApiImpl embraceNetworkApi = new InternalNetworkApiImpl();

    public EmbraceManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
    }

    @Nonnull
    @Override
    public String getName() {
        return "EmbraceManager";
    }

    @ReactMethod
    public void isStarted(Promise promise) {
        try {
            Boolean success = Embrace.getInstance().isStarted();
            promise.resolve(success);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void startNativeEmbraceSDK(ReadableMap config, Promise promise) {
        // config for now is only used to setup the iOS SDK, the Android SDK reads its config from a file
        try {
            Embrace.getInstance().start(this.context.getApplicationContext(), false, Embrace.AppFramework.REACT_NATIVE);
            promise.resolve(true);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void setUserIdentifier(String userIdentifier, Promise promise) {
        try {
            Embrace.getInstance().setUserIdentifier(userIdentifier);
            promise.resolve(true);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void setUsername(String username, Promise promise) {
        try {
            Embrace.getInstance().setUsername(username);
            promise.resolve(true);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void setUserEmail(String userEmail, Promise promise) {
        try {
            Embrace.getInstance().setUserEmail(userEmail);
            promise.resolve(true);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void clearUserEmail(Promise promise) {
        try {
            Embrace.getInstance().clearUserEmail();
            promise.resolve(true);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void clearUserIdentifier(Promise promise) {
        try {
            Embrace.getInstance().clearUserIdentifier();
            promise.resolve(true);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void clearUsername(Promise promise) {
        try {
            Embrace.getInstance().clearUsername();
            promise.resolve(true);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void addBreadcrumb(String message, Promise promise) {
        try {
            Embrace.getInstance().addBreadcrumb(message);
            promise.resolve(true);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void addUserPersona(String persona, Promise promise) {
        try {
            Embrace.getInstance().addUserPersona(persona);
            promise.resolve(true);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void clearUserPersona(String persona, Promise promise) {
        try {
            Embrace.getInstance().clearUserPersona(persona);
            promise.resolve(true);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void clearAllUserPersonas(Promise promise) {
        try {
            Embrace.getInstance().clearAllUserPersonas();
            promise.resolve(true);
        } catch(Exception e) {
            promise.resolve(false);
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
            promise.resolve(false);
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
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void logUnhandledJSException(String name, String message, String type, String stacktrace, Promise promise) {
        try {
            Embrace.getInstance().getReactNativeInternalInterface().logUnhandledJsException(name, message, type, stacktrace);
            promise.resolve(true);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void setJavaScriptPatchNumber(String number, Promise promise) {
        try {
            Embrace.getInstance().getReactNativeInternalInterface().setJavaScriptPatchNumber(number);
            promise.resolve(true);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void setReactNativeSDKVersion(String number, Promise promise) {
        try {
            Embrace.getInstance().getReactNativeInternalInterface().setReactNativeSdkVersion(number);
            promise.resolve(true);
        } catch (Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void setReactNativeVersion(String version, Promise promise) {
        try {
            Embrace.getInstance().getReactNativeInternalInterface().setReactNativeVersionNumber(version);
            promise.resolve(true);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void setJavaScriptBundlePath(String path, Promise promise) {
        try {
            Embrace.getInstance().getReactNativeInternalInterface().setJavaScriptBundleUrl(getReactApplicationContext().getApplicationContext() ,path);
            promise.resolve(true);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void addSessionProperty(String key, String value, boolean permanent, Promise promise) {
        try {
            Boolean success = Embrace.getInstance().addSessionProperty(key, value, permanent);
            promise.resolve(success);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void removeSessionProperty(String key, Promise promise) {
        try {
            Embrace.getInstance().removeSessionProperty(key);
            promise.resolve(true);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void endSession(Promise promise) {
        try {
            Embrace.getInstance().endSession();
            promise.resolve(true);
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod()
    public void getDeviceId(Promise promise) {
        try {
            promise.resolve(Embrace.getInstance().getDeviceId());
        } catch(Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod()
    public void getLastRunEndState(Promise promise) {
        try {
            promise.resolve(Embrace.getInstance().getLastRunEndState().name());
        } catch(Exception e) {
            Log.e("Embrace", "Error getting the last run end state", e);
            promise.resolve(false);
        }
    }

    @ReactMethod()
    public void getCurrentSessionId(Promise promise) {
        try {
            promise.resolve(Embrace.getInstance().getCurrentSessionId());
        } catch(Exception e) {
            promise.resolve(false);
        }
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

        Integer method = parseMethodFromString(httpMethod);

        if (method == null) {
            Log.e("Embrace", "Failed to log network requests. Unexpected or null http method.");
            promise.resolve(false);
            return;
        }

        try {
            Embrace.getInstance().recordNetworkRequest(EmbraceNetworkRequest.fromCompletedRequest(
                    url,
                    HttpMethod.fromInt(method),
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
            promise.resolve(false);
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

        boolean isHTTPMethodValid = validateHTTPMethod(httpMethod);

        if (!isHTTPMethodValid) {
            Log.e("Embrace", "Failed to log network requests. Unexpected or null http method.");
            promise.resolve(false);
            return;
        }

        try {
            Embrace.getInstance().recordNetworkRequest(EmbraceNetworkRequest.fromIncompleteRequest(
                    url,
                    HttpMethod.fromString(httpMethod.toUpperCase()),
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
            promise.resolve(false);
        }

    }

    public boolean isNetworkSpanForwardingEnabled() {
        return embraceNetworkApi.isNetworkSpanForwardingEnabled();
    }

    public String generateW3cTraceparent() {
        return Embrace.getInstance().generateW3cTraceparent();
    }

    private boolean validateHTTPMethod(String httpMethod) {
        return parseMethodFromString(httpMethod) != null;
    }

    private Integer parseMethodFromString(String httpMethod) {
        if (httpMethod == null) {
            return null;
        }

        switch (httpMethod.toUpperCase()) {
            case "GET":
                return 1;
            case "HEAD":
                return 2;
            case "POST":
                return 3;
            case "PUT":
                return 4;
            case "DELETE":
                return 5;
            case "CONNECT":
                return 6;
            case "OPTIONS":
                return 7;
            case "TRACE":
                return 8;
            case "PATCH":
                return 9;
            default:
                return null;
        }
    }
}
