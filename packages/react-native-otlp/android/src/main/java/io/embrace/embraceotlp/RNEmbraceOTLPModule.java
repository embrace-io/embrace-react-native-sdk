package io.embrace.embraceotlp;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class RNEmbraceOTLPModule extends ReactContextBaseJavaModule {
    RNEmbraceOTLPModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "RNEmbraceOTLP";
    }

    @ReactMethod
    public void setCustomExporter(String endpoint, String header, String token) {
        Log.d("RNEmbraceOTLP", "setCustomExporter: " + endpoint + ", " + header + " and " + token);
    }
}

