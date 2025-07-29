// Top-level build file where you can add configuration options common to all sub-projects/modules.

import org.gradle.api.Project
import org.gradle.kotlin.dsl.*
import java.io.File

buildscript {
    extra.apply {
        set("buildToolsVersion", project.findProperty("android.buildToolsVersion") as? String ?: "34.0.0")
        set("minSdkVersion", (project.findProperty("android.minSdkVersion") as? String ?: "23").toInt())
        set("compileSdkVersion", (project.findProperty("android.compileSdkVersion") as? String ?: "34").toInt())
        set("targetSdkVersion", (project.findProperty("android.targetSdkVersion") as? String ?: "34").toInt())
        set("kotlinVersion", project.findProperty("android.kotlinVersion") as? String ?: "1.9.23")
        set("ndkVersion", "26.1.10909125")
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

apply(plugin = "com.facebook.react.rootproject")

allprojects {
    repositories {
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url = uri(File(listOf("node", "--print", "require.resolve('react-native/package.json')")
                .execute(null, rootDir).text.trim(), "../android"))
        }
        maven {
            // Android JSC is installed from npm
            url = uri(File(listOf("node", "--print", "require.resolve('jsc-android/package.json', { paths: [require.resolve('react-native/package.json')] })")
                .execute(null, rootDir).text.trim(), "../dist"))
        }

        google()
        mavenCentral()
        maven { url = uri("https://www.jitpack.io") }
    }
}