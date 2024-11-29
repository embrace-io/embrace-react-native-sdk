package io.embrace.rnembracecoretest

import android.os.SystemClock
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.common.SystemClock.currentTimeMillis
import io.embrace.android.embracesdk.Embrace
import io.embrace.android.embracesdk.network.EmbraceNetworkRequest
import io.embrace.android.embracesdk.network.http.HttpMethod
import io.embrace.rnembracecore.EmbraceManagerModule
import org.junit.Before
import org.junit.Test
import org.junit.jupiter.api.AfterEach
import org.junit.runner.RunWith
import org.mockito.MockedStatic
import org.mockito.Mockito
import org.mockito.Mockito.spy
import org.mockito.kotlin.mock
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class RNEmbraceCoreTest {
    private val promise: Promise = mock()
    private val mockEmbrace = Mockito.mock<Embrace>()

    @Before
    fun setUp() {
        Mockito.mockStatic(SystemClock::class.java).use {
            Mockito.`when`(SystemClock.uptimeMillis()).thenReturn(1000L)
        }
    }

    @AfterEach
    fun clearMocks() {
        Mockito.reset(promise)
    }

    @Test
    fun testStartNativeEmbraceSDK() {
        val context: ReactApplicationContext = mock()
        val embraceModule = EmbraceManagerModule(context)

        Mockito.mockStatic(Embrace::class.java).use { mockedEmbraceStatic ->
            mockedEmbraceStatic.`when`<Any>(Embrace::getInstance).thenReturn(mockEmbrace)

            embraceModule.startNativeEmbraceSDK(JavaOnlyMap(), promise)

            verify(mockEmbrace).start(context.getApplicationContext(), false, Embrace.AppFramework.REACT_NATIVE)

            // embrace starts without issues
            verify(promise, times(1)).resolve(true)
        }
    }

    @Test
    fun testLogNetworkRequest() {
        val context: ReactApplicationContext = mock()
        val embraceModuleSpy = spy(EmbraceManagerModule(context))

        val mockTraceparent = "traceparent-123"
        whenever(embraceModuleSpy.generateW3cTraceparent()).thenReturn(mockTraceparent)

        Mockito.mockStatic(EmbraceNetworkRequest::class.java).use { mockedStatic: MockedStatic<EmbraceNetworkRequest> ->
            val url = "http://request.com/v1/all"
            val httpMethod = "GET"
            val startTime = currentTimeMillis().toDouble()
            val endTime = currentTimeMillis().toDouble() + 400000
            val bytesSent = 12938
            val bytesReceived = 199
            val statusCode = 200

            whenever(embraceModuleSpy.isNetworkSpanForwardingEnabled()).thenReturn(true)
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

            mockedStatic.verify {
                EmbraceNetworkRequest.fromCompletedRequest(
                    url,
                    HttpMethod.GET,
                    startTime.toLong(),
                    endTime.toLong(),
                    bytesSent.toLong(),
                    bytesReceived.toLong(),
                    statusCode,
                    null,
                    mockTraceparent,
                    null
                )
            }

            verify(promise, times(1)).resolve(true)

            whenever(embraceModuleSpy.isNetworkSpanForwardingEnabled()).thenReturn(false)
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

            mockedStatic.verify {
                EmbraceNetworkRequest.fromCompletedRequest(
                    url,
                    HttpMethod.GET,
                    startTime.toLong(),
                    endTime.toLong(),
                    bytesSent.toLong(),
                    bytesReceived.toLong(),
                    statusCode,
                    null,
                    null,
                    null
                )
            }

            verify(promise, times(2)).resolve(true)
        }
    }

    @Test
    fun testLogNetworkClientError() {
        val context: ReactApplicationContext = mock()
        val embraceModuleSpy = spy(EmbraceManagerModule(context))

        val mockTraceparent = "traceparent-123"
        whenever(embraceModuleSpy.generateW3cTraceparent()).thenReturn(mockTraceparent)

        Mockito.mockStatic(EmbraceNetworkRequest::class.java).use { mockedStatic: MockedStatic<EmbraceNetworkRequest> ->
            val url = "http://request.com/v1/all"
            val httpMethod = "POST"
            val startTime = currentTimeMillis().toDouble()
            val endTime = currentTimeMillis().toDouble() + 400000
            val errorType = "Bad Request"
            val errorMessage = "Error message"

            whenever(embraceModuleSpy.isNetworkSpanForwardingEnabled()).thenReturn(true)
            embraceModuleSpy.logNetworkClientError(
                url,
                httpMethod,
                startTime,
                endTime,
                errorType,
                errorMessage,
                promise,
            )

            mockedStatic.verify {
                EmbraceNetworkRequest.fromIncompleteRequest(
                    url,
                    HttpMethod.POST,
                    startTime.toLong(),
                    endTime.toLong(),
                    errorType,
                    errorMessage,
                    null,
                    mockTraceparent,
                    null
                )
            }

            verify(promise, times(1)).resolve(true)

            whenever(embraceModuleSpy.isNetworkSpanForwardingEnabled()).thenReturn(false)
            embraceModuleSpy.logNetworkClientError(
                url,
                httpMethod,
                startTime,
                endTime,
                errorType,
                errorMessage,
                promise,
            )

            mockedStatic.verify {
                EmbraceNetworkRequest.fromIncompleteRequest(
                    url,
                    HttpMethod.POST,
                    startTime.toLong(),
                    endTime.toLong(),
                    errorType,
                    errorMessage,
                    null,
                    null,
                    null
                )
            }

            verify(promise, times(2)).resolve(true)
        }
    }
}
