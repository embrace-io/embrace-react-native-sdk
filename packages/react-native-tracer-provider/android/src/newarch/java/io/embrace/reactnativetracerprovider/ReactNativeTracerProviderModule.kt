package io.embrace.reactnativetracerprovider

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap

class ReactNativeTracerProviderModule(
    reactContext: ReactApplicationContext
) : NativeReactNativeTracerProviderModuleSpec(reactContext) {
    private val impl = ReactNativeTracerProviderModuleImpl()

    override fun setupTracer(name: String, version: String, schemaUrl: String) {
        impl.setupTracer(name, version, schemaUrl)
    }

    @Suppress("LongParameterList")
    override fun startSpan(
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

    override fun setAttributes(spanBridgeId: String, attributes: ReadableMap) {
        impl.setAttributes(spanBridgeId, attributes)
    }

    override fun addEvent(spanBridgeId: String, eventName: String, attributes: ReadableMap, time: Double) {
        impl.addEvent(spanBridgeId, eventName, attributes, time)
    }

    override fun addLinks(spanBridgeId: String, links: ReadableArray) {
        impl.addLinks(spanBridgeId, links)
    }

    override fun setStatus(spanBridgeId: String, status: ReadableMap) {
        impl.setStatus(spanBridgeId, status)
    }

    override fun updateName(spanBridgeId: String, name: String) {
        impl.updateName(spanBridgeId, name)
    }

    override fun endSpan(spanBridgeId: String, endTime: Double) {
        impl.endSpan(spanBridgeId, endTime)
    }

    override fun clearCompletedSpans() {
        impl.clearCompletedSpans()
    }
}
