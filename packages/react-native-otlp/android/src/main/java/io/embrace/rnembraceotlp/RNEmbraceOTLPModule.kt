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

    @ReactMethod fun startNativeEmbraceSDK(config: ReadableMap, promise: Promise) {
        try {
            Embrace.getInstance().start(
                this.context.getApplicationContext(),
                false,
                Embrace.AppFramework.REACT_NATIVE
            )

            Log.i("Embrace", "RNEmbraceOTLP starting and working fine from Native side")

            promise.resolve(true)
        } catch (e: Exception) {
            Log.i("Embrace", "Issues with Initialization")
            promise.resolve(false)
        }
    }
}