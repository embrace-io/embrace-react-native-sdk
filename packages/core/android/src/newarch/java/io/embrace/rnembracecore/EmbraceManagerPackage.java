package io.embrace.rnembracecore;

import com.facebook.react.BaseReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;

import io.embrace.reactnativetracerprovider.ReactNativeTracerProviderModule;
import io.embrace.reactnativetracerprovider.ReactNativeTracerProviderModuleImpl;

public class EmbraceManagerPackage extends BaseReactPackage {
    @Nullable
    @Override
    public NativeModule getModule(String name, ReactApplicationContext reactContext) {
        if (EmbraceManagerModuleImpl.NAME.equals(name)) {
            return new EmbraceManagerModule(reactContext);
        }

        if (ReactNativeTracerProviderModuleImpl.NAME.equals(name)) {
            return new ReactNativeTracerProviderModule(reactContext);
        }

        return null;
    }

    @Override
    public ReactModuleInfoProvider getReactModuleInfoProvider() {
        return () -> {
            final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();

            moduleInfos.put(EmbraceManagerModuleImpl.NAME, new ReactModuleInfo(
                    EmbraceManagerModuleImpl.NAME,
                    EmbraceManagerModuleImpl.NAME,
                    false, // canOverrideExistingModule
                    false, // needsEagerInit
                    false, // isCXXModule
                    true // isTurboModule
            ));

            moduleInfos.put(ReactNativeTracerProviderModuleImpl.NAME, new ReactModuleInfo(
                    ReactNativeTracerProviderModuleImpl.NAME,
                    ReactNativeTracerProviderModuleImpl.NAME,
                    false,
                    false,
                    false,
                    true
            ));

            return moduleInfos;
        };
    }
}
