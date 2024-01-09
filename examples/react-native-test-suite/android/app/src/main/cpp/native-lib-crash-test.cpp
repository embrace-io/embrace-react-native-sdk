#include <jni.h>
#include <string>
#include <android/log.h>
#include <vector>
#include "TestClass.cpp"

using namespace std;

#ifndef EMB_LOGINFO
#define EMB_LOGINFO(fmt, ...)                                                  \
  __android_log_print(ANDROID_LOG_INFO, "emb_ndk", fmt, ##__VA_ARGS__)
#endif

extern "C" JNIEXPORT jstring JNICALL
Java_com_embracetestsuite_RCCrashes_crash1(
        JNIEnv *env,
        jobject /* this */) {
    EMB_LOGINFO("Attempt to crash the first one: calling abort() method");
    abort();
}

// extern "C" JNIEXPORT jstring JNICALL
// Java_com_nimble_mrtotem_embracetestsuite_RCCrashes_crash2(
//         JNIEnv *env,
//         jobject /* this */) {
//     int a = 0;
//     int b;
//     EMB_LOGINFO("Attempt to crash the second one: trying to divide 1/0");
//     b = 1 / a;
// }

// extern "C" JNIEXPORT jstring JNICALL
// Java_com_nimble_mrtotem_embracetestsuite_RCCrashes_crash3(
//         JNIEnv *env,
//         jobject /* this */) {
//     EMB_LOGINFO("memset");
//     memset((char *) 0x123, 1, 100);
// }

// extern "C" JNIEXPORT jstring JNICALL
// Java_com_nimble_mrtotem_embracetestsuite_RCCrashes_crash4(
//         JNIEnv *env,
//         jobject /* this */) {
//     EMB_LOGINFO("array out of bounds");
//     int foo[10];
//     for (int i = 0; i <= 10; i++) foo[i] = i;
// }

// extern "C" JNIEXPORT jstring JNICALL
// Java_com_nimble_mrtotem_embracetestsuite_RCCrashes_crash6(
//         JNIEnv *env,
//         jobject /* this */) {
//     EMB_LOGINFO("Generating ANR");
//     vector<jstring> memoryEater;
//     char *a = NULL;
//     a = (char *) malloc(SIZE_MAX);
//     while (true) {
//         memoryEater.push_back(env->NewStringUTF(a));
//     }
// }

// extern "C" JNIEXPORT jstring JNICALL
// Java_com_nimble_mrtotem_embracetestsuite_SignalTestActivityKt_executeSIGILLSignal(
//         JNIEnv *env,
//         jclass clazz) {
//     TestClass test;
//     test.sigill();
// }

// extern "C" JNIEXPORT jstring JNICALL
// Java_com_nimble_mrtotem_embracetestsuite_SignalTestActivityKt_executeSIGTRAPSignal(
//         JNIEnv *env,
//         jclass clazz) {
//     TestClass test;
//     test.sigtrap();
// }

// extern "C" JNIEXPORT jstring JNICALL
// Java_com_nimble_mrtotem_embracetestsuite_SignalTestActivityKt_executeSIGBUGSignal(
//         JNIEnv *env,
//         jclass clazz) {
//     TestClass test;
//     test.sigbus();
// }

// extern "C" JNIEXPORT jstring JNICALL
// Java_com_nimble_mrtotem_embracetestsuite_SignalTestActivityKt_executeSIGFPESignal(
//         JNIEnv *env,
//         jclass clazz) {
//     TestClass test;
//     test.sigfpe();
// }

// extern "C" JNIEXPORT jstring JNICALL
// Java_com_nimble_mrtotem_embracetestsuite_SignalTestActivityKt_executeSIGSEGVSignal(
//         JNIEnv *env,
//         jclass clazz) {
//     TestClass test;
//     test.sigsegv();
// }

// extern "C" JNIEXPORT jstring JNICALL
// Java_com_nimble_mrtotem_embracetestsuite_SignalTestActivityKt_executeSIGABRTSignal(
//         JNIEnv *env,
//         jclass clazz) {
//     TestClass test;
//     test.sigabort();
// }

// extern "C" JNIEXPORT jstring JNICALL
// Java_com_nimble_mrtotem_embracetestsuite_SignalTestActivityKt_throwCPPException(
//         JNIEnv *env,
//         jclass clazz) {
//     TestClass test;
//     test.throwException();
// }