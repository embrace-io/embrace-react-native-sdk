package io.embrace.rnembraceotlptest

import com.facebook.react.bridge.ReactApplicationContext
import io.embrace.rnembraceotlp.RNEmbraceOTLPModule
import org.junit.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.clearInvocations
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.times
import org.mockito.kotlin.verify


import org.junit.Assert.*

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class RNEmbraceOTLPTest {
    @Test
    fun addition_isCorrect() {
        val context: ReactApplicationContext = mock()
        val otlpModule = RNEmbraceOTLPModule(context);
    }
}