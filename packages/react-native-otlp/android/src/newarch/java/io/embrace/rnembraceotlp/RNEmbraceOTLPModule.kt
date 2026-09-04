package io.embrace.rnembraceotlp

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap

class RNEmbraceOTLPModule(
    reactContext: ReactApplicationContext
) : NativeRNEmbraceOTLPSpec(reactContext) {
    private val impl = RNEmbraceOTLPModuleImpl(reactContext)

    override fun startNativeEmbraceSDK(
        sdkConfig: ReadableMap,
        otlpExporterConfig: ReadableMap,
        promise: Promise
    ) {
        impl.startNativeEmbraceSDK(sdkConfig, otlpExporterConfig, promise)
    }
}
