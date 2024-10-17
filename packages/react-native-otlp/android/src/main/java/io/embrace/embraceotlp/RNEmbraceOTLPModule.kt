package io.embrace.embraceotlp

import android.util.Log

import io.embrace.android.embracesdk.Embrace

import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class RNEmbraceOTLPModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "RNEmbraceOTLP"

    @ReactMethod fun setCustomExporter(endpoint: String, header: String, token: String) {
        Log.d("RNEmbraceOTLP", "setCustomExporter: $endpoint $header and $token")
    }

    @ReactMethod fun setCustomOtlpGrpcSpanExporter() {
        //GRPC through an OTel Collector in a local docker image
//        val customDockerExporter = OtlpGrpcSpanExporter.builder()
//            .setEndpoint("https://otel-collector.mydomain.com:4317")
//            .build()
//
//        Embrace.getInstance().addSpanExporter(customDockerExporter)
    }
}