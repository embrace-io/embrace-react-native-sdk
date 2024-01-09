#include <jni.h>
#include <string>

extern "C" JNIEXPORT jstring JNICALL
Java_com_embracetestsuite_RCCrashes_stringFromJNI(
        JNIEnv* env,
        jobject /* this */) {
    std::string hello = "Hello, I'm a native crash test app :)";
    return env->NewStringUTF(hello.c_str());
}
