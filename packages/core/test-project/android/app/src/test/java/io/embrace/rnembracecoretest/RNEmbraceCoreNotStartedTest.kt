package io.embrace.rnembracecoretest

import com.facebook.react.bridge.JavaOnlyMap
import io.embrace.android.embracesdk.Embrace
import io.embrace.android.embracesdk.internal.ReactNativeInternalInterface
import io.embrace.rnembracecore.EmbraceManagerModuleImpl
import org.junit.Assert.assertFalse
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verifyNoInteractions
import org.mockito.kotlin.whenever
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class RNEmbraceCoreNotStartedTest {
    @Test
    fun initializeReactNativeSDKWhenNotStarted() {
        val rn: ReactNativeInternalInterface = mock()
        val module = Mockito.spy(EmbraceManagerModuleImpl(mock()))
        doReturn(rn).whenever(module).reactNativeInternalInterface

        val started = module.initializeReactNativeSDK(
            JavaOnlyMap().apply {
                putString("reactNativeVersion", "0.85.0")
                putString("sdkVersion", "8.0.0")
                putString("javaScriptPatchNumber", "patch-1")
            },
        )

        assertFalse(Embrace.isStarted)
        assertFalse(started)
        verifyNoInteractions(rn)
    }
}
