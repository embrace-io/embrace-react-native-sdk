import {Image, StyleSheet, Button} from "react-native";
import {useCallback, useMemo} from "react";

import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import {endSession, logHandledError} from "@embrace-io/react-native";
import {
  startSpan,
  stopSpan,
  addSpanEventToSpan,
  addSpanAttributeToSpan,
  recordSpan,
  recordCompletedSpan,
} from "@embrace-io/react-native-spans";

const getTimeWithSuffix = (last4digits: number) => {
  return Math.round(new Date().getTime() / 1000) * 1000 + last4digits;
};

const HomeScreen = () => {
  const handleEndSession = useCallback(() => {
    endSession();
  }, []);

  const handleLogUnhandledError = useCallback(() => {
    /**
     * Android Log
      {
        "time_unix_nano": 1723838668066000000,
        "severity_number": 17,
        "severity_text": "ERROR",
        "body": "",
        "attributes": [
          {
            "key": "emb.android.crash.exception_cause",
            "value": "[{\"n\":\"com.facebook.react.common.JavascriptException\",\"m\":\"Error: handleLogUnhandledError (auto-captured by init sdk), js engine: hermes, stack:\\nanonymous@1:1180592\\n_performTransitionSideEffects@1:400121\\n_receiveSignal@1:399736\\nonResponderRelease@1:398911\\ninvokeGuardedCallbackImpl@1:300918\\ninvokeGuardedCallback@1:300975\\ninvokeGuardedCallbackAndCatchFirstError@1:301007\\nexecuteDispatch@1:301136\\nexecuteDispatchesAndReleaseTopLevel@1:304528\\nforEachAccumulated@1:302626\\nanonymous@1:304891\\nbatchedUpdatesImpl@1:371665\\nbatchedUpdates$1@1:304445\\n_receiveRootNodeIDEvent@1:304729\\nreceiveTouches@1:366716\\n__callFunction@1:51571\\nanonymous@1:50013\\n__guard@1:50953\\ncallFunctionReturnFlushedQueue@1:49971\\n\",\"tt\":[\"com.facebook.react.modules.core.ExceptionsManagerModule.reportException(ExceptionsManagerModule.java:65)\",\"java.lang.reflect.Method.invoke(Native Method)\",\"com.facebook.react.bridge.JavaMethodWrapper.invoke(JavaMethodWrapper.java:372)\",\"com.facebook.react.bridge.JavaModuleWrapper.invoke(JavaModuleWrapper.java:146)\",\"com.facebook.jni.NativeRunnable.run(Native Method)\",\"android.os.Handler.handleCallback(Handler.java:958)\",\"android.os.Handler.dispatchMessage(Handler.java:99)\",\"com.facebook.react.bridge.queue.MessageQueueThreadHandler.dispatchMessage(MessageQueueThreadHandler.java:27)\",\"android.os.Looper.loopOnce(Looper.java:205)\",\"android.os.Looper.loop(Looper.java:294)\",\"com.facebook.react.bridge.queue.MessageQueueThreadImpl$4.run(MessageQueueThreadImpl.java:233)\",\"java.lang.Thread.run(Thread.java:1012)\"]}]"
          },
          {
            "key": "emb.android.crash_number",
            "value": "15"
          },
          {
            "key": "emb.android.react_native_crash.js_exception",
            "value": "{\"n\":\"Error\",\"m\":\"handleLogUnhandledError (auto-captured by init sdk)\",\"t\":\"Error\",\"st\":\"Error: handleLogUnhandledError (auto-captured by init sdk)\\n    at anonymous (address at index.android.bundle:1:1180592)\\n    at _performTransitionSideEffects (address at index.android.bundle:1:400121)\\n    at _receiveSignal (address at index.android.bundle:1:399736)\\n    at onResponderRelease (address at index.android.bundle:1:398911)\\n    at apply (native)\\n    at invokeGuardedCallbackImpl (address at index.android.bundle:1:300918)\\n    at apply (native)\\n    at invokeGuardedCallback (address at index.android.bundle:1:300975)\\n    at apply (native)\\n    at invokeGuardedCallbackAndCatchFirstError (address at index.android.bundle:1:301007)\\n    at executeDispatch (address at index.android.bundle:1:301136)\\n    at executeDispatchesAndReleaseTopLevel (address at index.android.bundle:1:304528)\\n    at forEach (native)\\n    at forEachAccumulated (address at index.android.bundle:1:302626)\\n    at anonymous (address at index.android.bundle:1:304891)\\n    at batchedUpdatesImpl (address at index.android.bundle:1:371665)\\n    at batchedUpdates$1 (address at index.android.bundle:1:304445)\\n    at _receiveRootNodeIDEvent (address at index.android.bundle:1:304729)\\n    at receiveTouches (address at index.android.bundle:1:366716)\\n    at apply (native)\\n    at __callFunction (address at index.android.bundle:1:51571)\\n    at anonymous (address at index.android.bundle:1:50013)\\n    at __guard (address at index.android.bundle:1:50953)\\n    at callFunctionReturnFlushedQueue (address at index.android.bundle:1:49971)\"}"
          },
          {
            "key": "emb.android.threads",
            "value": "[{\"threadId\":62,\"state\":\"TIMED_WAITING\",\"n\":\"emb-background-reg\",\"p\":5,\"tt\":[\"jdk.internal.misc.Unsafe.park(Native Method)\",\"java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:252)\",\"java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:1672)\",\"java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1188)\",\"java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:905)\",\"java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1071)\",\"java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1131)\",\"java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:644)\",\"java.lang.Thread.run(Thread.java:1012)\"]},{\"threadId\":52,\"state\":\"RUNNABLE\",\"n\":\"mqt_js\",\"p\":5,\"tt\":[\"android.os.MessageQueue.nativePollOnce(Native Method)\",\"android.os.MessageQueue.next(MessageQueue.java:335)\",\"android.os.Looper.loopOnce(Looper.java:162)\",\"android.os.Looper.loop(Looper.java:294)\",\"com.facebook.react.bridge.queue.MessageQueueThreadImpl$4.run(MessageQueueThreadImpl.java:233)\",\"java.lang.Thread.run(Thread.java:1012)\"]},{\"threadId\":45,\"state\":\"RUNNABLE\",\"n\":\"RenderThread\",\"p\":7,\"tt\":[]},{\"threadId\":35,\"state\":\"WAITING\",\"n\":\"Signal Catcher\",\"p\":10,\"tt\":[]},{\"threadId\":64,\"state\":\"TIMED_WAITING\",\"n\":\"emb-anr-monitor\",\"p\":5,\"tt\":[\"jdk.internal.misc.Unsafe.park(Native Method)\",\"java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:252)\",\"java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:1672)\",\"java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1188)\",\"java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:905)\",\"java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1071)\",\"java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1131)\",\"java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:644)\",\"java.lang.Thread.run(Thread.java:1012)\"]},{\"threadId\":60,\"state\":\"RUNNABLE\",\"n\":\"queued-work-looper\",\"p\":5,\"tt\":[\"android.os.MessageQueue.nativePollOnce(Native Method)\",\"android.os.MessageQueue.next(MessageQueue.java:335)\",\"android.os.Looper.loopOnce(Looper.java:162)\",\"android.os.Looper.loop(Looper.java:294)\",\"android.os.HandlerThread.run(HandlerThread.java:67)\"]},{\"threadId\":65,\"state\":\"WAITING\",\"n\":\"emb-service-init\",\"p\":5,\"tt\":[\"jdk.internal.misc.Unsafe.park(Native Method)\",\"java.util.concurrent.locks.LockSupport.park(LockSupport.java:341)\",\"java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionNode.block(AbstractQueuedSynchronizer.java:506)\",\"java.util.concurrent.ForkJoinPool.unmanagedBlock(ForkJoinPool.java:3466)\",\"java.util.concurrent.ForkJoinPool.managedBlock(ForkJoinPool.java:3437)\",\"java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:1623)\",\"java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1176)\",\"java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:905)\",\"java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1071)\",\"java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1131)\",\"java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:644)\",\"java.lang.Thread.run(Thread.java:1012)\"]},{\"threadId\":40,\"state\":\"RUNNABLE\",\"n\":\"Jit thread pool worker thread 0\",\"p\":5,\"tt\":[]},{\"threadId\":66,\"state\":\"TIMED_WAITING\",\"n\":\"emb-periodic-cache\",\"p\":5,\"tt\":[\"jdk.internal.misc.Unsafe.park(Native Method)\",\"java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:252)\",\"java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:1672)\",\"java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1188)\",\"java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:905)\",\"java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1071)\",\"java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1131)\",\"java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:644)\",\"java.lang.Thread.run(Thread.java:1012)\"]},{\"threadId\":73,\"state\":\"WAITING\",\"n\":\"emb-remote-logging\",\"p\":5,\"tt\":[\"jdk.internal.misc.Unsafe.park(Native Method)\",\"java.util.concurrent.locks.LockSupport.park(LockSupport.java:341)\",\"java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionNode.block(AbstractQueuedSynchronizer.java:506)\",\"java.util.concurrent.ForkJoinPool.unmanagedBlock(ForkJoinPool.java:3466)\",\"java.util.concurrent.ForkJoinPool.managedBlock(ForkJoinPool.java:3437)\",\"java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:1623)\",\"java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1176)\",\"java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:905)\",\"java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1071)\",\"java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1131)\",\"java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:644)\",\"java.lang.Thread.run(Thread.java:1012)\"]},{\"threadId\":50,\"state\":\"TIMED_WAITING\",\"n\":\"DefaultDispatcher-worker-1\",\"p\":5,\"tt\":[\"jdk.internal.misc.Unsafe.park(Native Method)\",\"java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:376)\",\"kotlinx.coroutines.scheduling.CoroutineScheduler$Worker.park(CoroutineScheduler.kt:795)\",\"kotlinx.coroutines.scheduling.CoroutineScheduler$Worker.tryPark(CoroutineScheduler.kt:740)\",\"kotlinx.coroutines.scheduling.CoroutineScheduler$Worker.runWorker(CoroutineScheduler.kt:711)\",\"kotlinx.coroutines.scheduling.CoroutineScheduler$Worker.run(CoroutineScheduler.kt:664)\"]},{\"threadId\":43,\"state\":\"RUNNABLE\",\"n\":\"binder:8603_3\",\"p\":5,\"tt\":[]},{\"threadId\":2,\"state\":\"RUNNABLE\",\"n\":\"main\",\"p\":5,\"tt\":[\"android.os.MessageQueue.nativePollOnce(Native Method)\",\"android.os.MessageQueue.next(MessageQueue.java:335)\",\"android.os.Looper.loopOnce(Looper.java:162)\",\"android.os.Looper.loop(Looper.java:294)\",\"android.app.ActivityThread.main(ActivityThread.java:8177)\",\"java.lang.reflect.Method.invoke(Native Method)\",\"com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:552)\",\"com.android.internal.os.ZygoteInit.main(ZygoteInit.java:971)\"]},{\"threadId\":49,\"state\":\"WAITING\",\"n\":\"Expo JNI deallocator\",\"p\":5,\"tt\":[\"java.lang.Object.wait(Native Method)\",\"java.lang.Object.wait(Object.java:386)\",\"java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:210)\",\"java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:231)\",\"expo.modules.kotlin.jni.JNIDeallocator$destructorThread$1.run(JNIDeallocator.kt:36)\"]},{\"threadId\":55,\"state\":\"RUNNABLE\",\"n\":\"hwuiTask1\",\"p\":6,\"tt\":[]},{\"threadId\":39,\"state\":\"TIMED_WAITING\",\"n\":\"FinalizerWatchdogDaemon\",\"p\":5,\"tt\":[\"java.lang.Thread.sleep(Native Method)\",\"java.lang.Thread.sleep(Thread.java:450)\",\"java.lang.Thread.sleep(Thread.java:355)\",\"java.lang.Daemons$FinalizerWatchdogDaemon.sleepForNanos(Daemons.java:481)\",\"java.lang.Daemons$FinalizerWatchdogDaemon.waitForProgress(Daemons.java:544)\",\"java.lang.Daemons$FinalizerWatchdogDaemon.runInternal(Daemons.java:412)\",\"java.lang.Daemons$Daemon.run(Daemons.java:145)\",\"java.lang.Thread.run(Thread.java:1012)\"]},{\"threadId\":44,\"state\":\"RUNNABLE\",\"n\":\"Profile Saver\",\"p\":5,\"tt\":[]},{\"threadId\":71,\"state\":\"WAITING\",\"n\":\"FrescoDecodeExecutor-1\",\"p\":5,\"tt\":[\"jdk.internal.misc.Unsafe.park(Native Method)\",\"java.util.concurrent.locks.LockSupport.park(LockSupport.java:341)\",\"java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionNode.block(AbstractQueuedSynchronizer.java:506)\",\"java.util.concurrent.ForkJoinPool.unmanagedBlock(ForkJoinPool.java:3466)\",\"java.util.concurrent.ForkJoinPool.managedBlock(ForkJoinPool.java:3437)\",\"java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:1623)\",\"java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:435)\",\"java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1071)\",\"java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1131)\",\"java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:644)\",\"com.facebook.imagepipeline.core.PriorityThreadFactory.newThread$lambda$0(PriorityThreadFactory.kt:37)\",\"com.facebook.imagepipeline.core.PriorityThreadFactory.$r8$lambda$IPp7Vm9a1KDy8D4770JTjI9qOG4(Unknown Source:0)\",\"com.facebook.imagepipeline.core.PriorityThreadFactory$$ExternalSyntheticLambda0.run(Unknown Source:4)\",\"java.lang.Thread.run(Thread.java:1012)\"]},{\"threadId\":51,\"state\":\"TIMED_WAITING\",\"n\":\"DefaultDispatcher-worker-2\",\"p\":5,\"tt\":[\"jdk.internal.misc.Unsafe.park(Native Method)\",\"java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:376)\",\"kotlinx.coroutines.scheduling.CoroutineScheduler$Worker.park(CoroutineScheduler.kt:795)\",\"kotlinx.coroutines.scheduling.CoroutineScheduler$Worker.tryPark(CoroutineScheduler.kt:740)\",\"kotlinx.coroutines.scheduling.CoroutineScheduler$Worker.runWorker(CoroutineScheduler.kt:711)\",\"kotlinx.coroutines.scheduling.CoroutineScheduler$Worker.run(CoroutineScheduler.kt:664)\"]},{\"threadId\":48,\"state\":\"RUNNABLE\",\"n\":\"expo.modules.AsyncFunctionQueue\",\"p\":5,\"tt\":[\"android.os.MessageQueue.nativePollOnce(Native Method)\",\"android.os.MessageQueue.next(MessageQueue.java:335)\",\"android.os.Looper.loopOnce(Looper.java:162)\",\"android.os.Looper.loop(Looper.java:294)\",\"android.os.HandlerThread.run(HandlerThread.java:67)\"]},{\"threadId\":37,\"state\":\"WAITING\",\"n\":\"ReferenceQueueDaemon\",\"p\":5,\"tt\":[\"java.lang.Object.wait(Native Method)\",\"java.lang.Object.wait(Object.java:386)\",\"java.lang.Object.wait(Object.java:524)\",\"java.lang.Daemons$ReferenceQueueDaemon.runInternal(Daemons.java:239)\",\"java.lang.Daemons$Daemon.run(Daemons.java:145)\",\"java.lang.Thread.run(Thread.java:1012)\"]},{\"threadId\":38,\"state\":\"WAITING\",\"n\":\"FinalizerDaemon\",\"p\":5,\"tt\":[\"java.lang.Object.wait(Native Method)\",\"java.lang.Object.wait(Object.java:386)\",\"java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:210)\",\"java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:231)\",\"java.lang.Daemons$FinalizerDaemon.runInternal(Daemons.java:309)\",\"java.lang.Daemons$Daemon.run(Daemons.java:145)\",\"java.lang.Thread.run(Thread.java:1012)\"]},{\"threadId\":41,\"state\":\"RUNNABLE\",\"n\":\"binder:8603_1\",\"p\":5,\"tt\":[]},{\"threadId\":68,\"state\":\"WAITING\",\"n\":\"emb-network-request\",\"p\":5,\"tt\":[\"jdk.internal.misc.Unsafe.park(Native Method)\",\"java.util.concurrent.locks.LockSupport.park(LockSupport.java:341)\",\"java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionNode.block(AbstractQueuedSynchronizer.java:506)\",\"java.util.concurrent.ForkJoinPool.unmanagedBlock(ForkJoinPool.java:3466)\",\"java.util.concurrent.ForkJoinPool.managedBlock(ForkJoinPool.java:3437)\",\"java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:1623)\",\"java.util.concurrent.PriorityBlockingQueue.take(PriorityBlockingQueue.java:538)\",\"java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1071)\",\"java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1131)\",\"java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:644)\",\"java.lang.Thread.run(Thread.java:1012)\"]},{\"threadId\":67,\"state\":\"WAITING\",\"n\":\"emb-delivery-cache\",\"p\":5,\"tt\":[\"jdk.internal.misc.Unsafe.park(Native Method)\",\"java.util.concurrent.locks.LockSupport.park(LockSupport.java:341)\",\"java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionNode.block(AbstractQueuedSynchronizer.java:506)\",\"java.util.concurrent.ForkJoinPool.unmanagedBlock(ForkJoinPool.java:3466)\",\"java.util.concurrent.ForkJoinPool.managedBlock(ForkJoinPool.java:3437)\",\"java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:1623)\",\"java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1176)\",\"java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:905)\",\"java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1071)\",\"java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1131)\",\"java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:644)\",\"java.lang.Thread.run(Thread.java:1012)\"]},{\"threadId\":54,\"state\":\"RUNNABLE\",\"n\":\"SurfaceSyncGroupTimer\",\"p\":5,\"tt\":[\"android.os.MessageQueue.nativePollOnce(Native Method)\",\"android.os.MessageQueue.next(MessageQueue.java:335)\",\"android.os.Looper.loopOnce(Looper.java:162)\",\"android.os.Looper.loop(Looper.java:294)\",\"android.os.HandlerThread.run(HandlerThread.java:67)\"]},{\"threadId\":42,\"state\":\"RUNNABLE\",\"n\":\"binder:8603_2\",\"p\":5,\"tt\":[]},{\"threadId\":69,\"state\":\"WAITING\",\"n\":\"FrescoLightWeightBackgroundExecutor-1\",\"p\":5,\"tt\":[\"jdk.internal.misc.Unsafe.park(Native Method)\",\"java.util.concurrent.locks.LockSupport.park(LockSupport.java:341)\",\"java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionNode.block(AbstractQueuedSynchronizer.java:506)\",\"java.util.concurrent.ForkJoinPool.unmanagedBlock(ForkJoinPool.java:3466)\",\"java.util.concurrent.ForkJoinPool.managedBlock(ForkJoinPool.java:3437)\",\"java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:1623)\",\"java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:435)\",\"java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1071)\",\"java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1131)\",\"java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:644)\",\"com.facebook.imagepipeline.core.PriorityThreadFactory.newThread$lambda$0(PriorityThreadFactory.kt:37)\",\"com.facebook.imagepipeline.core.PriorityThreadFactory.$r8$lambda$IPp7Vm9a1KDy8D4770JTjI9qOG4(Unknown Source:0)\",\"com.facebook.imagepipeline.core.PriorityThreadFactory$$ExternalSyntheticLambda0.run(Unknown Source:4)\",\"java.lang.Thread.run(Thread.java:1012)\"]},{\"threadId\":70,\"state\":\"WAITING\",\"n\":\"FrescoIoBoundExecutor-1\",\"p\":5,\"tt\":[\"jdk.internal.misc.Unsafe.park(Native Method)\",\"java.util.concurrent.locks.LockSupport.park(LockSupport.java:341)\",\"java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionNode.block(AbstractQueuedSynchronizer.java:506)\",\"java.util.concurrent.ForkJoinPool.unmanagedBlock(ForkJoinPool.java:3466)\",\"java.util.concurrent.ForkJoinPool.managedBlock(ForkJoinPool.java:3437)\",\"java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:1623)\",\"java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:435)\",\"java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1071)\",\"java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1131)\",\"java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:644)\",\"com.facebook.imagepipeline.core.PriorityThreadFactory.newThread$lambda$0(PriorityThreadFactory.kt:37)\",\"com.facebook.imagepipeline.core.PriorityThreadFactory.$r8$lambda$IPp7Vm9a1KDy8D4770JTjI9qOG4(Unknown Source:0)\",\"com.facebook.imagepipeline.core.PriorityThreadFactory$$ExternalSyntheticLambda0.run(Unknown Source:4)\",\"java.lang.Thread.run(Thread.java:1012)\"]},{\"threadId\":53,\"state\":\"RUNNABLE\",\"n\":\"mqt_native_modules\",\"p\":5,\"tt\":[\"dalvik.system.VMStack.getThreadStackTrace(Native Method)\",\"java.lang.Thread.getStackTrace(Thread.java:1841)\",\"java.lang.Thread.getAllStackTraces(Thread.java:1909)\",\"io.embrace.android.embracesdk.capture.crash.CrashDataSourceImpl.getThreadsInfo(CrashDataSourceImpl.kt:167)\",\"io.embrace.android.embracesdk.capture.crash.CrashDataSourceImpl.handleCrash(CrashDataSourceImpl.kt:103)\",\"io.embrace.android.embracesdk.capture.crash.CompositeCrashService.handleCrash(CompositeCrashService.kt:31)\",\"io.embrace.android.embracesdk.capture.crash.EmbraceUncaughtExceptionHandler.uncaughtException(EmbraceUncaughtExceptionHandler.kt:30)\",\"java.lang.ThreadGroup.uncaughtException(ThreadGroup.java:1071)\",\"java.lang.ThreadGroup.uncaughtException(ThreadGroup.java:1066)\",\"java.lang.Thread.dispatchUncaughtException(Thread.java:2306)\"]},{\"threadId\":74,\"state\":\"RUNNABLE\",\"n\":\"binder:8603_4\",\"p\":5,\"tt\":[]},{\"threadId\":36,\"state\":\"WAITING\",\"n\":\"HeapTaskDaemon\",\"p\":5,\"tt\":[]},{\"threadId\":47,\"state\":\"WAITING\",\"n\":\"HybridData DestructorThread\",\"p\":5,\"tt\":[\"java.lang.Object.wait(Native Method)\",\"java.lang.Object.wait(Object.java:386)\",\"java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:210)\",\"java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:231)\",\"com.facebook.jni.DestructorThread$1.run(DestructorThread.java:76)\"]},{\"threadId\":56,\"state\":\"RUNNABLE\",\"n\":\"hwuiTask0\",\"p\":6,\"tt\":[]}]"
          },
          {
            "key": "emb.send_immediately",
            "value": "true"
          },
          {
            "key": "emb.session_id",
            "value": "CCF2F2A903D340D6881E8F7FB0AC035B"
          },
          {
            "key": "emb.state",
            "value": "foreground"
          },
          {
            "key": "emb.type",
            "value": "sys.android.react_native_crash"
          },
          {
            "key": "exception.message",
            "value": "Error: handleLogUnhandledError (auto-captured by init sdk), js engine: hermes, stack:\nanonymous@1:1180592\n_performTransitionSideEffects@1:400121\n_receiveSignal@1:399736\nonResponderRelease@1:398911\ninvokeGuardedCallbackImpl@1:300918\ninvokeGuardedCallback@1:300975\ninvokeGuardedCallbackAndCatchFirstError@1:301007\nexecuteDispatch@1:301136\nexecuteDispatchesAndReleaseTopLevel@1:304528\nforEachAccumulated@1:302626\nanonymous@1:304891\nbatchedUpdatesImpl@1:371665\nbatchedUpdates$1@1:304445\n_receiveRootNodeIDEvent@1:304729\nreceiveTouches@1:366716\n__callFunction@1:51571\nanonymous@1:50013\n__guard@1:50953\ncallFunctionReturnFlushedQueue@1:49971\n"
          },
          {
            "key": "exception.stacktrace",
            "value": "[\"com.facebook.react.modules.core.ExceptionsManagerModule.reportException(ExceptionsManagerModule.java:65)\",\"java.lang.reflect.Method.invoke(Native Method)\",\"com.facebook.react.bridge.JavaMethodWrapper.invoke(JavaMethodWrapper.java:372)\",\"com.facebook.react.bridge.JavaModuleWrapper.invoke(JavaModuleWrapper.java:146)\",\"com.facebook.jni.NativeRunnable.run(Native Method)\",\"android.os.Handler.handleCallback(Handler.java:958)\",\"android.os.Handler.dispatchMessage(Handler.java:99)\",\"com.facebook.react.bridge.queue.MessageQueueThreadHandler.dispatchMessage(MessageQueueThreadHandler.java:27)\",\"android.os.Looper.loopOnce(Looper.java:205)\",\"android.os.Looper.loop(Looper.java:294)\",\"com.facebook.react.bridge.queue.MessageQueueThreadImpl$4.run(MessageQueueThreadImpl.java:233)\",\"java.lang.Thread.run(Thread.java:1012)\"]"
          },
          {
            "key": "exception.type",
            "value": "com.facebook.react.common.JavascriptException"
          },
          {
            "key": "log.record.uid",
            "value": "792E5B2AF018459AA0675F51A7BFD223"
          }
        ]
      }
     */

    /**
     * iOS Log
     * TBD
     */

    throw new Error("handleLogUnhandledError (auto-captured by init sdk)");
  }, []);

  const handleLogHandledError = useCallback(() => {
    const error1 = new Error("logHandledError");
    const error2 = new Error("logHandledError with properties");

    /**
     * Android Log
      {
        "time_unix_nano": 1723838001884000000,
        "severity_number": 17,
        "severity_text": "ERROR",
        "body": "logHandledError",
        "attributes": [
          {
            "key": "emb.exception_handling",
            "value": "handled"
          },
          {
            "key": "emb.session_id",
            "value": "0A8723BC579A4D41B2A236BBF6589AD6"
          },
          {
            "key": "emb.state",
            "value": "foreground"
          },
          {
            "key": "emb.type",
            "value": "sys.exception"
          },
          {
            "key": "exception.stacktrace",
            "value": "Error: logHandledError\n    at anonymous (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:179655:29)\n    at _performTransitionSideEffects (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:93113:22)\n    at _receiveSignal (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:93063:45)\n    at onResponderRelease (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:92900:34)\n    at apply (native)\n    at invokeGuardedCallbackImpl (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:68866:23)\n    at apply (native)\n    at invokeGuardedCallback (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:68900:40)\n    at apply (native)\n    at invokeGuardedCallbackAndCatchFirstError (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:68914:36)\n    at executeDispatch (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:68990:48)\n    at executeDispatchesInOrder (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:69012:26)\n    at executeDispatchesAndRelease (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:70685:35)\n    at executeDispatchesAndReleaseTopLevel (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:70693:43)\n    at forEach (native)\n    at forEachAccumulated (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:69615:22)\n    at runEventsInBatch (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:70706:27)\n    at runExtractedPluginEventsInBatch (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:70817:25)\n    at anonymous (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:70788:42)\n    at batchedUpdates (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:86402:20)\n    at batchedUpdates$1 (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:70661:36)\n    at _receiveRootNodeIDEvent (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:70787:25)\n    at receiveTouches (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:70876:34)\n    at apply (native)\n    at __callFunction (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:2676:38)\n    at anonymous (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:2392:31)\n    at __guard (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:2609:15)\n    at callFunctionReturnFlushedQueue (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:2391:21)"
          },
          {
            "key": "log.record.uid",
            "value": "BE72F2DF627E4E71968C9C8800899C16"
          }
        ]
      }

      {
        "time_unix_nano": 1723838001968000000,
        "severity_number": 17,
        "severity_text": "ERROR",
        "body": "logHandledError with properties",
        "attributes": [
          {
            "key": "emb.exception_handling",
            "value": "handled"
          },
          {
            "key": "emb.session_id",
            "value": "0A8723BC579A4D41B2A236BBF6589AD6"
          },
          {
            "key": "emb.state",
            "value": "foreground"
          },
          {
            "key": "emb.type",
            "value": "sys.exception"
          },
          {
            "key": "exception.stacktrace",
            "value": "Error: logHandledError with properties\n    at anonymous (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:179656:29)\n    at _performTransitionSideEffects (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:93113:22)\n    at _receiveSignal (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:93063:45)\n    at onResponderRelease (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:92900:34)\n    at apply (native)\n    at invokeGuardedCallbackImpl (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:68866:23)\n    at apply (native)\n    at invokeGuardedCallback (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:68900:40)\n    at apply (native)\n    at invokeGuardedCallbackAndCatchFirstError (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:68914:36)\n    at executeDispatch (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:68990:48)\n    at executeDispatchesInOrder (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:69012:26)\n    at executeDispatchesAndRelease (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:70685:35)\n    at executeDispatchesAndReleaseTopLevel (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:70693:43)\n    at forEach (native)\n    at forEachAccumulated (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:69615:22)\n    at runEventsInBatch (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:70706:27)\n    at runExtractedPluginEventsInBatch (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:70817:25)\n    at anonymous (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:70788:42)\n    at batchedUpdates (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:86402:20)\n    at batchedUpdates$1 (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:70661:36)\n    at _receiveRootNodeIDEvent (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:70787:25)\n    at receiveTouches (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:70876:34)\n    at apply (native)\n    at __callFunction (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:2676:38)\n    at anonymous (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:2392:31)\n    at __guard (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:2609:15)\n    at callFunctionReturnFlushedQueue (http://192.168.0.28:8081/node_modules/expo-router/entry.bundle//&platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=true&transform.routerRoot=app:2391:21)"
          },
          {
            "key": "log.record.uid",
            "value": "F4B6426B510A4D918B11E1C94A705BD6"
          },
          {
            "key": "prop1",
            "value": "test"
          },
          {
            "key": "prop2",
            "value": "hey"
          }
        ]
      }
     */

    logHandledError(error1);
    logHandledError(error2, {prop1: "test", prop2: "hey"});
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{light: "#A1CEDC", dark: "#1D3D47"}}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Session</ThemedText>
        <Button onPress={handleEndSession} title="END SESSION" />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Span</ThemedText>
        <Button
          onPress={async () => {
            let id = null;
            try {
              id = await startSpan("my-span");
              console.log("id: ", id);
            } catch (e) {
              console.log(e);
            }

            if (typeof id === "string") {
              const result = await stopSpan(id);
              if (!result) {
                console.log("failed to stop span");
              }
            } else {
              console.log("failed to start span");
            }
          }}
          title={"SIMPLE SPAN TEST"}
        />

        <Button
          onPress={async () => {
            const id = await startSpan(
              "span-code-test-2",
              undefined,
              1722011284001,
            );
            console.log("id: ", id);
            stopSpan(id as string, "Unknown");
          }}
          title={"STOP SPAN ERROR CODE TEST"}
        />

        <Button
          onPress={async () => {
            const time = getTimeWithSuffix(1111);
            const id = await startSpan("span-end-inside", undefined, time);
            stopSpan(id as string, "None", time + 1);
          }}
          title={"STOP SPAN INSIDE SESSION TEST"}
        />

        <Button
          onPress={async () => {
            const id = await startSpan(
              "span-end-outside",
              undefined,
              1722011284001,
            );
            stopSpan(id as string, "None", 1722011287002);
          }}
          title={"STOP SPAN OUTSIDE SESSION TEST"}
        />

        <Button
          onPress={async () => {
            await startSpan("still-active-span");
          }}
          title={"STILL ACTIVE SPAN TEST"}
        />

        <Button
          onPress={async () => {
            const parentID = await startSpan("parent-span");
            const childID = await startSpan("child-span", parentID as string);

            stopSpan(parentID as string, "None");
            stopSpan(childID as string);
          }}
          title={"START SPAN PARENT TEST"}
        />

        <Button
          onPress={async () => {
            const id = await startSpan("span-with-stuff");

            addSpanEventToSpan(
              id as string,
              "event-no-attributes",
              new Date().getTime(),
            );

            addSpanEventToSpan(
              id as string,
              "event-with-attributes",
              getTimeWithSuffix(4177),
              {"attr-1": "foo", "attr-2": "bar"},
            );
            addSpanAttributeToSpan(id as string, "other-attr", "baz");

            stopSpan(id as string);
          }}
          title={"SPAN EVENTS AND ATTRIBUTES TEST"}
        />

        <Button
          onPress={async () => {
            recordSpan(
              "recorded-span",
              () => {},
              {"attr-1": "foo", "attr-2": "bar"},
              [
                {
                  name: "event-no-attributes",
                  timeStampMs: new Date().getTime(),
                },
                {
                  name: "event-with-attributes",
                  timeStampMs: new Date().getTime(),
                  attributes: {"event-attr-1": "baz"},
                },
              ],
            );
          }}
          title={"RECORD SPAN TEST"}
        />

        <Button
          onPress={async () => {
            const time = getTimeWithSuffix(1111);

            recordCompletedSpan(
              "recorded-completed-span-inside",
              time,
              time + 1,
              "Unknown",
              undefined,
              {"attr-1": "foo", "attr-2": "bar"},
              [
                {
                  name: "event-no-attributes",
                  timeStampMs: new Date().getTime(),
                },
                {
                  name: "event-with-attributes",
                  timeStampMs: new Date().getTime(),
                  attributes: {"event-attr-1": "baz"},
                },
              ],
            );
          }}
          title={"RECORD COMPLETED SPAN INSIDE TEST"}
        />

        <Button
          onPress={async () => {
            recordCompletedSpan(
              "recorded-completed-span-outside",
              1722011284001,
              1722011287002,
              "Unknown",
              undefined,
              {"attr-1": "foo", "attr-2": "bar"},
              [
                {
                  name: "event-no-attributes",
                  timeStampMs: new Date().getTime(),
                },
                {
                  name: "event-with-attributes",
                  timeStampMs: new Date().getTime(),
                  attributes: {"event-attr-1": "baz"},
                },
              ],
            );
          }}
          title={"RECORD COMPLETED SPAN OUTSIDE TEST"}
        />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Errors</ThemedText>
        <Button
          onPress={handleLogUnhandledError}
          title="Unhandled JS Exception"
        />
        <Button onPress={handleLogHandledError} title="Handled JS Error" />
      </ThemedView>
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});

export default HomeScreen;
