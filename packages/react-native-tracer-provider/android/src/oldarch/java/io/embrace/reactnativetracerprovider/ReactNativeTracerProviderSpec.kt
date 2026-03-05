package io.embrace.reactnativetracerprovider

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

abstract class ReactNativeTracerProviderSpec(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext)
