package io.embrace.reactnativetracerprovider

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import io.embrace.android.embracesdk.Embrace
import io.opentelemetry.api.common.AttributeKey
import io.opentelemetry.api.common.Attributes
import io.opentelemetry.api.trace.Span
import io.opentelemetry.api.trace.SpanContext
import io.opentelemetry.api.trace.SpanKind
import io.opentelemetry.api.trace.StatusCode
import io.opentelemetry.api.trace.TraceFlags
import io.opentelemetry.api.trace.TraceState
import io.opentelemetry.api.trace.Tracer
import io.opentelemetry.api.trace.TracerProvider
import io.opentelemetry.context.Context
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit
import java.util.logging.Logger

/**
 * Needed so WritableNativeMap can be swapped out for JavaOnlyMap during testing as the former
 * breaks in a mocked React Native environment
 */
interface WritableMapBuilder {
    fun build(): WritableMap
}

class WritableNativeMapBuilder : WritableMapBuilder {
    override fun build(): WritableMap {
        return WritableNativeMap()
    }
}

private const val LINK_ATTRIBUTES_KEY = "attributes"
private const val LINK_SPAN_CONTEXT_KEY = "context"
private const val SPAN_CONTEXT_TRACE_ID_KEY = "traceId"
private const val SPAN_CONTEXT_SPAN_ID_KEY = "spanId"
private const val SPAN_STATUS_CODE_KEY = "code"
private const val SPAN_STATUS_MESSAGE_KEY = "message"

// Should not get hit under normal circumstances, add as a guard against misinstrumentation
private const val MAX_STORED_SPANS = 10000

class ReactNativeTracerProviderModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val log = Logger.getLogger("[Embrace]")
    private val tracers = ConcurrentHashMap<String, Tracer>()
    private val activeSpans = ConcurrentHashMap<String, Span>()
    private val completedSpans = ConcurrentHashMap<String, Span>()
    private var tracerProvider: TracerProvider? = null
    private var writableMapBuilder: WritableMapBuilder

    override fun getName() = "ReactNativeTracerProviderModule"

    /**
     * Various deserializer helpers to go to and from the bridge Readable/Writable Array/Maps to
     * actual OTEL API objects
     */

    private fun stringListFromReadableArray(array: ReadableArray): List<String> {
        val list: MutableList<String> = mutableListOf()
        for (i in 0..array.size() - 1) {
            list.add(array.getString(i))
        }
        return list
    }

    private fun doubleListFromReadableArray(array: ReadableArray): List<Double> {
        val list: MutableList<Double> = mutableListOf()
        for (i in 0..array.size() - 1) {
            list.add(array.getDouble(i))
        }
        return list
    }

    private fun booleanListFromReadableArray(array: ReadableArray): List<Boolean> {
        val list: MutableList<Boolean> = mutableListOf()
        for (i in 0..array.size() - 1) {
            list.add(array.getBoolean(i))
        }
        return list
    }

    private fun attributesFromReadableMap(map: ReadableMap): Attributes {
        val it = map.keySetIterator()
        val builder = Attributes.builder()

        while (it.hasNextKey()) {
            val key = it.nextKey()
            val type = map.getType(key)

            when (type) {
                ReadableType.Boolean -> builder.put(key, map.getBoolean(key))
                ReadableType.Number -> builder.put(key, map.getDouble(key))
                ReadableType.String -> builder.put(key, map.getString(key) ?: "")
                ReadableType.Array -> {
                    val array = map.getArray(key)
                    val arrayType = array?.getType(0)
                    when (arrayType) {
                        ReadableType.Boolean -> builder.put(AttributeKey.booleanArrayKey(key), booleanListFromReadableArray(array))
                        ReadableType.Number -> builder.put(AttributeKey.doubleArrayKey(key), doubleListFromReadableArray(array))
                        ReadableType.String -> builder.put(AttributeKey.stringArrayKey(key), stringListFromReadableArray(array))
                        else -> {
                            log.warning("invalid attribute key: $key")
                        }
                    }
                }
                else -> {
                    log.warning("invalid attribute value for key: $key")
                }
            }
        }

        return builder.build()
    }

    private fun spanContextFromReadableMap(map: ReadableMap): SpanContext {
        val traceId = map.getString(SPAN_CONTEXT_TRACE_ID_KEY) ?: ""
        val spanId = map.getString(SPAN_CONTEXT_SPAN_ID_KEY) ?: ""

        val spanContext = SpanContext.create(
            traceId,
            spanId,
            TraceFlags.getDefault(),
            TraceState.getDefault()
        )

        return spanContext
    }

    private fun spanContextToWritableMap(spanContext: SpanContext?): WritableMap {
        val map = this.writableMapBuilder.build()

        map.putString(SPAN_CONTEXT_TRACE_ID_KEY, spanContext?.traceId ?: "")
        map.putString(SPAN_CONTEXT_SPAN_ID_KEY, spanContext?.spanId ?: "")

        return map
    }

    init {
        writableMapBuilder = WritableNativeMapBuilder()
    }

    /**
     * Exposed for unit testing to allow a writableMapBuilder to be injected
     */
    constructor(
        reactContext: ReactApplicationContext,
        writableMapBuilder: WritableMapBuilder
    ) : this(reactContext) {
        this.writableMapBuilder = writableMapBuilder
    }

    /**
     * Exposed for unit testing to allow a different trace provider and writableMapBuilder to be injected
     */
    constructor(
        reactContext: ReactApplicationContext,
        tracerProvider: TracerProvider,
        writableMapBuilder: WritableMapBuilder
    ) : this(reactContext) {
        this.tracerProvider = tracerProvider
        this.writableMapBuilder = writableMapBuilder
    }

    private fun getTracerKey(name: String, version: String, schemaUrl: String): String {
        return "$name $version $schemaUrl"
    }

    private fun getSpan(spanBridgeId: String): Span? {
        val span = activeSpans[spanBridgeId] ?: completedSpans[spanBridgeId]
        if (span == null) {
            log.warning("could not retrieve span with bridge id: $spanBridgeId")
        }
        return span
    }

    /**
     * Methods to allow the JS side to conform to @opentelemetry-js/api
     */

    @ReactMethod
    fun setupTracer(name: String, version: String, schemaUrl: String) {
        if (tracerProvider == null) {
            if (!Embrace.getInstance().isStarted) {
                log.warning("cannot access tracer provider, Embrace SDK has not been started")
                return
            }

            tracerProvider = Embrace.getInstance().getOpenTelemetry().tracerProvider
        }

        val id = getTracerKey(name, version, schemaUrl)

        if (tracers.containsKey(id)) {
            // tracer is already setup
            return
        }

        val builder = tracerProvider?.tracerBuilder(name)

        if (version != "") {
            builder?.setInstrumentationVersion(version)
        }

        if (schemaUrl != "") {
            builder?.setSchemaUrl(schemaUrl)
        }

        val tracer = builder?.build()

        if (tracer != null) {
            tracers[id] = tracer
        }
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
        val tracer = tracers[getTracerKey(tracerName, tracerVersion, tracerSchemaUrl)]

        if (tracer == null) {
            promise.reject("START_SPAN", "tracer not found")
            return
        }

        val spanBuilder = tracer.spanBuilder(name)

        // Set kind
        if (kind.isNotEmpty()) {
            try {
                spanBuilder.setSpanKind(SpanKind.valueOf(kind))
            } catch (e: IllegalArgumentException) {
                log.warning("invalid kind for startSpan: $kind")
            }
        }

        // Set time
        if (time != 0.0) {
            spanBuilder.setStartTimestamp(time.toLong(), TimeUnit.MILLISECONDS)
        }

        // Set attributes
        spanBuilder.setAllAttributes(attributesFromReadableMap(attributes))

        // Set links
        for (i in 0..links.size() - 1) {
            val link = links.getMap(i)
            val linkSpanContext = link.getMap(LINK_SPAN_CONTEXT_KEY) ?: continue
            val linkAttributes = link.getMap(LINK_ATTRIBUTES_KEY)

            if (linkAttributes == null) {
                val spanContext = spanContextFromReadableMap(linkSpanContext)
                spanBuilder.addLink(spanContext)
            } else {
                spanBuilder.addLink(spanContextFromReadableMap(linkSpanContext), attributesFromReadableMap(linkAttributes))
            }
        }

        // Set parent
        if (parentId.isEmpty()) {
            spanBuilder.setNoParent()
        } else {
            val parent = getSpan(parentId)
            if (parent != null) {
                spanBuilder.setParent(parent.storeInContext(Context.root()))
            }
        }

        if (activeSpans.size > MAX_STORED_SPANS) {
            val msg = "too many active spans being tracked, ignoring"
            log.warning(msg)
            promise.reject("START_SPAN", msg)
        } else {
            val span = spanBuilder.startSpan()
            activeSpans[spanBridgeId] = span
            promise.resolve(spanContextToWritableMap(span.spanContext))
        }
    }

    @ReactMethod
    fun setAttributes(spanBridgeId: String, attributes: ReadableMap) {
        val span = getSpan(spanBridgeId) ?: return
        span.setAllAttributes(attributesFromReadableMap(attributes))
    }

    @ReactMethod
    fun addEvent(spanBridgeId: String, eventName: String, attributes: ReadableMap, time: Double) {
        val span = getSpan(spanBridgeId) ?: return

        if (time != 0.0) {
            span.addEvent(eventName, attributesFromReadableMap(attributes), time.toLong(), TimeUnit.MILLISECONDS)
        } else {
            span.addEvent(eventName, attributesFromReadableMap(attributes))
        }
    }

    @ReactMethod
    fun addLinks(spanBridgeId: String, links: ReadableArray) {
        val span = getSpan(spanBridgeId) ?: return
        for (i in 0..links.size() - 1) {
            val link = links.getMap(i)
            val linkSpanContext = link.getMap(LINK_SPAN_CONTEXT_KEY) ?: continue
            val linkAttributes = link.getMap(LINK_ATTRIBUTES_KEY)

            if (linkAttributes == null) {
                span.addLink(spanContextFromReadableMap(linkSpanContext))
            } else {
                span.addLink(spanContextFromReadableMap(linkSpanContext), attributesFromReadableMap(linkAttributes))
            }
        }
    }

    @ReactMethod
    fun setStatus(spanBridgeId: String, status: ReadableMap) {
        val span = getSpan(spanBridgeId) ?: return
        val statusCode = status.getString(SPAN_STATUS_CODE_KEY) ?: return
        val message = status.getString(SPAN_STATUS_MESSAGE_KEY) ?: ""

        try {
            if (message.isEmpty()) {
                span.setStatus(StatusCode.valueOf(statusCode))
            } else {
                span.setStatus(StatusCode.valueOf(statusCode), message)
            }
        } catch (e: IllegalArgumentException) {
            log.warning("invalid statusCode for setStatus: $statusCode")
        }
    }

    @ReactMethod
    fun updateName(spanBridgeId: String, name: String) {
        val span = getSpan(spanBridgeId) ?: return
        span.updateName(name)
    }

    @ReactMethod
    fun endSpan(spanBridgeId: String, endTime: Double) {
        val span = getSpan(spanBridgeId) ?: return

        if (endTime == 0.0) {
            span.end()
        } else {
            span.end(endTime.toLong(), TimeUnit.MILLISECONDS)
        }

        activeSpans.remove(spanBridgeId)
        if (completedSpans.size > MAX_STORED_SPANS) {
            log.warning("too many completed spans being tracked, ignoring")
        } else {
            completedSpans[spanBridgeId] = span
        }
    }

    @ReactMethod
    fun clearCompletedSpans() {
        completedSpans.clear()
    }
}
