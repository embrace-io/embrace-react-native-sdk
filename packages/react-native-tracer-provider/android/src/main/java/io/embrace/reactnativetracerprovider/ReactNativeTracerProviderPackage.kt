package io.embrace.reactnativetracerprovider

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class ReactNativeTracerProviderPackage : TurboReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == ReactNativeTracerProviderModule.NAME) {
            ReactNativeTracerProviderModule(reactContext)
        } else {
            null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            val isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            mapOf(
                ReactNativeTracerProviderModule.NAME to ReactModuleInfo(
                    ReactNativeTracerProviderModule.NAME,
                    ReactNativeTracerProviderModule.NAME,
                    false, // canOverrideExistingModule
                    false, // needsEagerInit
                    false, // isCxxModule
                    isTurboModule // isTurboModule
                )
            )
        }
    }
}
