package io.embrace.rnembracecoretest

import android.os.Looper
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleRegistry
import androidx.lifecycle.ProcessLifecycleOwner
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.Promise
import com.facebook.react.common.SystemClock.currentTimeMillis
import io.embrace.android.embracesdk.Embrace
import io.embrace.android.embracesdk.internal.ReactNativeInternalInterface
import io.embrace.android.embracesdk.network.http.HttpMethod
import io.embrace.rnembracecore.EmbraceManagerModuleImpl
import io.opentelemetry.kotlin.context.Context
import io.opentelemetry.kotlin.export.OperationResultCode
import io.opentelemetry.kotlin.logging.export.LogRecordProcessor
import io.opentelemetry.kotlin.logging.model.ReadWriteLogRecord
import io.opentelemetry.kotlin.tracing.export.SpanProcessor
import io.opentelemetry.kotlin.tracing.model.ReadWriteSpan
import io.opentelemetry.kotlin.tracing.model.ReadableSpan
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito
import org.mockito.kotlin.anyOrNull
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.clearInvocations
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.doThrow
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config
import java.time.Duration
import java.util.concurrent.CopyOnWriteArrayList

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class RNEmbraceCoreTest {
    companion object {
        private val embraceModuleSpy = Mockito.spy(EmbraceManagerModuleImpl(mock()))

        private val spanProcessor = TestSpanProcessor()
        private val logProcessor = TestLogRecordProcessor()
        private val promise: Promise = mock()

        private var sdkStarted = false
    }

    @Before
    fun setUp() {
        if (!sdkStarted) {
            Embrace.addSpanProcessor(spanProcessor)
            Embrace.addLogRecordProcessor(logProcessor)
            Embrace.start(RuntimeEnvironment.getApplication())
            shadowOf(Looper.getMainLooper()).idle()
            (ProcessLifecycleOwner.get().lifecycle as LifecycleRegistry).handleLifecycleEvent(Lifecycle.Event.ON_START)
            shadowOf(Looper.getMainLooper()).idle()
            assertTrue(Embrace.isStarted)
            sdkStarted = true
        }
        spanProcessor.spans.clear()
        logProcessor.logs.clear()
        clearInvocations(promise)
    }

    private fun moduleWithInternalInterface(rn: ReactNativeInternalInterface): EmbraceManagerModuleImpl {
        val module = Mockito.spy(EmbraceManagerModuleImpl(mock()))
        doReturn(rn).whenever(module).reactNativeInternalInterface
        return module
    }

    @Test
    fun initializeReactNativeSDKWithTheStartedSdk() {
        val started = EmbraceManagerModuleImpl(mock()).initializeReactNativeSDK(
            JavaOnlyMap().apply {
                putString("reactNativeVersion", "0.85.0")
                putString("sdkVersion", "8.0.0")
                putNull("javaScriptPatchNumber")
                putBoolean("resolveDefaultBundlePath", true)
            },
        )

        assertTrue(started)
    }

    @Test
    fun initializeReactNativeSDKAppliesEachField() {
        val rn: ReactNativeInternalInterface = mock()

        val started = moduleWithInternalInterface(rn).initializeReactNativeSDK(
            JavaOnlyMap().apply {
                putString("reactNativeVersion", "0.85.0")
                putString("sdkVersion", "8.0.0")
                putString("javaScriptPatchNumber", "patch-1")
                putBoolean("resolveDefaultBundlePath", true)
            },
        )

        assertTrue(started)
        verify(rn).setReactNativeVersionNumber("0.85.0")
        verify(rn).setReactNativeSdkVersion("8.0.0")
        verify(rn).setJavaScriptPatchNumber("patch-1")
    }

    @Test
    fun initializeReactNativeSDKSkipsMissingFields() {
        val rn: ReactNativeInternalInterface = mock()

        val started = moduleWithInternalInterface(rn).initializeReactNativeSDK(
            JavaOnlyMap().apply {
                putString("sdkVersion", "8.0.0")
            },
        )

        assertTrue(started)
        verify(rn).setReactNativeSdkVersion("8.0.0")
        verify(rn, never()).setReactNativeVersionNumber(anyOrNull())
        verify(rn, never()).setJavaScriptPatchNumber(anyOrNull())
    }

    @Test
    fun initializeReactNativeSDKReturnsTrueWhenASetterThrows() {
        val rn: ReactNativeInternalInterface = mock {
            on { setReactNativeVersionNumber(anyOrNull()) } doThrow RuntimeException("setter failed")
        }

        val started = moduleWithInternalInterface(rn).initializeReactNativeSDK(
            JavaOnlyMap().apply {
                putString("reactNativeVersion", "0.85.0")
                putString("sdkVersion", "8.0.0")
                putString("javaScriptPatchNumber", "patch-1")
            },
        )

        assertTrue(started)
    }

    @Test
    fun logNetworkRequest() {
        whenever(embraceModuleSpy.generateW3cTraceparent()).thenReturn("traceparent-log-network-request")

        val url = "http://request.com/v1/log/network/request"
        val httpMethod = "GET"
        val startTime = currentTimeMillis().toDouble()
        val endTime = currentTimeMillis().toDouble() + 400000
        val bytesSent = 12938.0
        val bytesReceived = 199.0
        val statusCode = 200.0

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
        assertEquals(1, spanProcessor.spans.size)

        val spanWithTraceparent = spanProcessor.spans[0]

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
        assertEquals(2, spanProcessor.spans.size)

        val noTraceparentSpan = spanProcessor.spans[1]

        assertNull(noTraceparentSpan.attributes["emb.w3c_traceparent"])

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
        assertEquals(1, spanProcessor.spans.size)

        val spanWithTraceparent = spanProcessor.spans[0]

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
        assertEquals(2, spanProcessor.spans.size)

        val noTraceparentSpan = spanProcessor.spans[1]

        assertNull(noTraceparentSpan.attributes["emb.w3c_traceparent"])

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

        assertEquals(7, logProcessor.logs.size)

        val warningLog = logProcessor.logs[0]
        assertEquals("WARNING", warningLog.severityText)
        assertEquals("a nice warning message", warningLog.body.toString())
        assertEquals("value.for-custom-property1", warningLog.attributes["custom.property1"])
        assertEquals("value.for-custom-property2", warningLog.attributes["custom.property2"])
        assertEquals("stacktrace as string", warningLog.attributes["emb.stacktrace.rn"])
        assertEquals("sys.log", warningLog.attributes["emb.type"])
        assertEquals(10, warningLog.attributes.size)
        assertNotNull(warningLog.attributes["log.record.uid"])
        assertNotNull(warningLog.attributes["emb.state"])
        assertNotNull(warningLog.attributes["emb.state.network"])
        assertNotNull(warningLog.attributes["emb.state.screen-automatic"])
        assertNotNull(warningLog.attributes["emb.user_session_id"])
        assertNotNull(warningLog.attributes["emb.session_part_id"])

        val warningLogNoStacktrace = logProcessor.logs[1]
        assertEquals("WARNING", warningLogNoStacktrace.severityText)
        assertEquals("a nice warning message without stacktrace", warningLogNoStacktrace.body.toString())
        assertEquals("value.for-custom-property1", warningLogNoStacktrace.attributes["custom.property1"])
        assertEquals("value.for-custom-property2", warningLogNoStacktrace.attributes["custom.property2"])
        assertEquals("sys.log", warningLogNoStacktrace.attributes["emb.type"])
        assertEquals(9, warningLogNoStacktrace.attributes.size)
        assertNotNull(warningLogNoStacktrace.attributes["log.record.uid"])
        assertNotNull(warningLogNoStacktrace.attributes["emb.state"])
        assertNotNull(warningLogNoStacktrace.attributes["emb.state.network"])
        assertNotNull(warningLogNoStacktrace.attributes["emb.state.screen-automatic"])
        assertNotNull(warningLogNoStacktrace.attributes["emb.user_session_id"])
        assertNotNull(warningLogNoStacktrace.attributes["emb.session_part_id"])
        // no stacktrace if passing empty string
        assertNull(warningLogNoStacktrace.attributes["emb.stacktrace.rn"])

        val errorLog = logProcessor.logs[2]
        assertEquals("ERROR", errorLog.severityText)
        assertEquals("a nice error message", errorLog.body.toString())
        assertEquals("value.for-custom-property1", errorLog.attributes["custom.property1"])
        assertEquals("value.for-custom-property2", errorLog.attributes["custom.property2"])
        assertEquals("stacktrace as string", errorLog.attributes["emb.stacktrace.rn"])
        assertEquals("sys.log", errorLog.attributes["emb.type"])
        assertEquals(10, errorLog.attributes.size)
        assertNotNull(errorLog.attributes["log.record.uid"])
        assertNotNull(errorLog.attributes["emb.state"])
        assertNotNull(errorLog.attributes["emb.state.network"])
        assertNotNull(errorLog.attributes["emb.state.screen-automatic"])
        assertNotNull(errorLog.attributes["emb.user_session_id"])
        assertNotNull(errorLog.attributes["emb.session_part_id"])

        val errorLogNoStacktrace = logProcessor.logs[3]
        assertEquals("ERROR", errorLogNoStacktrace.severityText)
        assertEquals("a nice error message without stacktrace", errorLogNoStacktrace.body.toString())
        assertEquals("value.for-custom-property1", errorLogNoStacktrace.attributes["custom.property1"])
        assertEquals("value.for-custom-property2", errorLogNoStacktrace.attributes["custom.property2"])
        assertEquals("sys.log", errorLogNoStacktrace.attributes["emb.type"])
        assertEquals(9, errorLogNoStacktrace.attributes.size)
        assertNotNull(errorLogNoStacktrace.attributes["log.record.uid"])
        assertNotNull(errorLogNoStacktrace.attributes["emb.state"])
        assertNotNull(errorLogNoStacktrace.attributes["emb.state.network"])
        assertNotNull(errorLogNoStacktrace.attributes["emb.state.screen-automatic"])
        assertNotNull(errorLogNoStacktrace.attributes["emb.user_session_id"])
        assertNotNull(errorLogNoStacktrace.attributes["emb.session_part_id"])
        // no stacktrace if passing empty string
        assertNull(errorLogNoStacktrace.attributes["emb.stacktrace.rn"])

        val infoLog = logProcessor.logs[4]
        assertEquals("INFO", infoLog.severityText)
        assertEquals("a nice info message", infoLog.body.toString())
        assertEquals("value.for-custom-property1", infoLog.attributes["custom.property1"])
        assertEquals("value.for-custom-property2", infoLog.attributes["custom.property2"])
        assertEquals("sys.log", infoLog.attributes["emb.type"])
        assertEquals(9, infoLog.attributes.size)
        assertNotNull(infoLog.attributes["log.record.uid"])
        assertNotNull(infoLog.attributes["emb.state"])
        assertNotNull(infoLog.attributes["emb.state.network"])
        assertNotNull(infoLog.attributes["emb.state.screen-automatic"])
        assertNotNull(infoLog.attributes["emb.user_session_id"])
        assertNotNull(infoLog.attributes["emb.session_part_id"])
        // no stacktrace if passing a stacktrace as product's decision
        assertNull(infoLog.attributes["emb.stacktrace.rn"])

        val infoLogNoProperties = logProcessor.logs[5]
        assertEquals("INFO", infoLogNoProperties.severityText)
        assertEquals("a nice info message without properties", infoLogNoProperties.body.toString())
        assertEquals("sys.log", infoLogNoProperties.attributes["emb.type"])
        assertEquals(7, infoLogNoProperties.attributes.size)
        assertNotNull(infoLogNoProperties.attributes["log.record.uid"])
        assertNotNull(infoLogNoProperties.attributes["emb.state"])
        assertNotNull(infoLogNoProperties.attributes["emb.state.network"])
        assertNotNull(infoLogNoProperties.attributes["emb.state.screen-automatic"])
        assertNotNull(infoLogNoProperties.attributes["emb.user_session_id"])
        assertNotNull(infoLogNoProperties.attributes["emb.session_part_id"])
        assertNull(infoLogNoProperties.attributes["emb.stacktrace.rn"])

        val logWithNoSeverity = logProcessor.logs[6]
        assertEquals("ERROR", logWithNoSeverity.severityText)
        assertEquals("a message without severity", logWithNoSeverity.body.toString())
        assertEquals("sys.log", logWithNoSeverity.attributes["emb.type"])
        assertEquals(8, logWithNoSeverity.attributes.size)
        assertNotNull(logWithNoSeverity.attributes["log.record.uid"])
        assertNotNull(logWithNoSeverity.attributes["emb.state"])
        assertNotNull(logWithNoSeverity.attributes["emb.state.network"])
        assertNotNull(logWithNoSeverity.attributes["emb.state.screen-automatic"])
        assertNotNull(logWithNoSeverity.attributes["emb.user_session_id"])
        assertNotNull(logWithNoSeverity.attributes["emb.session_part_id"])
        assertEquals("stacktrace as string", logWithNoSeverity.attributes["emb.stacktrace.rn"])
    }

    @Test
    fun endSessionStartsANewSessionThatKeepsOnlyPermanentProperties() {
        embraceModuleSpy.addSessionProperty("permanent-key", "permanent-value", true, promise)
        embraceModuleSpy.addSessionProperty("temporary-key", "temporary-value", false, promise)
        embraceModuleSpy.addSessionProperty("removed-key", "removed-value", false, promise)
        embraceModuleSpy.removeSessionProperty("removed-key", promise)
        verify(promise, times(4)).resolve(true)
        val endedSessionId = currentSessionId()

        embraceModuleSpy.endSession(promise)

        verify(promise, times(5)).resolve(true)
        val nextSessionId = currentSessionId()
        assertTrue(endedSessionId.isNotEmpty())
        assertTrue(nextSessionId.isNotEmpty())
        assertNotEquals(endedSessionId, nextSessionId)

        shadowOf(Looper.getMainLooper()).idleFor(Duration.ofSeconds(6))
        embraceModuleSpy.endSession(promise)

        val endedSession = endedSessionSpan(endedSessionId)
        assertEquals("permanent-value", endedSession.attributes["emb.properties.permanent-key"])
        assertEquals("temporary-value", endedSession.attributes["emb.properties.temporary-key"])
        assertNull(endedSession.attributes["emb.properties.removed-key"])
        val nextSession = endedSessionSpan(nextSessionId)
        assertEquals("permanent-value", nextSession.attributes["emb.properties.permanent-key"])
        assertNull(nextSession.attributes["emb.properties.temporary-key"])

        embraceModuleSpy.removeSessionProperty("permanent-key", promise)
    }

    private fun currentSessionId(): String {
        val idPromise: Promise = mock()
        embraceModuleSpy.getCurrentSessionId(idPromise)
        return argumentCaptor<String>().apply { verify(idPromise).resolve(capture()) }.firstValue
    }

    private fun endedSessionSpan(userSessionId: String): ReadableSpan =
        spanProcessor.spans.single { it.name == "emb-session" && it.attributes["emb.user_session_id"] == userSessionId }
}

private class TestSpanProcessor : SpanProcessor {
    val spans = CopyOnWriteArrayList<ReadableSpan>()

    override fun onStart(span: ReadWriteSpan, parentContext: Context) {}
    override fun onEnding(span: ReadWriteSpan) {}
    override fun onEnd(span: ReadableSpan) {
        if (!span.attributes.containsKey("emb.private")) {
            spans.add(span)
        }
    }
    override fun isStartRequired() = false
    override fun isEndRequired() = true
    override suspend fun forceFlush() = OperationResultCode.Success
    override suspend fun shutdown() = OperationResultCode.Success
}

private class TestLogRecordProcessor : LogRecordProcessor {
    val logs = CopyOnWriteArrayList<ReadWriteLogRecord>()

    override fun onEmit(log: ReadWriteLogRecord, context: Context) {
        if (!log.attributes.containsKey("emb.private")) {
            logs.add(log)
        }
    }
    override suspend fun forceFlush() = OperationResultCode.Success
    override suspend fun shutdown() = OperationResultCode.Success
}
