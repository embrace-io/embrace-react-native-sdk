// DeepLinkTrackingModule.m

#import <Foundation/Foundation.h>
#import "DeepLinkTrackingModule.h"

@implementation DeepLinkTrackingModule

RCT_EXPORT_MODULE();

static NSString *spanId = nil;
 
+ (void) setSpanId:(NSString *)value { spanId = value; }

RCT_EXPORT_METHOD(completed)
{
  
  NSString *span1 = [[RNEmbrace sharedInstance] startSpanWithName:@"my-span" parentSpanId:nil];
  [[RNEmbrace sharedInstance] stopSpanWithId:span1 errorCode:None];
  NSString *span2 = [[RNEmbrace sharedInstance] startSpanWithName:@"my-span-never-ends" parentSpanId:nil];
  
  /*
  if (spanId){
    [[RNEmbrace sharedInstance] stopSpanWithId:spanId errorCode:None];
  } else {
    // deep link tracking was never started
  }
   */
}

@end

