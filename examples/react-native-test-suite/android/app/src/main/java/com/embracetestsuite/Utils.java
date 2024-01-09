package com.embracetestsuite;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.WritableMap;

public class Utils extends ReactContextBaseJavaModule {

    public Utils(ReactApplicationContext reactContext) {
        super(reactContext);
    }
		
    @ReactMethod
    public void moveToBackground(){
        System.exit(0);
    }

	 @NonNull
    @Override
    public String getName() {
        return "NativeTestModule";
    }
}