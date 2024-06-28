package io.embrace.tracerprovider

import io.embrace.android.embracesdk.Embrace;
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
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
import io.opentelemetry.exporter.logging.LoggingSpanExporter
import io.opentelemetry.sdk.trace.SdkTracerProvider
import io.opentelemetry.sdk.trace.export.SimpleSpanProcessor
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
    override fun build() : WritableMap {
        return WritableNativeMap()
    }
}

private const val LINK_ATTRIBUTES_KEY = "attributes"
private const val LINK_SPAN_CONTEXT_KEY = "context"
private const val SPAN_CONTEXT_TRACE_ID_KEY = "traceId"
private const val SPAN_CONTEXT_SPAN_ID_KEY = "spanId"
private const val SPAN_STATUS_CODE_KEY = "code"
private const val SPAN_STATUS_MESSAGE_KEY = "message"

class TracerProviderModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val log = Logger.getLogger("[Embrace]")
    private val tracers = ConcurrentHashMap<String, Tracer>()
    private val spans = ConcurrentHashMap<String, Span>()
    private var tracerProvider: TracerProvider
    private var writableMapBuilder: WritableMapBuilder

    override fun getName() = "TracerProviderModule"

    /**
     * Various serializer helpers to go to and from the bridge Readable/Writable Array/Maps to
     * actual OTEL API objects
     */

    private fun stringListFromReadableArray(array: ReadableArray) :List<String> {
        val list: MutableList<String> = mutableListOf()

        for(i in 0..<array.size()) {
            list.add(array.getString(i))
        }
        return list
    }

    private fun doubleListFromReadableArray(array: ReadableArray) :List<Double> {
        val list: MutableList<Double> = mutableListOf()

        for(i in 0..<array.size()) {
            list.add(array.getDouble(i))
        }
        return list
    }

    private fun booleanListFromReadableArray(array: ReadableArray) :List<Boolean> {
        val list: MutableList<Boolean> = mutableListOf()

        for(i in 0..<array.size()) {
            list.add(array.getBoolean(i))
        }
        return list
    }

    private fun attributesFromReadableMap(map: ReadableMap) : Attributes {
        val it = map.keySetIterator()
        val builder = Attributes.builder()

        while(it.hasNextKey()) {
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
                        else -> continue
                    }
                }
                else -> continue
            }
        }


        return builder.build()
    }

    private fun spanContextFromReadableMap(map: ReadableMap) : SpanContext {
        val traceID = map.getString(SPAN_CONTEXT_TRACE_ID_KEY) ?: ""
        val spanID = map.getString(SPAN_CONTEXT_SPAN_ID_KEY) ?: ""

        val spanContext = SpanContext.create(
            traceID,
            spanID,
            TraceFlags.getDefault(),
            TraceState.getDefault())

        return spanContext
    }

    private fun spanContextToWritableMap(spanContext: SpanContext?) : WritableMap{
        val map = this.writableMapBuilder.build()

        map.putString(SPAN_CONTEXT_TRACE_ID_KEY, spanContext?.traceId ?: "")
        map.putString(SPAN_CONTEXT_SPAN_ID_KEY, spanContext?.spanId ?: "")

        return map
    }

    init {
        log.warning(Embrace.AppFramework.UNITY.toString())
        // TODO replace with Embrace OTEL provider from 6.8.3
        // tracerProvider = Embrace.getInstance().getOpenTelemetry().getTracerProvider()
        tracerProvider = SdkTracerProvider.builder()
            .addSpanProcessor(SimpleSpanProcessor.create(LoggingSpanExporter.create()))
            .build()
         writableMapBuilder = WritableNativeMapBuilder()
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

    /**
     * Methods to allow the JS side to conform to @opentelemetry-js/api
     */

    @ReactMethod fun getTracer(name: String, version: String, schemaUrl: String) {
        val id = getTracerKey(name, version, schemaUrl)

        if (tracers.containsKey(id)) {
            return
        }

        val builder = tracerProvider.tracerBuilder(name)

        if (version != "") {
            builder.setInstrumentationVersion(version)
        }

        if (schemaUrl != "") {
            builder.setSchemaUrl(schemaUrl)
        }

        tracers[id] = builder.build()
    }

    @ReactMethod fun startSpan(tracerName: String, tracerVersion: String, tracerSchemaUrl: String,
                               spanBridgeID: String, name: String, kind: String, time: Double,
                               attributes: ReadableMap, links: ReadableArray, parentID: String,
                               promise: Promise) {
        val tracer = tracers[getTracerKey(tracerName, tracerVersion, tracerSchemaUrl)] ?: return
        val spanBuilder = tracer.spanBuilder(name)

        // Set kind
        if (kind.isNotEmpty()) {
            try {
                spanBuilder.setSpanKind(SpanKind.valueOf(kind))
            } catch(e: IllegalArgumentException) {
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
        for(i in 0..<links.size()) {
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
        val parent = spans[parentID]
        if (parentID.isEmpty() || parent == null) {
            spanBuilder.setNoParent()
        } else {
            spanBuilder.setParent(parent.storeInContext(Context.root()))
        }

        val span = spanBuilder.startSpan()
        spans[spanBridgeID] = span
        promise.resolve(spanContextToWritableMap(span.spanContext))
    }

    @ReactMethod(isBlockingSynchronousMethod = true) fun spanContext(spanBridgeID: String) : WritableMap {
        return spanContextToWritableMap(spans[spanBridgeID]?.spanContext)
    }

    @ReactMethod fun setAttributes(spanBridgeID: String, attributes: ReadableMap) {
        val span = spans[spanBridgeID] ?: return
        span.setAllAttributes(attributesFromReadableMap(attributes))
    }

    @ReactMethod fun addEvent(spanBridgeID: String, eventName: String, attributes: ReadableMap, time: Double) {
        val span = spans[spanBridgeID] ?: return

        if (time != 0.0) {
            span.addEvent(eventName, attributesFromReadableMap(attributes), time.toLong(), TimeUnit.MILLISECONDS)
        } else {
            span.addEvent(eventName, attributesFromReadableMap(attributes))
        }
    }

    @ReactMethod fun addLinks(spanBridgeID: String, links: ReadableArray) {
        val span = spans[spanBridgeID] ?: return
        for(i in 0..<links.size()) {
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

    @ReactMethod fun setStatus(spanBridgeID: String, status: ReadableMap) {
        val span = spans[spanBridgeID] ?: return
        val statusCode = status.getString(SPAN_STATUS_CODE_KEY) ?: return
        val message = status.getString(SPAN_STATUS_MESSAGE_KEY) ?: ""

        try {
            if (message.isEmpty()) {
                span.setStatus(StatusCode.valueOf(statusCode))
            } else {
                span.setStatus(StatusCode.valueOf(statusCode), message)
            }
        } catch(e: IllegalArgumentException) {
            log.warning("invalid statusCode for setStatus: $statusCode")
        }
    }

    @ReactMethod fun updateName(spanBridgeID: String, name: String) {
        val span = spans[spanBridgeID] ?: return
        span.updateName(name)
    }

    @ReactMethod fun endSpan(spanBridgeID: String, endTime: Double) {
        val span = spans[spanBridgeID] ?: return

        if (endTime == 0.0) {
            span.end()
        } else {
            span.end(endTime.toLong(), TimeUnit.MILLISECONDS)
        }
    }
}
