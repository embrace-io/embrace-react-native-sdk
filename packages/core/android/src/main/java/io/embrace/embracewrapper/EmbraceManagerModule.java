package io.embrace.embracewrapper;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.WritableMap;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Map;
import java.util.HashMap;

import io.embrace.android.embracesdk.spans.ErrorCode;
import java.util.ArrayList;
import java.util.List;

import javax.annotation.Nonnull;

import io.embrace.android.embracesdk.Embrace;
import io.embrace.android.embracesdk.Severity;
import io.embrace.android.embracesdk.network.EmbraceNetworkRequest;
import io.embrace.android.embracesdk.network.http.HttpMethod;

public class EmbraceManagerModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext context;

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
        try{
            Boolean success = Embrace.getInstance().isStarted();
            promise.resolve(success);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void startNativeEmbraceSDK(ReadableMap config, Promise promise) {
        // config for now is only used to setup the iOS SDK, the Android SDK reads its config from a file
        try{
            Embrace.getInstance().start(this.context.getApplicationContext(), false, Embrace.AppFramework.REACT_NATIVE);
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void setUserIdentifier(String userIdentifier, Promise promise) {
        try{
            Embrace.getInstance().setUserIdentifier(userIdentifier);
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void setUsername(String username, Promise promise) {
        try{
            Embrace.getInstance().setUsername(username);
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void setUserEmail(String userEmail, Promise promise) {
        try{
            Embrace.getInstance().setUserEmail(userEmail);
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void clearUserEmail(Promise promise) {
        try{
            Embrace.getInstance().clearUserEmail();
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void clearUserIdentifier(Promise promise) {
        try{
            Embrace.getInstance().clearUserIdentifier();
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void clearUsername(Promise promise) {
        try{
            Embrace.getInstance().clearUsername();
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void addBreadcrumb(String message, Promise promise) {
        try{
            Embrace.getInstance().addBreadcrumb(message);
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void addUserPersona(String persona, Promise promise) {
        try{
            Embrace.getInstance().addUserPersona(persona);
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void clearUserPersona(String persona, Promise promise) {
        try{
            Embrace.getInstance().clearUserPersona(persona);
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void clearAllUserPersonas(Promise promise) {
        try{
            Embrace.getInstance().clearAllUserPersonas();
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void logMessageWithSeverityAndProperties(String message, String severity, ReadableMap properties,
                                                    String stacktrace, Promise promise) {
        try {
            final Map<String, Object> props = properties != null ? properties.toHashMap() : null;
            if (severity.equals("info")) {
                Embrace.getInstance().logMessage(message, Severity.INFO, props);
            } else if (severity.equals("warning")) {
                Embrace.getInstance().logMessage(message, Severity.WARNING, props);
            } else {
                Embrace.getInstance().logMessage(message, Severity.ERROR, props);
            }
            promise.resolve(true);
        } catch (Exception e) {
            Log.e("Embrace", "Error logging message", e);
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void startView(String screen, Promise promise) {
        try{
            Embrace.getInstance().getReactNativeInternalInterface().logRnView(screen);
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void endView(String screen, Promise promise) {
        promise.resolve(true)
        //This method is only for compatibility, Android does not need an end event to end the view, but iOS does
        //TODO this should be changed to span in the future
    }

    @ReactMethod
    public void logHandledError(String message, String javascriptStackTrace, ReadableMap properties, Promise promise) {
        try{
            final Map<String, Object> props = properties != null ? properties.toHashMap() : null;
            Embrace.getInstance().getReactNativeInternalInterface().logHandledJsException("Javascript Error", message, props, javascriptStackTrace);
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void logUnhandledJSException(String name, String message, String type, String stacktrace, Promise promise) {
        try{
            Embrace.getInstance().getReactNativeInternalInterface().logUnhandledJsException(name, message, type, stacktrace);
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void setJavaScriptPatchNumber(String number, Promise promise) {
        try{
            Embrace.getInstance().getReactNativeInternalInterface().setJavaScriptPatchNumber(number);
            promise.resolve(true);
        }catch(Exception e){
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
        try{
            Embrace.getInstance().getReactNativeInternalInterface().setReactNativeVersionNumber(version);
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void logRNAction(String name, Double startTime, Double endTime, ReadableMap properties, Integer payloadSize, String output, Promise promise) {
        try{
            long st = startTime.longValue();
            long et = endTime.longValue();

            final Map<String, Object> props = properties != null ? properties.toHashMap() : new HashMap<String, Object>();
            Embrace.getInstance().getReactNativeInternalInterface().logRnAction(name, st, et, props, payloadSize, output);
            promise.resolve(name);
        }catch(Exception e){
            promise.resolve(false);
        }

    }

    @ReactMethod
    public void checkAndSetCodePushBundleURL(Promise promise) {
        try {
            Class<?> clazz = Class.forName("com.microsoft.codepush.react.CodePush");
            Method method = clazz.getDeclaredMethod("getJSBundleFile");
            String bundlePath = (String) method.invoke(null);
            Embrace.getInstance().getReactNativeInternalInterface().setJavaScriptBundleUrl(getReactApplicationContext().getApplicationContext() ,bundlePath);
            promise.resolve(true);
        } catch (Exception e) {
            Log.i("Embrace", "CodePush not present in build.", e);
            promise.resolve(false);

        }
    }

    @ReactMethod
    public void setJavaScriptBundlePath(String path, Promise promise) {
        try{
            Embrace.getInstance().getReactNativeInternalInterface().setJavaScriptBundleUrl(getReactApplicationContext().getApplicationContext() ,path);
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void addSessionProperty(String key, String value, boolean permanent, Promise promise) {
        try{
            Boolean success = Embrace.getInstance().addSessionProperty(key, value, permanent);
            promise.resolve(success);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void removeSessionProperty(String key, Promise promise) {
        try{
            Embrace.getInstance().removeSessionProperty(key);
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void endSession(Promise promise) {
        try{
            Embrace.getInstance().endSession();
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void setUserAsPayer(Promise promise) {
        try{
            Embrace.getInstance().setUserAsPayer();
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void clearUserAsPayer(Promise promise) {
        try{
            Embrace.getInstance().clearUserAsPayer();
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod()
    public void getDeviceId(Promise promise) {
        try{
            promise.resolve(Embrace.getInstance().getDeviceId());
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod()
    public void getLastRunEndState(Promise promise) {
        try{
            promise.resolve(Embrace.getInstance().getLastRunEndState().name());
        }catch(Exception e){
            Log.e("Embrace", "Error getting the last run end state", e);
            promise.resolve(false);
        }
    }

    @ReactMethod()
    public void getCurrentSessionId(Promise promise) {
        try{
            promise.resolve(Embrace.getInstance().getCurrentSessionId());
        }catch(Exception e){
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

        if(method == null) {
            Log.e("Embrace", "Failed to log network requests. Unexpected or null http method.");
            promise.resolve(false);
            return;
        }

        try{
            Embrace.getInstance().recordNetworkRequest(EmbraceNetworkRequest.fromCompletedRequest(
                    url,
                    HttpMethod.fromInt(method),
                    st,
                    et,
                    bytesSent.intValue(),
                    bytesReceived.intValue(),
                    statusCode.intValue()
            ));

            promise.resolve(true);
        }catch(Exception e){
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
        try{
            Embrace.getInstance().recordNetworkRequest(EmbraceNetworkRequest.fromIncompleteRequest(
                    url,
                    HttpMethod.fromString(httpMethod.toUpperCase()),
                    st,
                    et,
                    errorType,
                    errorMessage
            ));
            promise.resolve(true);
        }catch(Exception e){
            promise.resolve(false);
        }

    }

    @ReactMethod()
    public void startSpan(String name, String parentSpanId, Double startTimeMs, Promise promise) {
        try{
            Long startTime = null;
            if(startTimeMs != null && startTimeMs > 0){
                startTime = startTimeMs.longValue();
            }
            promise.resolve(Embrace.getInstance().getReactNativeInternalInterface().startSpan(name, parentSpanId, startTime));
        }catch(Exception e){
            promise.resolve(null);
        }
    }

    private Map<String, String> convertToReadableMap(ReadableMap readableMap) {
        if (readableMap == null) {
            return null;
        }

        Map<String, String> stringMap = new HashMap<>();

        for (String key : readableMap.toHashMap().keySet()) {
            stringMap.put(key, readableMap.getString(key));
        }

        return stringMap;
    }

    private ErrorCode getSpanErrorCodebyString(String errorCode){
        switch (errorCode) {
            case "Failure":
                return ErrorCode.FAILURE;

            case "UserAbandon":
                return ErrorCode.USER_ABANDON;

            case "Unknown":
                return ErrorCode.UNKNOWN;

            default:
                return null;
        }
    }

    private List<Map<String, Object>> transformListReadableMapToListMap(ReadableArray items) {
        List<Map<String, Object>> objectMapList = new ArrayList<>();

        try{
            for (int i = 0; i < items.size(); i++) {
                ReadableMap readableMap = items.getMap(i);

                if (readableMap != null) {
                    Map<String, Object> map = readableMap.toHashMap();
                    // TODO Change when Android/iOS replace time in nano for ms
                    if (map.containsKey("timestampMs") && map.get("timestampMs") instanceof Double) {
                        double timestampMs = (Double) map.get("timestampMs");
                        map.put("timestampMs", (long) timestampMs);
                    }
                    objectMapList.add(map);
                }
            }
        }catch(Exception e){
            Log.e("Embrace", "There was an error in parsing the span event data", e);
        }

        return objectMapList;
    }

    @ReactMethod()
    public void stopSpan(String spanId, String errorCodeString, Double endTimeMs, Promise promise) {
        try{
            Long endTime = null;
            if(endTimeMs != null && endTimeMs > 0){
                endTime = endTimeMs.longValue();
            }

            ErrorCode errorCodeInstance = this.getSpanErrorCodebyString(errorCodeString);
            promise.resolve(Embrace.getInstance().getReactNativeInternalInterface().stopSpan(spanId, errorCodeInstance, endTime));
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod()
    public void addSpanAttributeToSpan(String spanId, String key, String value, Promise promise) {
        try{
            promise.resolve(Embrace.getInstance().getReactNativeInternalInterface().addSpanAttribute(spanId, key, value));
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod()
    public void addSpanEventToSpan(String spanId, String name, Double time, ReadableMap attributes, Promise promise) {
        try{

            promise.resolve(Embrace.getInstance().getReactNativeInternalInterface().addSpanEvent(spanId, name, time.longValue(), this.convertToReadableMap(attributes)));
        }catch(Exception e){
            promise.resolve(false);
        }
    }

    @ReactMethod()
    public void recordCompletedSpan(String name, Double startTimeMs, Double endTimeMs, String errorCodeString, String parentSpanId, ReadableMap attributes, ReadableArray events, Promise promise) {
        try{
            ErrorCode errorCodeInstance = this.getSpanErrorCodebyString(errorCodeString);

            Long startTime = null;
            if(startTimeMs != null && startTimeMs > 0){
                startTime = startTimeMs.longValue();
            }

            Long endTime = null;
            if(endTimeMs != null && endTimeMs > 0){
                endTime = endTimeMs.longValue();
            }

            promise.resolve(Embrace.getInstance().getReactNativeInternalInterface().recordCompletedSpan(name, startTime, endTime, errorCodeInstance, parentSpanId, this.convertToReadableMap(attributes), this.transformListReadableMapToListMap(events)));
        }catch(Exception e){
            promise.resolve(false);
        }
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
