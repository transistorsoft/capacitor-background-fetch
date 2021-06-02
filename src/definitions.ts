interface AbstractConfig {
  /**
  * __[Android only]__ Set false to continue background-fetch events after user terminates the app.  Default to true.
  */
  stopOnTerminate?:boolean;
  /**
  * __[Android only]__ Set true to initiate background-fetch events when the device is rebooted.  Defaults to false.
  */
  startOnBoot?:boolean;
  /**
  * __[Android only]__ Set true to enable Headless mechanism for handling fetch events after app termination.
  *
  * ```javascript
  * const status = await BackgroundFetch.configure({
  *   minimumFetchInterval: 15,
  *   stopOnTerminate: false,  // <-- required
  *   enableHeadless: true     // <-- required
  * }, async (taskId) => {
  *   console.log('[BackgroundFetch] EVENT', taskId);
  *   BackgroundFetch.finish(taskId);
  * }, async (taskId) => {
  *   console.log('[BackgroundFetch] TIMEOUT', taskId);
  *   BackgroundFetch.finish(taskId);
  * })
  * ```
  * ## Android Headless Setup
  *
  * - With your app open in *Android Studio*, browse the __`app`__ folder to find the __`MainActivity`__ class.  Right-click the *containing folder* and click __*New &gt; Java Class*__.
  * ![](https://dl.dropbox.com/s/ao511vydybru03y/capacitor-background-fetch-headless-setup-step1.png?dl=1)
  *
  * - You __MUST__ name the file __`BackgroundFetchHeadlessTask`__.
  * ![](https://dl.dropbox.com/s/h15plzjh8mcsbur/capacitor-background-fetch-headless-setup-step2.png?dl=1)
  *
  * - Add the following Java code to __`BackgroundFetchHeadlessTask`__, taking care to preserve the top line:
  *
  * __`package com.your.package.name`__:
  *
  *
  * ```java
  * package com.your.package.name  // <-- DO NOT REPLACE THIS LINE!!!!!!!!!!!!
  *
  * /// ---------------- Paste everything BELOW THIS LINE: -----------------------
  * import android.content.Context;
  * import android.util.Log;
  *
  * import com.transistorsoft.tsbackgroundfetch.BackgroundFetch;
  * import com.transistorsoft.tsbackgroundfetch.BGTask;
  *
  * public class BackgroundFetchHeadlessTask{
  *     public void onFetch(Context context,  BGTask task) {
  *         // Get a reference to the BackgroundFetch Android API.
  *         BackgroundFetch backgroundFetch = BackgroundFetch.getInstance(context);
  *         // Get the taskId.
  *         String taskId = task.getTaskId();
  *         // Log a message to adb logcat.
  *         Log.d("MyHeadlessTask", "BackgroundFetchHeadlessTask onFetch -- CUSTOM IMPLEMENTATION: " + taskId);
  *
  *         boolean isTimeout = task.getTimedOut();
  *         // Is this a timeout?
  *         if (isTimeout) {
  *           backgroundFetch.finish(taskId);
  *           return;
  *         }
  *         // Do your work here...
  *         //
  *         //
  *         // Signal finish just like the Javascript API.
  *         backgroundFetch.finish(taskId);
  *     }
  * }
  * ```
  *
  * ## Testing Your Headless-task:
  *
  * After terminating your app with Javascript configuration above, simulate a fetch-event while observing __`$ adb logcat`__
  *
  * In the following command, replace __`com.your.app.package.name`__ with your app's *actual* package-name:
  *
  * ```bash
  * adb shell cmd jobscheduler run -f com.your.app.package.name 999
  * ```
  *
  * &nbsp;
  *
  * ```bash
  * $ adb logcat
  *
  * TSBackgroundFetch: - Background Fetch event received: capacitor-background-fetch
  * MyHeadlessTask: BackgroundFetchHeadlessTask onFetch -- CUSTOM IMPLEMENTATION: capacitor-background-fetch
  * TSBackgroundFetch: - finish: capacitor-background-fetch
  * TSBackgroundFetch: - jobFinished
  *
  * ```
  */
  enableHeadless?:boolean;
  /**
  * __[Android only]__
  *
  * By default,  the `BackgroundFetch` Android SDK will use [JobScheduler](https://medium.com/google-developers/scheduling-jobs-like-a-pro-with-jobscheduler-286ef8510129) to schedule tasks, which are subject to throttling.  For more accurate scheduling of tasks (at the expense of higher battery-usage), you can tell `BackgroundFetch` to use Android's [AlarmManager](https://developer.android.com/training/scheduling/alarms).
  *
  * __Note__:  All "criteria" options will no longer apply, since these are available only with [[JobScheduler]].
  *
  * - [[requiredNetworkType]]
  * - [[requiresBatteryNotLow]]
  * - [[requiresStorageNotLow]]
  * - [[requiresCharging]]
  * - [[requiresDeviceIdle]]
  */
  forceAlarmManager?:boolean;
  /**
  * __[Android only]__ Set detailed description of the kind of network your job requires.
  *
  * If your job doesn't need a network connection, you don't need to use this option, as the default is [[BackgroundFetch.NETWORK_TYPE_NONE]].
  *
  * Calling this method defines network as a strict requirement for your job. If the network requested is not available your job will never run.
  */
  requiredNetworkType?:NetworkType;
  /**
  * __[Android only]__ Specify that to run this job, the device's battery level must not be low.
  *
  * This defaults to false. If true, the job will only run when the battery level is not low, which is generally the point where the user is given a "low battery" warning.
  */
  requiresBatteryNotLow?:boolean;
  /**
  * __[Android only]__ Specify that to run this job, the device's available storage must not be low.
  *
  * This defaults to false. If true, the job will only run when the device is not in a low storage state, which is generally the point where the user is given a "low storage" warning.
  */
  requiresStorageNotLow?:boolean;
  /**
  * __[Android only]__ Specify that to run this job, the device must be charging (or be a non-battery-powered device connected to permanent power, such as Android TV devices). This defaults to false.
  */
  requiresCharging?:boolean;
  /**
  * __[Android only]__ When set true, ensure that this job will not run if the device is in active use.
  *
  * The default state is false: that is, the for the job to be runnable even when someone is interacting with the device.
  *
  * This state is a loose definition provided by the system. In general, it means that the device is not currently being used interactively, and has not been in use for some time. As such, it is a good time to perform resource heavy jobs. Bear in mind that battery usage will still be attributed to your application, and surfaced to the user in battery stats.
  */
  requiresDeviceIdle?:boolean;
}

/**
 * Configuration API for [[BackgroundFetch.scheduleTask]].
 *
 * ```javascript
 * BackgroundFetch.scheduleTask({
 *   taskId: 'my-custom-task',
 *   delay: 10000,
 *   periodic: false,
 *   enableHeadless: true,
 *   stopOnTerminate: false,
 *   startOnBoot: true,
 *   forceAlarmManager: false,
 *   requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
 *   requiresBatteryNotLow: false,
 *   requiresCharging: false,
 *   requiresDeviceIdle: false,
 *   requiresStorageNotLow: false
 * });
 * ```
 */
export interface TaskConfig extends AbstractConfig {
  /**
  * The name of the task.  This will be used with [[BackgroundFetch.finish]] to signal task-completion.
  */
  taskId:string;
  /**
  * The minimum interval in milliseconds to execute this task.
  */
  delay:number;
  /**
  * Whether this task will continue executing or just a "one-shot".
  */
  periodic?:boolean;
}

/**
 * Configuration API for [[BackgroundFetch.configure]].
 *
 * ```javascript
 * const status = await BackgroundFetch.configure({
 *   minimumFetchInterval: 15,
 *   enableHeadless: true,
 *   stopOnTerminate: false,
 *   startOnBoot: true,
 *   forceAlarmManager: false,
 *   requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE,
 *   requiresBatteryNotLow: false,
 *   requiresCharging: false,
 *   requiresDeviceIdle: false,
 *   requiresStorageNotLow: false
 * });
 * ```
 */
export interface BackgroundFetchConfig extends AbstractConfig {
  /**
  * The minimum interval in minutes to execute background fetch events.  Defaults to 15 minutes.  Minimum is 15 minutes.
  */
  minimumFetchInterval?:number;
}

/**
* | BackgroundFetchStatus              | Description                                     |
* |------------------------------------|-------------------------------------------------|
* | `BackgroundFetch.STATUS_RESTRICTED`  | Background fetch updates are unavailable and the user cannot enable them again. For example, this status can occur when parental controls are in effect for the current user. [See iOS Docs](https://developer.apple.com/documentation/uikit/uibackgroundrefreshstatus/restricted)|
* | `BackgroundFetch.STATUS_DENIED`      | The user explicitly disabled background behavior for this app or for the whole system.  [See iOS Docs](https://developer.apple.com/documentation/uikit/uibackgroundrefreshstatus/denied)|
* | `BackgroundFetch.STATUS_AVAILABLE`   | Background fetch is available and enabled.      |
*/
export type BackgroundFetchStatus = 0 | 1 | 2;

/**
* | NetworkType                           | Description                                                   |
* |---------------------------------------|---------------------------------------------------------------|
* | `BackgroundFetch.NETWORK_TYPE_NONE`     | This job doesn't care about network constraints, either any or none.                         |
* | `BackgroundFetch.NETWORK_TYPE_ANY`      | This job requires network connectivity.                          |
* | `BackgroundFetch.NETWORK_TYPE_CELLULAR` | This job requires network connectivity that is a cellular network. |
* | `BackgroundFetch.NETWORK_TYPE_UNMETERED` | This job requires network connectivity that is unmetered. |
* | `BackgroundFetch.NETWORK_TYPE_NOT_ROAMING` | This job requires network connectivity that is not roaming. |
*/
export type NetworkType = 0 | 1 | 2 | 3 | 4;

