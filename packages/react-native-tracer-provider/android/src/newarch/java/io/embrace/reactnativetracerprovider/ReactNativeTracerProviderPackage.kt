package io.embrace.reactnativetracerprovider

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class ReactNativeTracerProviderPackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == ReactNativeTracerProviderModuleImpl.NAME) {
            ReactNativeTracerProviderModule(reactContext)
        } else {
            null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                ReactNativeTracerProviderModuleImpl.NAME to ReactModuleInfo(
                    ReactNativeTracerProviderModuleImpl.NAME,
                    ReactNativeTracerProviderModuleImpl.NAME,
                    false, // canOverrideExistingModule
                    false, // needsEagerInit
                    false, // isCxxModule
                    true // isTurboModule
                )
            )
        }
    }
}
