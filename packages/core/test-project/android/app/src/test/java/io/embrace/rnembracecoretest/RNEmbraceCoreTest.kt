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
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.Promise
import io.embrace.android.embracesdk.Embrace
import io.embrace.rnembracecore.EmbraceManagerModule
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.opentelemetry.api.common.AttributeKey
import io.opentelemetry.sdk.common.CompletableResultCode
import io.opentelemetry.sdk.logs.data.LogRecordData
import io.opentelemetry.sdk.logs.export.LogRecordExporter
import io.opentelemetry.sdk.trace.export.SpanExporter
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyInt
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.clearInvocations
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.timeout
import org.mockito.kotlin.verify

class RNEmbraceCoreTest {
    companion object {
        private val embraceModule = Mockito.spy(EmbraceManagerModule(mock()))

        private lateinit var spanExporter: SpanExporter
        private lateinit var logExporter: LogRecordExporter
        private lateinit var promise: Promise
        private lateinit var embraceInstance: Embrace

        @JvmStatic
        fun startEmbraceSDK(spanExporter: SpanExporter, logExporter: LogRecordExporter) {
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
            embraceInstance.addSpanExporter(spanExporter)
            embraceInstance.addLogRecordExporter(logExporter)
            embraceInstance.start(mockApplication, Embrace.AppFramework.REACT_NATIVE)
            assertTrue(Embrace.getInstance().isStarted)
            return
        }

        @JvmStatic
        @BeforeAll
        fun beforeAll() {
            promise = mock()
            spanExporter = mock {
                on { export(any()) } doReturn CompletableResultCode.ofSuccess()
            }

            logExporter = mock {
                on { export(any()) } doReturn CompletableResultCode.ofSuccess()
            }

            startEmbraceSDK(spanExporter, logExporter)
        }
    }

    @BeforeEach
    fun beforeEach() {
        clearInvocations(spanExporter)
        clearInvocations(logExporter)
        clearInvocations(promise)
    }

    @Test
    fun logMessageWithSeverityAndProperties() {
        val properties = JavaOnlyMap().apply {
            putString("custom.property1", "value.for-custom-property1")
            putString("custom.property2", "value.for-custom-property2")
        }

        embraceModule.logMessageWithSeverityAndProperties("a nice warning message", "warning", properties, "stacktrace as string", promise)
        embraceModule.logMessageWithSeverityAndProperties("a nice warning message without stacktrace", "warning", properties, "", promise)

        embraceModule.logMessageWithSeverityAndProperties("a nice error message", "error", properties, "stacktrace as string", promise)
        embraceModule.logMessageWithSeverityAndProperties("a nice error message without stacktrace", "error", properties, "", promise)

        // won't add the stacktrace as per product's decision
        embraceModule.logMessageWithSeverityAndProperties("a nice info message", "info", properties, "stacktrace as string", promise)
        embraceModule.logMessageWithSeverityAndProperties("a nice info message without properties", "info", JavaOnlyMap(), "", promise)

        // receiving severity as a non-expected value
        embraceModule.logMessageWithSeverityAndProperties("a message without severity", "non-expected-value", JavaOnlyMap(), "stacktrace as string", promise)

        argumentCaptor<Collection<LogRecordData>>().apply {
            verify(logExporter, timeout(200).times(7)).export(capture())
            assertEquals(7, allValues.size)

            val warningLog = allValues[0].asSequence().withIndex().elementAt(0).value
            assertEquals("WARNING", warningLog.severityText)
            assertEquals("a nice warning message", warningLog.body.asString())
            assertEquals("value.for-custom-property1", warningLog.attributes.get(AttributeKey.stringKey("custom.property1")))
            assertEquals("value.for-custom-property2", warningLog.attributes.get(AttributeKey.stringKey("custom.property2")))
            assertEquals("stacktrace as string", warningLog.attributes.get(AttributeKey.stringKey("emb.stacktrace.rn")))
            assertEquals("sys.log", warningLog.attributes.get(AttributeKey.stringKey("emb.type")))
            assertEquals(6, warningLog.attributes.size())
            assertNotNull(warningLog.attributes.get(AttributeKey.stringKey("log.record.uid")))

            val warningLogNoStacktrace = allValues[1].asSequence().withIndex().elementAt(0).value
            assertEquals("WARNING", warningLogNoStacktrace.severityText)
            assertEquals("a nice warning message without stacktrace", warningLogNoStacktrace.body.asString())
            assertEquals("value.for-custom-property1", warningLogNoStacktrace.attributes.get(AttributeKey.stringKey("custom.property1")))
            assertEquals("value.for-custom-property2", warningLogNoStacktrace.attributes.get(AttributeKey.stringKey("custom.property2")))
            assertEquals("sys.log", warningLogNoStacktrace.attributes.get(AttributeKey.stringKey("emb.type")))
            assertEquals(5, warningLogNoStacktrace.attributes.size())
            assertNotNull(warningLogNoStacktrace.attributes.get(AttributeKey.stringKey("log.record.uid")))
            // no stacktrace if passing empty string
            assertNull(warningLogNoStacktrace.attributes.get(AttributeKey.stringKey("emb.stacktrace.rn")))

            val errorLog = allValues[2].asSequence().withIndex().elementAt(0).value
            assertEquals("ERROR", errorLog.severityText)
            assertEquals("a nice error message", errorLog.body.asString())
            assertEquals("value.for-custom-property1", errorLog.attributes.get(AttributeKey.stringKey("custom.property1")))
            assertEquals("value.for-custom-property2", errorLog.attributes.get(AttributeKey.stringKey("custom.property2")))
            assertEquals("stacktrace as string", errorLog.attributes.get(AttributeKey.stringKey("emb.stacktrace.rn")))
            assertEquals("sys.log", errorLog.attributes.get(AttributeKey.stringKey("emb.type")))
            assertEquals(6, errorLog.attributes.size())
            assertNotNull(errorLog.attributes.get(AttributeKey.stringKey("log.record.uid")))

            val errorLogNoStacktrace = allValues[3].asSequence().withIndex().elementAt(0).value
            assertEquals("ERROR", errorLogNoStacktrace.severityText)
            assertEquals("a nice error message without stacktrace", errorLogNoStacktrace.body.asString())
            assertEquals("value.for-custom-property1", errorLogNoStacktrace.attributes.get(AttributeKey.stringKey("custom.property1")))
            assertEquals("value.for-custom-property2", errorLogNoStacktrace.attributes.get(AttributeKey.stringKey("custom.property2")))
            assertEquals("sys.log", errorLogNoStacktrace.attributes.get(AttributeKey.stringKey("emb.type")))
            assertEquals(5, errorLogNoStacktrace.attributes.size())
            assertNotNull(errorLogNoStacktrace.attributes.get(AttributeKey.stringKey("log.record.uid")))
            // no stacktrace if passing empty string
            assertNull(errorLogNoStacktrace.attributes.get(AttributeKey.stringKey("emb.stacktrace.rn")))

            val infoLog = allValues[4].asSequence().withIndex().elementAt(0).value
            assertEquals("INFO", infoLog.severityText)
            assertEquals("a nice info message", infoLog.body.asString())
            assertEquals("value.for-custom-property1", infoLog.attributes.get(AttributeKey.stringKey("custom.property1")))
            assertEquals("value.for-custom-property2", infoLog.attributes.get(AttributeKey.stringKey("custom.property2")))
            assertEquals("sys.log", infoLog.attributes.get(AttributeKey.stringKey("emb.type")))
            assertEquals(5, infoLog.attributes.size())
            assertNotNull(infoLog.attributes.get(AttributeKey.stringKey("log.record.uid")))
            // no stacktrace if passing an stacktrace as product's desicion
            assertNull(infoLog.attributes.get(AttributeKey.stringKey("emb.stacktrace.rn")))

            val infoLogNoProperties = allValues[5].asSequence().withIndex().elementAt(0).value
            assertEquals("INFO", infoLogNoProperties.severityText)
            assertEquals("a nice info message without properties", infoLogNoProperties.body.asString())
            assertEquals("sys.log", infoLogNoProperties.attributes.get(AttributeKey.stringKey("emb.type")))
            assertEquals(3, infoLogNoProperties.attributes.size())
            assertNotNull(infoLogNoProperties.attributes.get(AttributeKey.stringKey("log.record.uid")))
            assertNull(infoLogNoProperties.attributes.get(AttributeKey.stringKey("emb.stacktrace.rn")))

            val logWithNoSeverity = allValues[6].asSequence().withIndex().elementAt(0).value
            assertEquals("ERROR", logWithNoSeverity.severityText)
            assertEquals("a message without severity", logWithNoSeverity.body.asString())
            assertEquals("sys.log", logWithNoSeverity.attributes.get(AttributeKey.stringKey("emb.type")))
            assertEquals(4, logWithNoSeverity.attributes.size())
            assertNotNull(logWithNoSeverity.attributes.get(AttributeKey.stringKey("log.record.uid")))
            assertEquals("stacktrace as string", logWithNoSeverity.attributes.get(AttributeKey.stringKey("emb.stacktrace.rn")))
        }
    }
}
