// DeepLinkTrackingModule.h
#import <React/RCTBridgeModule.h>
#import <Embrace/Embrace.h>
@interface DeepLinkTrackingModule : NSObject <RCTBridgeModule>

+ (void) setSpanId:(NSString *)value;

@end
