package io.embrace.rnembraceotlptest

import android.os.SystemClock
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import io.embrace.rnembraceotlp.RNEmbraceOTLPModule
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito
import org.mockito.kotlin.mock
import org.mockito.kotlin.times
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import org.mockito.kotlin.verify

class RNEmbraceOTLPTest {
    val promise: Promise = mock()

    @Before
    fun setUp() {
        // Mocking SystemClock.uptimeMillis() using Mockito
        Mockito.mockStatic(SystemClock::class.java)
        Mockito.`when`(SystemClock.uptimeMillis()).thenReturn(123456789L)
    }

    @Test
    fun testStartNativeEmbraceSDK() {
        val context: ReactApplicationContext = mock()
        val embraceOTLPModule = RNEmbraceOTLPModule(context)

        val sdkConfig: ReadableMap = WritableNativeMap()
        val otlpConfig: ReadableMap = JavaOnlyMap()

        embraceOTLPModule.startNativeEmbraceSDK(sdkConfig, otlpConfig, promise)

        // embrace starts
        verify(promise, times(1)).resolve(true)
    }
}
