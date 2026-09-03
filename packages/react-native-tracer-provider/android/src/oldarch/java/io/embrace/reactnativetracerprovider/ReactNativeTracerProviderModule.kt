package io.embrace.reactnativetracerprovider

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap

class ReactNativeTracerProviderModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
    private val impl = ReactNativeTracerProviderModuleImpl()

    override fun getName() = ReactNativeTracerProviderModuleImpl.NAME

    @ReactMethod
    fun setupTracer(name: String, version: String, schemaUrl: String) {
        impl.setupTracer(name, version, schemaUrl)
    }

    @Suppress("LongParameterList")
    @ReactMethod
    fun startSpan(
        tracerName: String,
        tracerVersion: String,
        tracerSchemaUrl: String,
        spanBridgeId: String,
        name: String,
        kind: String,
        time: Double,
        attributes: ReadableMap,
        links: ReadableArray,
        parentId: String,
        promise: Promise
    ) {
        impl.startSpan(
            tracerName,
            tracerVersion,
            tracerSchemaUrl,
            spanBridgeId,
            name,
            kind,
            time,
            attributes,
            links,
            parentId,
            promise
        )
    }

    @ReactMethod
    fun setAttributes(spanBridgeId: String, attributes: ReadableMap) {
        impl.setAttributes(spanBridgeId, attributes)
    }

    @ReactMethod
    fun addEvent(spanBridgeId: String, eventName: String, attributes: ReadableMap, time: Double) {
        impl.addEvent(spanBridgeId, eventName, attributes, time)
    }

    @ReactMethod
    fun addLinks(spanBridgeId: String, links: ReadableArray) {
        impl.addLinks(spanBridgeId, links)
    }

    @ReactMethod
    fun setStatus(spanBridgeId: String, status: ReadableMap) {
        impl.setStatus(spanBridgeId, status)
    }

    @ReactMethod
    fun updateName(spanBridgeId: String, name: String) {
        impl.updateName(spanBridgeId, name)
    }

    @ReactMethod
    fun endSpan(spanBridgeId: String, endTime: Double) {
        impl.endSpan(spanBridgeId, endTime)
    }

    @ReactMethod
    fun clearCompletedSpans() {
        impl.clearCompletedSpans()
    }
}
