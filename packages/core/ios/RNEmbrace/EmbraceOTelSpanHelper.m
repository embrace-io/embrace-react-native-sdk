#import "EmbraceOTelSpanHelper.h"
#import <Embrace/EmbraceOTelSpanErrorCode.h>

@implementation EmbraceOTelSpanHelper

- (EmbraceOTelSpanErrorCode)getEmbraceOTelSpanErrorCodeByString:(NSString *)errorCode {
    if ([errorCode isEqualToString:@"None"]) {
        return None;
    } else if ([errorCode isEqualToString:@"Failure"]) {
        return Failure;
    } else if ([errorCode isEqualToString:@"UserAbandon"]) {
        return UserAbandon;
    } else if ([errorCode isEqualToString:@"Unknown"]) {
        return Unknown;
    } else {
        return None;
    }
}

@end