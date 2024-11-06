plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)

    id("io.gitlab.arturbosch.detekt") version("1.23.6")
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

    useLibrary("android.test.mock")

    buildToolsVersion = "33.0.0"
    ndkVersion = "20.1.5948944"
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)

    // react native 0.75.x
    implementation("com.facebook.react:react-android:+")

    // TBD: use local package
     implementation(project(":react-native-otlp"))

    testImplementation(libs.junit)
    testImplementation("org.mockito.kotlin:mockito-kotlin:5.3.1")
    testImplementation("io.mockk:mockk:1.13.11")

    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)

    add("detektPlugins", "io.gitlab.arturbosch.detekt:detekt-formatting:1.23.6")
}

detekt {
    buildUponDefaultConfig = true
    autoCorrect = true
    config.from(project.files("${project.rootDir}/config/detekt/detekt.yml"))
}

apply("../../../android/dependencies.gradle")