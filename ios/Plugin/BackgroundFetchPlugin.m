#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(BackgroundFetchModule, "BackgroundFetch",
           CAP_PLUGIN_METHOD(configure, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(start, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(stop, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(scheduleTask, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(finish, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(status, CAPPluginReturnPromise);
)
