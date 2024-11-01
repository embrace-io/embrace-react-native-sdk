package io.embrace.rnembraceotlp

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

import io.embrace.android.embracesdk.Embrace

class RNEmbraceOTLPModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "RNEmbraceOTLP"
    private val context: ReactApplicationContext = reactContext

    @ReactMethod fun setOtlpHttpTraceExporter() {
        // placeholder
    }

    @ReactMethod fun setOtlpHttpLogExporter() {
        // placeholder
    }

    @ReactMethod fun setHttpExporters() {
        // placeholder
    }

    // _sdkConfig is meant to not be used
    @ReactMethod fun startNativeEmbraceSDK(_sdkConfig: ReadableMap, otlpExporterConfig: ReadableMap, promise: Promise) {
        try {
            // 1) Initialize custom export
            // TBD

            // 2)
            // Embrace Start
            Embrace.getInstance().start(
                this.context.getApplicationContext(),
                false,
                Embrace.AppFramework.REACT_NATIVE
            )

            Log.i("Embrace", "RNEmbraceOTLP starting and working fine from Native side")

            promise.resolve(true)
        } catch (e: Exception) {
            // TBD improve or remove
            Log.i("Embrace", "Issues with Initialization")
            promise.resolve(false)
        }
    }
}