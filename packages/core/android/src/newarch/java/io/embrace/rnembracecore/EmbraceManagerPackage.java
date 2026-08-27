package io.embrace.rnembracecore;

import com.facebook.react.BaseReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;

public class EmbraceManagerPackage extends BaseReactPackage {
    @Nullable
    @Override
    public NativeModule getModule(String name, ReactApplicationContext reactContext) {
        if (EmbraceManagerModuleImpl.NAME.equals(name)) {
            return new EmbraceManagerModule(reactContext);
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

            return moduleInfos;
        };
    }
}
