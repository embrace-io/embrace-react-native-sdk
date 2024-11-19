package io.embrace.embracewrappertest

import android.os.SystemClock
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import io.embrace.embracewrapper.EmbraceManagerModule
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito.mockStatic
import org.mockito.Mockito.`when`
import org.mockito.kotlin.mock
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class RNEmbraceCoreTest {
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
        val embraceModule = EmbraceManagerModule(context)

        embraceModule.startNativeEmbraceSDK(JavaOnlyMap(), promise)

        // embrace starts without issues
        verify(promise, times(1)).resolve(true)
    }
}
