package io.embrace.rnembracecoretest

import android.os.Looper
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.Promise
import com.facebook.react.common.SystemClock.currentTimeMillis
import io.embrace.android.embracesdk.Embrace
import io.embrace.android.embracesdk.network.http.HttpMethod
import io.embrace.rnembracecore.EmbraceManagerModule
import io.opentelemetry.kotlin.export.OperationResultCode
import io.opentelemetry.kotlin.logging.export.LogRecordExporter
import io.opentelemetry.kotlin.logging.model.ReadableLogRecord
import io.opentelemetry.kotlin.tracing.data.SpanData
import io.opentelemetry.kotlin.tracing.export.SpanExporter
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.clearInvocations
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.timeout
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.verifyBlocking
import org.mockito.kotlin.whenever
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class RNEmbraceCoreTest {
    companion object {
        private val embraceModuleSpy = Mockito.spy(EmbraceManagerModule(mock()))

        private val spanExporter: SpanExporter = mock {
            onBlocking { export(any()) } doReturn OperationResultCode.Success
        }
        private val logExporter: LogRecordExporter = mock {
            onBlocking { export(any()) } doReturn OperationResultCode.Success
        }
        private val promise: Promise = mock()

        private var sdkStarted = false
    }

    @Before
    fun setUp() {
        if (!sdkStarted) {
            Embrace.addSpanExporter(spanExporter)
            Embrace.addLogRecordExporter(logExporter)
            Embrace.start(RuntimeEnvironment.getApplication())
            shadowOf(Looper.getMainLooper()).idle()
            assertTrue(Embrace.isStarted)
            sdkStarted = true
        }
        clearInvocations(spanExporter, logExporter, promise)
    }

    @Test
    fun logNetworkRequest() {
        whenever(embraceModuleSpy.generateW3cTraceparent()).thenReturn("traceparent-log-network-request")

        val url = "http://request.com/v1/log/network/request"
        val httpMethod = "GET"
        val startTime = currentTimeMillis().toDouble()
        val endTime = currentTimeMillis().toDouble() + 400000
        val bytesSent = 12938
        val bytesReceived = 199
        val statusCode = 200

        whenever(embraceModuleSpy.isNetworkSpanForwardingEnabled).thenReturn(true)
        embraceModuleSpy.logNetworkRequest(
            url,
            httpMethod,
            startTime,
            endTime,
            bytesSent,
            bytesReceived,
            statusCode,
            promise,
        )

        // verify span created with emb.w3c_traceparent in place
        argumentCaptor<List<SpanData>>().apply {
            verifyBlocking(spanExporter, times(1)) { export(capture()) }
            assertEquals(1, allValues.size)

            val spans = allValues[0].asSequence().withIndex()
            val spanWithTraceparent = spans.elementAt(0).value

            assertEquals(1, spans.count())
            assertEquals(
                "traceparent-log-network-request",
                spanWithTraceparent.attributes["emb.w3c_traceparent"]
            )
            assertEquals(
                "http://request.com/v1/log/network/request",
                spanWithTraceparent.attributes["url.full"]
            )
            assertEquals("200", spanWithTraceparent.attributes["http.response.status_code"])
            assertEquals("perf.network_request", spanWithTraceparent.attributes["emb.type"])
            assertEquals("12938", spanWithTraceparent.attributes["http.request.body.size"])
            assertEquals(
                HttpMethod.GET.toString(),
                spanWithTraceparent.attributes["http.request.method"]
            )
            assertEquals("199", spanWithTraceparent.attributes["http.response.body.size"])
        }

        verify(promise, times(1)).resolve(true)

        whenever(embraceModuleSpy.isNetworkSpanForwardingEnabled).thenReturn(false)
        embraceModuleSpy.logNetworkRequest(
            url,
            httpMethod,
            startTime,
            endTime,
            bytesSent,
            bytesReceived,
            statusCode,
            promise,
        )

        // `emb.w3c_traceparent` shouldn't be there
        argumentCaptor<List<SpanData>>().apply {
            verifyBlocking(spanExporter, times(2)) { export(capture()) }
            assertEquals(2, allValues.size)

            val spans = allValues[1].asSequence().withIndex()
            val noTraceparentSpan = spans.elementAt(0).value

            assertEquals(1, spans.count())
            assertNull(noTraceparentSpan.attributes["emb.w3c_traceparent"])
        }

        verify(promise, times(2)).resolve(true)
    }

    @Test
    fun logNetworkClientError() {
        whenever(embraceModuleSpy.generateW3cTraceparent()).thenReturn("traceparent-log-network-client-error")

        val url = "http://request.com/v1/log/network/client/error"
        val httpMethod = "POST"
        val startTime = currentTimeMillis().toDouble()
        val endTime = currentTimeMillis().toDouble() + 400000
        val errorType = "Bad Request"
        val errorMessage = "Error message"

        whenever(embraceModuleSpy.isNetworkSpanForwardingEnabled).thenReturn(true)
        embraceModuleSpy.logNetworkClientError(
            url,
            httpMethod,
            startTime,
            endTime,
            errorType,
            errorMessage,
            promise,
        )

        // verify span created with `emb.w3c_traceparent` in place
        argumentCaptor<List<SpanData>>().apply {
            verifyBlocking(spanExporter, times(1)) { export(capture()) }
            assertEquals(1, allValues.size)

            val spans = allValues[0].asSequence().withIndex()
            val spanWithTraceparent = spans.elementAt(0).value

            assertEquals(1, spans.count())
            assertEquals("emb-POST /v1/log/network/client/error", spanWithTraceparent.name)
            assertEquals(
                "traceparent-log-network-client-error",
                spanWithTraceparent.attributes["emb.w3c_traceparent"]
            )
            assertEquals("failure", spanWithTraceparent.attributes["emb.error_code"])
            assertEquals("perf.network_request", spanWithTraceparent.attributes["emb.type"])
            assertEquals("POST", spanWithTraceparent.attributes["http.request.method"])
            assertEquals("Error message", spanWithTraceparent.attributes["exception.message"])
            assertEquals("Bad Request", spanWithTraceparent.attributes["error.type"])
            assertEquals(
                "http://request.com/v1/log/network/client/error",
                spanWithTraceparent.attributes["url.full"]
            )
        }

        verify(promise, times(1)).resolve(true)

        whenever(embraceModuleSpy.isNetworkSpanForwardingEnabled).thenReturn(false)
        embraceModuleSpy.logNetworkClientError(
            url,
            httpMethod,
            startTime,
            endTime,
            errorType,
            errorMessage,
            promise,
        )

        // `emb.w3c_traceparent` shouldn't be there
        argumentCaptor<List<SpanData>>().apply {
            verifyBlocking(spanExporter, times(2)) { export(capture()) }
            assertEquals(2, allValues.size)

            val spans = allValues[1].asSequence().withIndex()
            val noTraceparentSpan = spans.elementAt(0).value

            assertEquals(1, spans.count())
            assertNull(noTraceparentSpan.attributes["emb.w3c_traceparent"])
        }

        verify(promise, times(2)).resolve(true)
    }

    @Test
    fun logMessageWithSeverityAndProperties() {
        val properties = JavaOnlyMap().apply {
            putString("custom.property1", "value.for-custom-property1")
            putString("custom.property2", "value.for-custom-property2")
        }

        embraceModuleSpy.logMessageWithSeverityAndProperties(
            "a nice warning message",
            "warning",
            properties,
            "stacktrace as string",
            true,
            promise
        )
        embraceModuleSpy.logMessageWithSeverityAndProperties(
            "a nice warning message without stacktrace",
            "warning",
            properties,
            "",
            false,
            promise
        )

        embraceModuleSpy.logMessageWithSeverityAndProperties(
            "a nice error message",
            "error",
            properties,
            "stacktrace as string",
            true,
            promise
        )
        embraceModuleSpy.logMessageWithSeverityAndProperties(
            "a nice error message without stacktrace",
            "error",
            properties,
            "",
            false,
            promise
        )

        // won't add the stacktrace as per product's decision
        embraceModuleSpy.logMessageWithSeverityAndProperties(
            "a nice info message",
            "info",
            properties,
            "stacktrace as string",
            true,
            promise
        )
        embraceModuleSpy.logMessageWithSeverityAndProperties(
            "a nice info message without properties",
            "info",
            JavaOnlyMap(),
            "",
            false,
            promise
        )

        // receiving severity as a non-expected value
        embraceModuleSpy.logMessageWithSeverityAndProperties(
            "a message without severity",
            "non-expected-value",
            JavaOnlyMap(),
            "stacktrace as string",
            true,
            promise
        )

        argumentCaptor<List<ReadableLogRecord>>().apply {
            verifyBlocking(logExporter, timeout(200).times(7)) { export(capture()) }
            assertEquals(7, allValues.size)

            val warningLog = allValues[0].asSequence().withIndex().elementAt(0).value
            assertEquals("WARNING", warningLog.severityText)
            assertEquals("a nice warning message", warningLog.body.toString())
            assertEquals("value.for-custom-property1", warningLog.attributes["custom.property1"])
            assertEquals("value.for-custom-property2", warningLog.attributes["custom.property2"])
            assertEquals("stacktrace as string", warningLog.attributes["emb.stacktrace.rn"])
            assertEquals("sys.log", warningLog.attributes["emb.type"])
            assertEquals(8, warningLog.attributes.size)
            assertNotNull(warningLog.attributes["log.record.uid"])
            assertNotNull(warningLog.attributes["emb.state"])
            assertNotNull(warningLog.attributes["emb.state.network"])
            assertNotNull(warningLog.attributes["emb.state.screen-automatic"])

            val warningLogNoStacktrace = allValues[1].asSequence().withIndex().elementAt(0).value
            assertEquals("WARNING", warningLogNoStacktrace.severityText)
            assertEquals("a nice warning message without stacktrace", warningLogNoStacktrace.body.toString())
            assertEquals("value.for-custom-property1", warningLogNoStacktrace.attributes["custom.property1"])
            assertEquals("value.for-custom-property2", warningLogNoStacktrace.attributes["custom.property2"])
            assertEquals("sys.log", warningLogNoStacktrace.attributes["emb.type"])
            assertEquals(7, warningLogNoStacktrace.attributes.size)
            assertNotNull(warningLogNoStacktrace.attributes["log.record.uid"])
            assertNotNull(warningLogNoStacktrace.attributes["emb.state"])
            assertNotNull(warningLogNoStacktrace.attributes["emb.state.network"])
            assertNotNull(warningLogNoStacktrace.attributes["emb.state.screen-automatic"])
            // no stacktrace if passing empty string
            assertNull(warningLogNoStacktrace.attributes["emb.stacktrace.rn"])

            val errorLog = allValues[2].asSequence().withIndex().elementAt(0).value
            assertEquals("ERROR", errorLog.severityText)
            assertEquals("a nice error message", errorLog.body.toString())
            assertEquals("value.for-custom-property1", errorLog.attributes["custom.property1"])
            assertEquals("value.for-custom-property2", errorLog.attributes["custom.property2"])
            assertEquals("stacktrace as string", errorLog.attributes["emb.stacktrace.rn"])
            assertEquals("sys.log", errorLog.attributes["emb.type"])
            assertEquals(8, errorLog.attributes.size)
            assertNotNull(errorLog.attributes["log.record.uid"])
            assertNotNull(errorLog.attributes["emb.state"])
            assertNotNull(errorLog.attributes["emb.state.network"])
            assertNotNull(errorLog.attributes["emb.state.screen-automatic"])

            val errorLogNoStacktrace = allValues[3].asSequence().withIndex().elementAt(0).value
            assertEquals("ERROR", errorLogNoStacktrace.severityText)
            assertEquals("a nice error message without stacktrace", errorLogNoStacktrace.body.toString())
            assertEquals("value.for-custom-property1", errorLogNoStacktrace.attributes["custom.property1"])
            assertEquals("value.for-custom-property2", errorLogNoStacktrace.attributes["custom.property2"])
            assertEquals("sys.log", errorLogNoStacktrace.attributes["emb.type"])
            assertEquals(7, errorLogNoStacktrace.attributes.size)
            assertNotNull(errorLogNoStacktrace.attributes["log.record.uid"])
            assertNotNull(errorLogNoStacktrace.attributes["emb.state"])
            assertNotNull(errorLogNoStacktrace.attributes["emb.state.network"])
            assertNotNull(errorLogNoStacktrace.attributes["emb.state.screen-automatic"])
            // no stacktrace if passing empty string
            assertNull(errorLogNoStacktrace.attributes["emb.stacktrace.rn"])

            val infoLog = allValues[4].asSequence().withIndex().elementAt(0).value
            assertEquals("INFO", infoLog.severityText)
            assertEquals("a nice info message", infoLog.body.toString())
            assertEquals("value.for-custom-property1", infoLog.attributes["custom.property1"])
            assertEquals("value.for-custom-property2", infoLog.attributes["custom.property2"])
            assertEquals("sys.log", infoLog.attributes["emb.type"])
            assertEquals(7, infoLog.attributes.size)
            assertNotNull(infoLog.attributes["log.record.uid"])
            assertNotNull(infoLog.attributes["emb.state"])
            assertNotNull(infoLog.attributes["emb.state.network"])
            assertNotNull(infoLog.attributes["emb.state.screen-automatic"])
            // no stacktrace if passing a stacktrace as product's decision
            assertNull(infoLog.attributes["emb.stacktrace.rn"])

            val infoLogNoProperties = allValues[5].asSequence().withIndex().elementAt(0).value
            assertEquals("INFO", infoLogNoProperties.severityText)
            assertEquals("a nice info message without properties", infoLogNoProperties.body.toString())
            assertEquals("sys.log", infoLogNoProperties.attributes["emb.type"])
            assertEquals(5, infoLogNoProperties.attributes.size)
            assertNotNull(infoLogNoProperties.attributes["log.record.uid"])
            assertNotNull(infoLogNoProperties.attributes["emb.state"])
            assertNotNull(infoLogNoProperties.attributes["emb.state.network"])
            assertNotNull(infoLogNoProperties.attributes["emb.state.screen-automatic"])
            assertNull(infoLogNoProperties.attributes["emb.stacktrace.rn"])

            val logWithNoSeverity = allValues[6].asSequence().withIndex().elementAt(0).value
            assertEquals("ERROR", logWithNoSeverity.severityText)
            assertEquals("a message without severity", logWithNoSeverity.body.toString())
            assertEquals("sys.log", logWithNoSeverity.attributes["emb.type"])
            assertEquals(6, logWithNoSeverity.attributes.size)
            assertNotNull(logWithNoSeverity.attributes["log.record.uid"])
            assertNotNull(logWithNoSeverity.attributes["emb.state"])
            assertNotNull(logWithNoSeverity.attributes["emb.state.network"])
            assertNotNull(logWithNoSeverity.attributes["emb.state.screen-automatic"])
            assertEquals("stacktrace as string", logWithNoSeverity.attributes["emb.stacktrace.rn"])
        }
    }
}
