package io.embrace.rnembraceotlp

import java.time.Duration
import java.util.logging.Logger
import kotlin.time.DurationUnit
import kotlin.time.toDuration
import kotlin.time.toJavaDuration

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap

import io.embrace.android.embracesdk.Embrace
import io.opentelemetry.exporter.otlp.http.trace.OtlpHttpSpanExporter
import io.opentelemetry.exporter.otlp.http.logs.OtlpHttpLogRecordExporter

data class HeaderConfig (
    val key: String,
    val token: String
)

data class ExporterConfig(
    val endpoint: String,
    val headers: List<HeaderConfig>? = emptyList(),
    val timeout: Duration? = null
)

data class OtlpExporterConfig (
    val traceExporter: ExporterConfig? = null,
    val logExporter: ExporterConfig? = null
)

// parsing Readable Map into the real OTLP Exporter Config shape
fun parseExportConfig(exportConfig: ReadableMap): OtlpExporterConfig {
    var spanExportConfigParsed: ExporterConfig? = null
    val spanExportConfig = exportConfig.getMap("traceExporter")
    val spanExportEndpoint = spanExportConfig?.getString("endpoint")

    if (spanExportConfig != null && !spanExportEndpoint.isNullOrBlank()) {
        val headersExportConfig = spanExportConfig.getArray("headers")?.let {
            parseHeaders(it)
        }

        val timeoutExportConfig = parseTimeout(spanExportConfig.getDouble("timeout"))

        spanExportConfigParsed = ExporterConfig(
            endpoint = spanExportEndpoint,
            headers = headersExportConfig,
            timeout = timeoutExportConfig,
        )
    }

    return OtlpExporterConfig(traceExporter = spanExportConfigParsed)
}

fun parseHeaders(headers: ReadableArray): List<HeaderConfig> {
    val headerList: MutableList<HeaderConfig> = arrayListOf()

    for (i in 0 until headers.size()) {
        val header = headers.getMap(i)
        val keyVal = header.getString("key")
        val tokenVal = header.getString("token")

        if (!keyVal.isNullOrBlank() && !tokenVal.isNullOrBlank()) {
            headerList.add(HeaderConfig(key = keyVal, token = tokenVal))
        }
    }

    return headerList
}

fun parseTimeout(number: Double): Duration {
    return number.toLong().toDuration(DurationUnit.SECONDS).toJavaDuration()
}

class RNEmbraceOTLPModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "RNEmbraceOTLP"

    private val context: ReactApplicationContext = reactContext
    private val log = Logger.getLogger("[Embrace]")

    @ReactMethod
    fun setOtlpHttpTraceExporter(endpoint: String, headers: List<HeaderConfig>? = emptyList(), timeout: Duration?): OtlpHttpSpanExporter {
        val otlpHttpSpanExporter = OtlpHttpSpanExporter.builder()
            .setEndpoint(endpoint)

        if (!headers.isNullOrEmpty()) {
            for (header in headers) {
                otlpHttpSpanExporter.addHeader(header.key, header.token)
            }
        }

        if (timeout != null) {
            otlpHttpSpanExporter.setTimeout(timeout)
        }

        return otlpHttpSpanExporter.build()
    }

    @ReactMethod
    fun setOtlpHttpLogExporter(endpoint: String, headers: List<HeaderConfig>? = emptyList(), timeout: Duration?): OtlpHttpLogRecordExporter {
        val otlpHttpLogExporter = OtlpHttpLogRecordExporter.builder()
            .setEndpoint(endpoint)

        if (!headers.isNullOrEmpty()) {
            for (header in headers) {
                otlpHttpLogExporter.addHeader(header.key, header.token)
            }
        }

        if (timeout != null) {
            otlpHttpLogExporter.setTimeout(timeout)
        }

        return otlpHttpLogExporter.build()
    }

    @ReactMethod
    fun setHttpExporters(spanConfig: ExporterConfig? = null, logConfig: ExporterConfig? = null) {
        if (spanConfig != null && spanConfig.endpoint.isNotBlank()) {
            val spanCustomExporter = setOtlpHttpTraceExporter(spanConfig.endpoint, spanConfig.headers, spanConfig.timeout)
            Embrace.getInstance().addSpanExporter(spanCustomExporter)
        }

        if (logConfig != null && logConfig.endpoint.isNotBlank()) {
            val logCustomExporter = setOtlpHttpLogExporter(logConfig.endpoint, logConfig.headers, logConfig.timeout)
            Embrace.getInstance().addLogRecordExporter(logCustomExporter)
        }
    }

    // _sdkConfig is meant to not be used in Android, but the config is needed in iOS.
    // adding the param as placeholder.
    @ReactMethod fun startNativeEmbraceSDK(sdkConfig: ReadableMap, otlpExporterConfig: ReadableMap? = null, promise: Promise) {
        try {
            // 1) Initialize custom export if there is config
            if (otlpExporterConfig != null) {
                val otlpExportConfig = parseExportConfig(otlpExporterConfig)
                setHttpExporters(otlpExportConfig.traceExporter, otlpExportConfig.logExporter)
            }

            // 2) Embrace Start
            Embrace.getInstance().start(
                this.context.getApplicationContext(),
                false,
                Embrace.AppFramework.REACT_NATIVE
            )

            log.info("RNEmbraceOTLP starting and working fine from Native side")
            promise.resolve(true)
        } catch (e: Exception) {
            // TBD improve or remove
            log.info("Issues with Initialization")
            promise.resolve(false)
        }
    }
}