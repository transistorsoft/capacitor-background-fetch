#import "BackgroundFetchModule.h"
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#import <Capacitor/Capacitor.h>
#import <Capacitor/Capacitor-Swift.h>
#import <Capacitor/CAPBridgedPlugin.h>
#import <Capacitor/CAPBridgedJSTypes.h>

static NSString *const BACKGROUND_FETCH_TAG = @"BackgroundFetchPlugin";
static NSString *const EVENT_FETCH = @"fetch";
static NSString *const PLUGIN_ID = @"capacitor-background-fetch";

@implementation BackgroundFetchModule {
    BOOL configured;
}

- (void)load {
    configured = NO;
}

- (void)configure:(CAPPluginCall *) call {
    NSDictionary *config = [call getObject:@"options" defaultValue:@{}];
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];
    
    [fetchManager addListener:PLUGIN_ID callback:[self createFetchCallback] timeout:[self createFetchTimeoutCallback]];

    NSTimeInterval delay = [[config objectForKey:@"minimumFetchInterval"] doubleValue] * 60;

    [fetchManager configure:delay callback:^(UIBackgroundRefreshStatus status) {
        self->configured = YES;
        if (status != UIBackgroundRefreshStatusAvailable) {
            NSLog(@"- %@ failed to start, status: %ld", BACKGROUND_FETCH_TAG, (long)status);
            [call reject:@"Failed to start" :nil :nil :@{@"status":@(status)}];
        } else {
            [call resolve:@{@"status":@(status)}];
        }
    }];
}

- (void)start:(CAPPluginCall *) call {
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];
    [fetchManager status:^(UIBackgroundRefreshStatus status) {
        if (status == UIBackgroundRefreshStatusAvailable) {
            [fetchManager addListener:PLUGIN_ID callback:[self createFetchCallback] timeout:[self createFetchTimeoutCallback]];
            NSError *error = [fetchManager start:nil];
            if (!error) {
                [call resolve:@{@"status":@(status)}];
            } else {
                [call reject:error.localizedDescription :nil :nil :error.userInfo];
            }
        } else {
            NSLog(@"- %@ failed to start, status: %lu", PLUGIN_ID, (long)status);
            NSString *msg = [NSString stringWithFormat:@"%ld", (long) status];
            [call reject:msg :nil :nil :@{}];
        }
    }];
}
- (void)stop:(CAPPluginCall *) call {
    NSString *taskId = [call getString:@"taskId" defaultValue:nil];
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];
    if (!taskId) {
        [fetchManager removeListener:PLUGIN_ID];
    }
    [fetchManager stop:taskId];
    [call resolve];
}
- (void)scheduleTask:(CAPPluginCall *) call {
    NSDictionary *config = [call getObject:@"options" defaultValue:@{}];
    NSString *taskId = [config objectForKey:@"taskId"];
    long delayMS = [[config objectForKey:@"delay"] longValue];
    NSTimeInterval delay = delayMS / 1000;
    BOOL periodic = [[config objectForKey:@"periodic"] boolValue];
    BOOL requiresCharging = ([config objectForKey:@"requiresCharging"]) ? [[config objectForKey:@"requiresCharging"] boolValue] : NO;
    BOOL requiresNetwork = ([config objectForKey:@"requiresNetworkConnectivity"]) ? [[config objectForKey:@"requiresNetworkConnectivity"] boolValue] : NO;

    NSError *error = [[TSBackgroundFetch sharedInstance] scheduleProcessingTaskWithIdentifier:taskId
                                                                                        delay:delay
                                                                                     periodic:periodic
                                                                        requiresExternalPower: requiresCharging
                                                                  requiresNetworkConnectivity:requiresNetwork
                                                                                     callback:[self createTaskCallback]];
    if (!error) {
        [call resolve];
    } else {
        [call reject:error.localizedDescription :nil :nil :error.userInfo];
    }
}

- (void)finish:(CAPPluginCall *) call {
    NSString *taskId = [call getString:@"taskId" defaultValue:nil];
    TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];
    [fetchManager finish:taskId];
    [call resolve];
}
- (void)status:(CAPPluginCall *) call {
    [[TSBackgroundFetch sharedInstance] status:^(UIBackgroundRefreshStatus status) {
        [call resolve:@{@"status":@(status)}];
    }];
}

-(void (^)(NSString* taskId)) createFetchCallback {
    return ^void(NSString* taskId){
        NSLog(@"- %@ Received fetch event %@", BACKGROUND_FETCH_TAG, taskId);
        [self notifyListeners:EVENT_FETCH data:@{
            @"taskId":taskId,
            @"timeout":@(NO)
        }];
    };
}

-(void (^)(NSString* taskId)) createFetchTimeoutCallback {
    return ^void(NSString* taskId){
        [self notifyListeners:EVENT_FETCH data:@{
            @"taskId":taskId,
            @"timeout":@(YES)
        }];
    };
}

-(void (^)(NSString* taskId, BOOL timeout)) createTaskCallback {
    return ^void(NSString* taskId, BOOL timeout){
        NSLog(@"- %@ Received event event %@", BACKGROUND_FETCH_TAG, taskId);
        [self notifyListeners:EVENT_FETCH data:@{
            @"taskId": taskId,
            @"timeout": @(timeout)
        }];
    };
}

- (void)dealloc
{

}

@end
