package io.embrace.rnembraceotlp

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class RNEmbraceOTLPPackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == RNEmbraceOTLPModuleImpl.NAME) {
            RNEmbraceOTLPModule(reactContext)
        } else {
            null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                RNEmbraceOTLPModuleImpl.NAME to ReactModuleInfo(
                    RNEmbraceOTLPModuleImpl.NAME,
                    RNEmbraceOTLPModuleImpl.NAME,
                    false,
                    false,
                    false,
                    true
                )
            )
        }
    }
}
