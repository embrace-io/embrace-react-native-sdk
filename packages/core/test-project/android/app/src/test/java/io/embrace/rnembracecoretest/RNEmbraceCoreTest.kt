package io.embrace.rnembracecoretest

import android.app.Application
import android.content.Context
import android.content.SharedPreferences
import android.content.SharedPreferences.Editor
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.content.res.Resources
import android.os.Looper
import android.preference.PreferenceManager
import com.facebook.react.bridge.Promise
import com.facebook.react.common.SystemClock.currentTimeMillis
import io.embrace.android.embracesdk.Embrace
import io.embrace.android.embracesdk.network.http.HttpMethod
import io.embrace.rnembracecore.EmbraceManagerModule
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.opentelemetry.api.common.AttributeKey
import io.opentelemetry.sdk.common.CompletableResultCode
import io.opentelemetry.sdk.trace.data.SpanData
import io.opentelemetry.sdk.trace.export.SpanExporter
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test // `Test` should be imported from `jupiter` instead of `junit` for cases to be recognized
import org.mockito.ArgumentMatchers.anyInt
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.clearInvocations
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class RNEmbraceCoreTest {
    companion object {
        private val embraceModuleSpy = Mockito.spy(EmbraceManagerModule(mock()))

        private lateinit var exporter: SpanExporter
        private lateinit var promise: Promise
        private lateinit var embraceInstance: Embrace

        @JvmStatic
        fun startEmbraceSDK(exporter: SpanExporter) {
            mockkStatic(PreferenceManager::class)
            every { PreferenceManager.getDefaultSharedPreferences(any()) } returns mock<SharedPreferences> {
                on { getBoolean(any(), any()) } doReturn false
                on { edit() } doReturn mock<Editor>()
            }

            mockkStatic(Looper::class)
            val looper = mockk<Looper> {
                every { thread } returns Thread.currentThread()
            }
            every { Looper.getMainLooper() } returns looper

            val mockResources = mock<Resources> {
                on { getString(any()) } doReturn "my-resource"
                on { getIdentifier(any(), any(), any()) } doReturn 0
            }

            val mockPackageInfo = PackageInfo()
            mockPackageInfo.packageName = "mocked-package"

            val mockPackageManager = mock<PackageManager> {
                on { getPackageInfo(anyString(), anyInt()) } doReturn mockPackageInfo
            }

            val mockApplication: Application = mock {
                on { packageName } doReturn "mocked-package"
                on { applicationContext } doReturn mock<Context>()
                on { resources } doReturn mockResources
                on { applicationInfo } doReturn mock<ApplicationInfo>()
                on { packageManager } doReturn mockPackageManager
            }

            // Start the Embrace SDK
            embraceInstance = Embrace.getInstance()
            embraceInstance.addSpanExporter(exporter)
            embraceInstance.start(mockApplication, Embrace.AppFramework.REACT_NATIVE)
            assertTrue(Embrace.getInstance().isStarted)
            return
        }

        @JvmStatic
        @BeforeAll
        fun beforeAll() {
            promise = mock()
            exporter = mock {
                on { export(any()) } doReturn CompletableResultCode.ofSuccess()
            }

            startEmbraceSDK(exporter)
        }
    }

    @BeforeEach
    fun beforeEach() {
        clearInvocations(exporter)
        clearInvocations(promise)
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
        argumentCaptor<Collection<SpanData>>().apply {
            verify(exporter, times(1)).export(capture())
            assertEquals(1, allValues.size)

            val spans = allValues[0].asSequence().withIndex()
            val spanWithTraceparent = spans.elementAt(0).value

            assertEquals(1, spans.count())
            assertEquals(
                "traceparent-log-network-request",
                spanWithTraceparent.attributes.get(AttributeKey.stringKey("emb.w3c_traceparent"))
            )
            assertEquals("http://request.com/v1/log/network/request", spanWithTraceparent.attributes.get(AttributeKey.stringKey("url.full")))
            assertEquals("200", spanWithTraceparent.attributes.get(AttributeKey.stringKey("http.response.status_code")))
            assertEquals("perf.network_request", spanWithTraceparent.attributes.get(AttributeKey.stringKey("emb.type")))
            assertEquals("12938", spanWithTraceparent.attributes.get(AttributeKey.stringKey("http.request.body.size")))
            assertEquals(HttpMethod.GET.toString(), spanWithTraceparent.attributes.get(AttributeKey.stringKey("http.request.method")))
            assertEquals("199", spanWithTraceparent.attributes.get(AttributeKey.stringKey("http.response.body.size")))
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
        argumentCaptor<Collection<SpanData>>().apply {
            verify(exporter, times(2)).export(capture())
            assertEquals(2, allValues.size)

            val spans = allValues[1].asSequence().withIndex()
            val noTraceparentSpan = spans.elementAt(0).value

            assertEquals(1, spans.count())
            assertNull(noTraceparentSpan.attributes.get(AttributeKey.stringKey("emb.w3c_traceparent")))
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
        argumentCaptor<Collection<SpanData>>().apply {
            verify(exporter, times(1)).export(capture())
            assertEquals(1, allValues.size)

            val spans = allValues[0].asSequence().withIndex()
            val spanWithTraceparent = spans.elementAt(0).value

            assertEquals(1, spans.count())
            assertEquals("emb-POST /v1/log/network/client/error", spanWithTraceparent.name)
            assertEquals(
                "traceparent-log-network-client-error",
                spanWithTraceparent.attributes.get(AttributeKey.stringKey("emb.w3c_traceparent"))
            )
            assertEquals("failure", spanWithTraceparent.attributes.get(AttributeKey.stringKey("emb.error_code")))
            assertEquals("perf.network_request", spanWithTraceparent.attributes.get(AttributeKey.stringKey("emb.type")))
            assertEquals("POST", spanWithTraceparent.attributes.get(AttributeKey.stringKey("http.request.method")))
            assertEquals("Error message", spanWithTraceparent.attributes.get(AttributeKey.stringKey("exception.message")))
            assertEquals("Bad Request", spanWithTraceparent.attributes.get(AttributeKey.stringKey("error.type")))
            assertEquals("http://request.com/v1/log/network/client/error", spanWithTraceparent.attributes.get(AttributeKey.stringKey("url.full")))
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
        argumentCaptor<Collection<SpanData>>().apply {
            verify(exporter, times(2)).export(capture())
            assertEquals(2, allValues.size)

            val spans = allValues[1].asSequence().withIndex()
            val noTraceparentSpan = spans.elementAt(0).value

            assertEquals(1, spans.count())
            assertNull(noTraceparentSpan.attributes.get(AttributeKey.stringKey("emb.w3c_traceparent")))
        }

        verify(promise, times(2)).resolve(true)
    }
}
