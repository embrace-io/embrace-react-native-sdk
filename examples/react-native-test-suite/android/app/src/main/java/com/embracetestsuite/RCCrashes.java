package com.embracetestsuite;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.WritableMap;

public class RCCrashes extends ReactContextBaseJavaModule {

    static {
      System.loadLibrary("native-lib");
      System.loadLibrary("native-lib-crash-test");
    }

    public RCCrashes(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    public native String crash1();
		
    @ReactMethod
    public void generateCPPCrash(){
        this.crash1();
    }
		
    @NonNull
    @Override
    public String getName() {
        return "CrashTestModule";
    }
}