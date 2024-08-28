#import "CodePushHelper.h"

#if __has_include(<CodePush/CodePush.h>)
#import <CodePush/CodePush.h>
#endif

@implementation CodePushHelper

+ (NSURL *)getCodePushURL
{
#if __has_include(<CodePush/CodePush.h>)
    return [CodePush bundleURL];
#else
    return nil;
#endif
}

@end
