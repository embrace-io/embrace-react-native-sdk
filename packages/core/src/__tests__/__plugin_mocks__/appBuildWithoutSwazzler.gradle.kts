plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.facebook.react")
}

val projectRoot = rootDir.absoluteFile.parentFile.absolutePath

fun versionToNumber(major: Int, minor: Int, patch: Int): Int {
    return patch * 100 + minor * 10000 + major * 1000000
}

fun getRNVersion(): Int {
    val version = provider {
        exec {
            workingDir = projectDir
            commandLine("node", "-e", "console.log(require('react-native/package.json').version);")
        }.standardOutput.asText.get().trim()
    }

    val coreVersion = version.split("-")[0]
    val (major, minor, patch) = coreVersion.split('.').map { it.toInt() }

    return versionToNumber(major, minor, patch)
}

val rnVersion = getRNVersion()

