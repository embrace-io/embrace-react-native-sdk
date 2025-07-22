// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}

buildscript {
    extra.apply {
        set("buildToolsVersion", "35.0.0")
        set("minSdkVersion", 24)
        set("compileSdkVersion", 35)
        set("targetSdkVersion",34)
        set("ndkVersion", "26.1.10909125")
        set("kotlinVersion", "2.0.21")
    }

    repositories {
        google()
        mavenCentral()
    }

    dependencies {
        classpath("com.android.tools.build:gradle")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
    }
}

