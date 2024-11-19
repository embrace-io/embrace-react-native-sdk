package io.embrace.rnembraceotlptest

import android.os.SystemClock
import com.facebook.react.bridge.JavaOnlyArray
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import io.embrace.rnembraceotlp.RNEmbraceOTLPModule
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito
import org.mockito.kotlin.mock
import org.mockito.kotlin.times
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.WritableMap
import org.junit.runner.RunWith
import org.mockito.Mockito.mockStatic
import org.mockito.Mockito.`when`
import org.mockito.kotlin.verify
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class RNEmbraceOTLPTest {
    private val promise: Promise = mock()

    @Before
    fun setUp() {
        mockStatic(SystemClock::class.java).use {
            `when`(SystemClock.uptimeMillis()).thenReturn(1000L)
        }
    }

    @Test
    fun testStartNativeEmbraceSDK() {
        val context: ReactApplicationContext = mock()
        val embraceOTLPModule = RNEmbraceOTLPModule(context)
        val otlpConfig: WritableMap = JavaOnlyMap()

        val traceExporter: WritableMap = JavaOnlyMap().apply {
            putString("endpoint", "https://test-trace-endpoint/v1")
            putArray("headers", JavaOnlyArray().apply {
                pushMap(JavaOnlyMap().apply {
                    putString("key", "key_for_header")
                    putString("token", "token_for_header")
                })
            })
            putDouble("timeout", 3000.0)
        }

        val logExporter: WritableMap = JavaOnlyMap().apply {
            putString("endpoint", "https://test-log-endpoint/v1")
            putArray("headers", JavaOnlyArray().apply {
                pushMap(JavaOnlyMap().apply {
                    putString("key", "key_for_header")
                    putString("token", "token_for_header")
                })
            })
            putDouble("timeout", 1000.0)
        }

        otlpConfig.putMap("traceExporter", traceExporter)
        otlpConfig.putMap("logExporter", logExporter)

        embraceOTLPModule.startNativeEmbraceSDK(JavaOnlyMap(), otlpConfig, promise)

        // embrace starts without issues
        verify(promise, times(1)).resolve(true)
    }

    @Test
    fun testStartWithMissingExporters() {
        val context: ReactApplicationContext = mock()
        val embraceOTLPModule = RNEmbraceOTLPModule(context)

        embraceOTLPModule.startNativeEmbraceSDK(JavaOnlyMap(), JavaOnlyMap(), promise)

        // embrace starts without issues if empty object is passed down to the export configuration
        verify(promise, times(1)).resolve(true)
    }

    @Test
    fun testStartWithTraceExporterOnly() {
        val context: ReactApplicationContext = mock()
        val embraceOTLPModule = RNEmbraceOTLPModule(context)
        val otlpConfig: WritableMap = JavaOnlyMap()

        val traceExporter: WritableMap = JavaOnlyMap().apply {
            putString("endpoint", "https://test-trace-endpoint/v1")
            putArray("headers", JavaOnlyArray().apply {
                pushMap(JavaOnlyMap().apply {
                    putString("key", "key_for_header")
                    putString("token", "token_for_header")

                    putString("key2", "key_for_header")
                    putString("token2", "token_for_header")
                })
            })
            putDouble("timeout", 4000.0)
        }

        otlpConfig.putMap("traceExporter", traceExporter)

        embraceOTLPModule.startNativeEmbraceSDK(JavaOnlyMap(), otlpConfig, promise)

        // embrace starts without issues if only trace export config is found
        verify(promise, times(1)).resolve(true)
    }

    @Test
    fun testStartWithLogExporterOnly() {
        val context: ReactApplicationContext = mock()
        val embraceOTLPModule = RNEmbraceOTLPModule(context)
        val otlpConfig: WritableMap = JavaOnlyMap()

        val logExporter: WritableMap = JavaOnlyMap().apply {
            putString("endpoint", "https://test-log-endpoint/v1")
            putArray("headers", JavaOnlyArray().apply {
                pushMap(JavaOnlyMap().apply {
                    putString("key", "key_for_header")
                    putString("token", "token_for_header")

                    putString("key2", "key_for_header")
                    putString("token2", "token_for_header")
                })
            })
            putDouble("timeout", 5000.0)
        }

        otlpConfig.putMap("logExporter", logExporter)

        embraceOTLPModule.startNativeEmbraceSDK(JavaOnlyMap(), otlpConfig, promise)

        // embrace starts without issues if only log export config is found
        verify(promise, times(1)).resolve(true)
    }
}
