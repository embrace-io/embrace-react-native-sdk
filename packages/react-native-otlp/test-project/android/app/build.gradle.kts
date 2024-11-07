plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)

//    id("io.gitlab.arturbosch.detekt") version("1.23.6")
}

android {
    namespace = "io.embrace.rnembraceotlptest"
    compileSdk = 34

    defaultConfig {
        applicationId = "io.embrace.rnembraceotlptest"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    useLibrary("android.test.mock")
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildToolsVersion = "33.0.0"
    ndkVersion = "26.1.10909125"

    defaultConfig {
        ndk {
            abiFilters += listOf("armeabi-v7a", "x86", "x86_64")
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)

    // fixing java.lang.UnsatisfiedLinkError during tests
    implementation("com.facebook.fresco:fresco:2.0.0")
    // react native 0.75.x
    implementation("com.facebook.react:react-android:+")

    // using package locally
    implementation(project(":react-native-otlp"))

    implementation("org.webkit:android-jsc:+")

    testImplementation(libs.junit)
    testImplementation("org.junit.jupiter:junit-jupiter:5.8.1")
    testImplementation("junit:junit:4.12")
    testImplementation("org.mockito.kotlin:mockito-kotlin:5.3.1")
    testImplementation("io.mockk:mockk:1.13.11")

    testImplementation("org.robolectric:robolectric:4.8")

    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)

//    add("detektPlugins", "io.gitlab.arturbosch.detekt:detekt-formatting:1.23.6")
}

//detekt {
//    buildUponDefaultConfig = true
//    autoCorrect = true
//    config.from(project.files("${project.rootDir}/config/detekt/detekt.yml"))
//}

apply("../../../android/dependencies.gradle")