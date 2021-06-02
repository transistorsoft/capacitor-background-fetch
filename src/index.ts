import {
  registerPlugin,
  PluginListenerHandle,
  PluginResultError
} from '@capacitor/core';

import type {
  BackgroundFetchConfig,
  BackgroundFetchStatus,
  TaskConfig,
  NetworkType,
} from './definitions';

const EVENT_FETCH:string = "fetch";
const TAG:string         = "BackgroundFetch";

const STATUS_RESTRICTED:BackgroundFetchStatus = 0;
const STATUS_DENIED:BackgroundFetchStatus     = 1;
const STATUS_AVAILABLE:BackgroundFetchStatus  = 2;

const NETWORK_TYPE_NONE:NetworkType         = 0;
const NETWORK_TYPE_ANY:NetworkType          = 1;
const NETWORK_TYPE_UNMETERED:NetworkType    = 2;
const NETWORK_TYPE_NOT_ROAMING:NetworkType  = 3;
const NETWORK_TYPE_CELLULAR:NetworkType     = 4;

const NativeModule:any = registerPlugin('BackgroundFetch');

let subscriber:PluginListenerHandle | null = null;

/**
* BackgroundFetch is a module to receive periodic callbacks (min every 15 min) while your app is running in the background or terminated.
*
* ```javascript
* import {BackgroundFetch} from '@transistorsoft/capacitor-background-fetch';
*
* class HomePage {
*   ionViewWillEnter() {
*     this.initBackgroundFetch();
*   }
*
*   async initBackgroundFetch() {
*     const status = await BackgroundFetch.configure({
*       minimumFetchInterval: 15
*     }, async (taskId) => {  // <---------------- Event handler.
*       console.log('[BackgroundFetch] EVENT:', taskId);
*       // Perform your work in an awaited Promise
*       const result = await this.performYourWorkHere();
*       console.log('[BackgroundFetch] work complete:', result);
*       // [REQUIRED] Signal to the OS that your work is complete.
*       BackgroundFetch.finish(taskId);
*     }, async (taskId) => {  // <---------------- Event timeout handler
*       // The OS has signalled that your remaining background-time has expired.
*       // You must immediately complete your work and signal #finish.
*       console.log('[BackgroundFetch] TIMEOUT:', taskId);
*       // [REQUIRED] Signal to the OS that your work is complete.
*       BackgroundFetch.finish(taskId);
*     });
*
*     // Checking BackgroundFetch status:
*     if (status !== BackgroundFetch.STATUS_AVAILABLE) {
*       // Uh-oh:  we have a problem:
*       if (status === BackgroundFetch.STATUS_DENIED) {
*         alert('The user explicitly disabled background behavior for this app or for the whole system.');
*       } else if (status === BackgroundFetch.STATUS_RESTRICTED) {
*         alert('Background updates are unavailable and the user cannot enable them again.')
*       }
*     }
*   }
*
*   // Simulate a long-running task (eg:  an HTTP request)
*   async performYourWorkHere() {
*     return new Promise((resolve, reject) => {
*       setTimeout(() => {
*         resolve(true);
*       }, 5000);
*     });
*   }
* }
* ```
* ## iOS
* - There is **no way** to increase the rate which a fetch-event occurs and this plugin sets the rate to the most frequent possible &mdash; you will **never** receive an event faster than **15 minutes**.  The operating-system will automatically throttle the rate the background-fetch events occur based upon usage patterns.  Eg: if user hasn't turned on their phone for a long period of time, fetch events will occur less frequently.
* - [__`scheduleTask`__](#executing-custom-tasks) seems only to fire when the device is plugged into power.
* - ⚠️ When your app is **terminated**, iOS *no longer fires events* &mdash; There is *no such thing* as **`stopOnTerminate: false`** for iOS.
* - iOS can take *days* before Apple's machine-learning algorithm settles in and begins regularly firing events.  Do not sit staring at your logs waiting for an event to fire.  If your [*simulated events*](#debugging) work, that's all you need to know that everything is correctly configured.
* - If the user doesn't open your *iOS* app for long periods of time, *iOS* will **stop firing events**.
*
* ## Android
* - The Android plugin is capable of operating after app terminate (see API docs [[BackgroundFetchConfig.stopOnTerminate]], [[BackgroundFetchConfig.enableHeadless]]) but only by implementing your work with Java code.
*/
export class BackgroundFetch {
  /**
  * Background fetch updates are unavailable and the user cannot enable them again. For example, this status can occur when parental controls are in effect for the current user.
  */
  static get STATUS_RESTRICTED() { return STATUS_RESTRICTED; }
  /**
  * The user explicitly disabled background behavior for this app or for the whole system.
  */
  static get STATUS_DENIED() { return STATUS_DENIED; }
  /**
  * Background fetch is available and enabled.
  */
  static get STATUS_AVAILABLE() { return STATUS_AVAILABLE; }
  /**
  * This job doesn't care about network constraints, either any or none.
  */
  static get NETWORK_TYPE_NONE() { return NETWORK_TYPE_NONE; }
  /**
  * This job requires network connectivity.
  */
  static get NETWORK_TYPE_ANY() { return NETWORK_TYPE_ANY; }
  /**
  * This job requires network connectivity that is a cellular network.
  */
  static get NETWORK_TYPE_CELLULAR() { return NETWORK_TYPE_CELLULAR; }
  /**
  * This job requires network connectivity that is unmetered.
  */
  static get NETWORK_TYPE_UNMETERED() { return NETWORK_TYPE_UNMETERED; }
  /**
  * This job requires network connectivity that is not roaming.
  */
  static get NETWORK_TYPE_NOT_ROAMING() { return NETWORK_TYPE_NOT_ROAMING; }

  /**
  * Initial configuration of BackgroundFetch, including config-options and Fetch-callback.  The [[start]] method will automatically be executed.
  *
  * ```javascript
  *   async initBackgroundFetch() {
  *     const status = await BackgroundFetch.configure({
  *       minimumFetchInterval: 15
  *     }, async (taskId) => {  // <---------------- Event handler.
  *       console.log('[BackgroundFetch] EVENT:', taskId);
  *       // Perform your work in an awaited Promise
  *       const result = await this.performYourWorkHere();
  *       console.log('[BackgroundFetch] work complete:', result);
  *       // [REQUIRED] Signal to the OS that your work is complete.
  *       BackgroundFetch.finish(taskId);
  *     }, async (taskId) => {  // <---------------- Event timeout handler
  *       // The OS has signalled that your remaining background-time has expired.
  *       // You must immediately complete your work and signal #finish.
  *       console.log('[BackgroundFetch] TIMEOUT:', taskId);
  *       // [REQUIRED] Signal to the OS that your work is complete.
  *       BackgroundFetch.finish(taskId);
  *     });
  *
  *     // Checking BackgroundFetch status:
  *     if (status !== BackgroundFetch.STATUS_AVAILABLE) {
  *       // Uh-oh:  we have a problem:
  *       if (status === BackgroundFetch.STATUS_DENIED) {
  *         alert('The user explicitly disabled background behavior for this app or for the whole system.');
  *       } else if (status === BackgroundFetch.STATUS_RESTRICTED) {
  *         alert('Background updates are unavailable and the user cannot enable them again.')
  *       }
  *     }
  *   }
  *
  *   // Simulate a long-running task (eg:  an HTTP request)
  *   async performYourWorkHere() {
  *     return new Promise((resolve, reject) => {
  *       setTimeout(() => {
  *         resolve(true);
  *       }, 5000);
  *     });
  *   }
  * }
  * ```
  */
  static configure(config:BackgroundFetchConfig, onEvent:(taskId:string) => void, onTimeout?:(taskId:string) => void):Promise<BackgroundFetchStatus> {
    if (typeof(onEvent) !== 'function') {
      throw "BackgroundFetch requires an event callback at 2nd argument";
    }
    if (typeof(onTimeout) !== 'function') {
      console.warn("[BackgroundFetch] configure:  You did not provide a 3rd argument onTimeout callback.  This callback is a signal from the OS that your allowed background time is about to expire.  Use this callback to finish what you're doing and immediately call BackgroundFetch.finish(taskId)");
      onTimeout = (taskId:string) => {
        console.warn('[BackgroundFetch] default onTimeout callback fired.  You should provide your own onTimeout callbcak to .configure(options, onEvent, onTimeout)');
        BackgroundFetch.finish(taskId);
      }
    }
    const myOnTimeout:Function = onTimeout;

    if (subscriber !== null) {
      subscriber.remove();
      subscriber = null;
    }

    subscriber = NativeModule.addListener(EVENT_FETCH, (event:any) => {
      if (!event.timeout) {
        onEvent(event.taskId);
      } else {
        myOnTimeout(event.taskId);
      }
    });

    config = config || {};

    return new Promise((resolve:Function, reject:Function) => {
      NativeModule.configure({options:config}).then((result:any) => {
        resolve(result.status);
      }).catch((error:PluginResultError) => {
        console.warn(TAG, "ERROR:", error);
        reject(error.message);
      });
    });
  }

  /**
  * Execute a custom task in addition to the one initially provided to [[configure]].
  * This event can be configured to either a "ONE-SHOT" or "PERIODIC" with [[TaskConfig.periodic]].
  *
  * ```javascript
  * // You must ALWAYS first configure BackgroundFetch.
  * const status = await BackgroundFetch.configure({
  *   minimumFetchInterval: 15
  * }, async (taskId) => {
  *   console.log('[BackgroundFetch] EVENT', taskId);
  *   if (taskId === 'my-custom-task') {
  *     console.log('Handle your custom-task here');
  *   } else {
  *     console.log('This is the default, periodic fetch task');
  *   }
  *   // Always signal completion of your tasks.
  *   BackgroundFetch.finish(taskId);
  * }, async (taskId) => {
  *   console.log('[BackgroundFetch] TIMEOUT', taskId);
  *   if (taskId === 'my-custom-task') {
  *     console.log('My custom task timed-out');
  *   } else {
  *     console.log('The default, periodic fetch task timed-out');
  *   }
  *   BackgroundFetch.finish(taskId);
  * });
  *
  * // Execute an additional custom-task.
  * BackgroundFetch.scheduleTask({
  *   taskId: 'my-custom-task',  // <-- REQUIRED
  *   delay: 10000,              // <-- REQUIRED
  *   periodic: false            // <-- ONE-SHOT (default)
  * })
  * ```
  */
  static scheduleTask(config:TaskConfig):Promise<void> {
    return new Promise((resolve, reject) => {
      return NativeModule.scheduleTask({options:config}).then(() => {
        resolve();
      }).catch((error:PluginResultError) => {
        reject(error.message);
      });
    });
  }

  /**
  * Start subscribing to fetch events.
  *
  * __Note:__ The inital call to [[configure]] *automatically* calls __`BackgroundFetch.start()`__
  *
  * ```javascript
  *   async initBackgroundFetch() {
  *     // Calling .configure() automatically starts the plugin.
  *     const status = await BackgroundFetch.configure({
  *       minimumFetchInterval: 15
  *     }, async (taskId) => {  // <---------------- Event handler.
  *       console.log('[BackgroundFetch] EVENT:', taskId);
  *       BackgroundFetch.finish(taskId);
  *     }, async (taskId) => {  // <---------------- Event timeout handler
  *       console.log('[BackgroundFetch] TIMEOUT:', taskId);
  *       // [REQUIRED] Signal to the OS that your work is complete.
  *       BackgroundFetch.finish(taskId);
  *     });
  *   }
  *
  *   // Stop BackgroundFetch
  *   onClickStop() {
  *     BackgroundFetch.stop();
  *   }
  *
  *   // Re-start BackgroundFetch
  *   onClickStart() {
  *     BackgroundFetch.start();
  *   }
  *
  * ```
  */
  static start():Promise<BackgroundFetchStatus> {
    return new Promise((resolve:Function, reject:Function) => {
      NativeModule.start().then((result:any) => {
        resolve(result.status);
      }).catch((error:PluginResultError) => {
        reject(error.message);
      });
    });
  }

  /**
  * Stop subscribing to fetch events.
  *
  * ```javascript
  * // Stop everything.
  * BackgroundFetch.stop();
  * ```
  *
  * You may also provide an optional __`taskId`__ to stop a [[scheduleTask]]:
  *
  * ```javascript
  * // Stop a particular task scheduled with BackgroundFetch.scheduleTask
  * await BackgroundFetch.scheduleTask({
  *   taskId: 'my-custom-task',
  *   delay: 10000,
  *   periodic: false
  * });
  * .
  * .
  * .
  * BackgroundFetch.stop('my-custom-task');
  * ```
  */
  static stop(taskId?:string):Promise<void> {
    return new Promise((resolve:Function, reject:Function) => {
      NativeModule.stop({taskId:taskId}).then(() => {
        resolve();
      }).catch((error:PluginResultError) => {
        reject(error.message);
      })
    });
  }
  /**
  * You must execute `BackgroundFetch.finish(taskId)` within your fetch-callback to signal completion of your task.
  *
  * If you *fail* to call `.finish()`, the OS __will punish your app for poor behaviour and stop firing events__.
  *
  * ```javascript
  * await BackgroundFetch.configure({
  *   minimumFetchInterval: 15
  * }, async (taskId) => {
  *   console.log('[BackgroundFetch] EVENT', taskId);
  *   // Always signal completion of your tasks.
  *   BackgroundFetch.finish(taskId);
  * }, async (taskId) => {
  *   console.log('[BackgroundFetch] TIMEOUT', taskId);
  *   // Always signal completion of your tasks.
  *   BackgroundFetch.finish(taskId);
  * });
  * ```
  */
  static finish(taskId:string):Promise<void> {
    return NativeModule.finish({taskId: taskId});
  }

  /**
  * Query the BackgroundFetch API status
  *
  * ```javascript
  * // Checking BackgroundFetch status:
  * const status = await BackgroundFetch.status();
  *
  * if (status !== BackgroundFetch.STATUS_AVAILABLE) {
  *   // Uh-oh:  we have a problem:
  *   if (status === BackgroundFetch.STATUS_DENIED) {
  *     alert('The user explicitly disabled background behavior for this app or for the whole system.');
  *   } else if (status === BackgroundFetch.STATUS_RESTRICTED) {
  *     alert('Background updates are unavailable and the user cannot enable them again.')
  *   }
  * }
  * ```
  *
  * | BackgroundFetchStatus              | Description                                     |
  * |------------------------------------|-------------------------------------------------|
  * | `BackgroundFetch.STATUS_RESTRICTED`  | Background fetch updates are unavailable and the user cannot enable them again. For example, this status can occur when parental controls are in effect for the current user. |
  * | `BackgroundFetch.STATUS_DENIED`      | The user explicitly disabled background behavior for this app or for the whole system. |
  * | `BackgroundFetch.STATUS_AVAILABLE`   | Background fetch is available and enabled.      |
  */
  static status():Promise<BackgroundFetchStatus> {
    return new Promise((resolve:Function, reject:Function) => {
      NativeModule.status().then((result:any) => {
        resolve(result.status);
      }).catch((error:PluginResultError) => {
        reject(error.message);
      })
    })
  }
}

export * from './definitions';
