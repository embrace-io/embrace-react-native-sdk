#import "RCTNativeTestModule.h"
#import "CRLCrashCXXException.h"

@implementation RCTNativeTestModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(generateNativeCrash) { @throw NSInternalInconsistencyException; }

RCT_EXPORT_METHOD(generatePlatformCrash) {
    @throw [NSException exceptionWithName:@"NS Except exception"
                                   reason:@"Test NS Exception"
                                 userInfo:nil];
}

RCT_EXPORT_METHOD(generateCPPCrash) {
    CRLCrashCXXException *crashInstance = [[CRLCrashCXXException alloc] init];
    [crashInstance crash];
}

RCT_EXPORT_METHOD(moveToBackground) {
    [[UIApplication sharedApplication] performSelector:NSSelectorFromString(@"suspend")];
}

@end
