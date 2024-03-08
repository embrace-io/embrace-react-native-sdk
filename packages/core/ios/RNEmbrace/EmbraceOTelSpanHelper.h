
#import <Embrace/EmbraceOTelSpanErrorCode.h>

@interface EmbraceOTelSpanHelper : NSObject

- (EmbraceOTelSpanErrorCode)getEmbraceOTelSpanErrorCodeByString:(NSString *)errorCode;

@end