package io.embrace.rnembraceotlp

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class RNEmbraceOTLPModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
    private val impl = RNEmbraceOTLPModuleImpl(reactContext)

    override fun getName() = RNEmbraceOTLPModuleImpl.NAME

    @ReactMethod
    fun startNativeEmbraceSDK(
        sdkConfig: ReadableMap,
        otlpExporterConfig: ReadableMap,
        promise: Promise
    ) {
        impl.startNativeEmbraceSDK(sdkConfig, otlpExporterConfig, promise)
    }
}
