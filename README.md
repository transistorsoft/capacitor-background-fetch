# @transistorsoft/capacitor-background-fetch

[![](https://dl.dropboxusercontent.com/s/nm4s5ltlug63vv8/logo-150-print.png?dl=1)](https://www.transistorsoft.com)

By [**Transistor Software**](http://transistorsoft.com), creators of [**Capacitor Background Geolocation**](http://www.transistorsoft.com/shop/products/capacitor-background-geolocation)

------------------------------------------------------------------------------

*Background Fetch* is a *very* simple plugin which attempts to awaken an app in the background about **every 15 minutes**, providing a short period of background running-time.  This plugin will execute your provided `callbackFn` whenever a background-fetch event occurs.

There is **no way** to increase the rate which a fetch-event occurs and this plugin sets the rate to the most frequent possible &mdash; you will **never** receive an event faster than **15 minutes**.  The operating-system will automatically throttle the rate the background-fetch events occur based upon usage patterns.  Eg: if user hasn't turned on their phone for a long period of time, fetch events will occur less frequently or if an iOS user disables background refresh they may not happen at all.

:new: Background Fetch now provides a [__`scheduleTask`__](#executing-custom-tasks) method for scheduling arbitrary "one-shot" or periodic tasks.

### iOS
- There is **no way** to increase the rate which a fetch-event occurs and this plugin sets the rate to the most frequent possible &mdash; you will **never** receive an event faster than **15 minutes**.  The operating-system will automatically throttle the rate the background-fetch events occur based upon usage patterns.  Eg: if user hasn't turned on their phone for a long period of time, fetch events will occur less frequently.
- [__`scheduleTask`__](#executing-custom-tasks) seems only to fire when the device is plugged into power.
- ⚠️ When your app is **terminated**, iOS *no longer fires events* &mdash; There is *no such thing* as [__`stopOnTerminate: false`__](https://transistorsoft.github.io/capacitor-background-fetch/interfaces/backgroundfetchconfig.html#stoponterminate) for iOS.
- iOS can take *days* before Apple's machine-learning algorithm settles in and begins regularly firing events.  Do not sit staring at your logs waiting for an event to fire.  If your [*simulated events*](#debugging) work, that's all you need to know that everything is correctly configured.
- If the user doesn't open your *iOS* app for long periods of time, *iOS* will **stop firing events**.

### Android
- The Android plugin provides a __*Headless*__ mechanism allowing you to continue handling events even after app-termination (see [Receiving Events After App Termination](#receiving-events-after-app-termination-1))

-------------------------------------------------------------

# Contents
- ### :books: [API Documentation](https://transistorsoft.github.io/capacitor-background-fetch/)
- ### [Installing the Plugin](#installing-the-plugin)
- ### [Setup Guides](#setup-guides)
  - [iOS Setup](help/INSTALL-IOS.md)
  - [Android Setup](help/INSTALL-ANDROID.md)
- ### [Example](#example)
- ### [Receiving events after app termination](#receiving-events-after-app-termination-1)
- ### [Debugging](#debugging)

-------------------------------------------------------------

## Installing the plugin

### With `yarn`

```bash
$ yarn add @transistorsoft/capacitor-background-fetch
$ npx cap sync
```

### With `npm`
```bash
$ npm install --save @transistorsoft/capacitor-background-fetch
$ npx cap sync
```

- Proceed to [Required Setup Guides](#setup-guides)

## Setup Guides

### iOS Setup

- [Required Setup](help/INSTALL-IOS.md)

### Android Setup

- [Required Setup](help/INSTALL-ANDROID.md)

## Example ##

:information_source: This repo contains its own *Example App*.  See [`/example`](./example/README.md)

#### Angular Example:

- See API Docs [__`BackgroundFetch.configure`__](https://transistorsoft.github.io/capacitor-background-fetch/classes/backgroundfetch.html#configure)

```javascript
import { Component } from '@angular/core';

import {BackgroundFetch} from '@transistorsoft/capacitor-background-fetch';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor() {}

  // Initialize in ngAfterContentInit
  // [WARNING] DO NOT use ionViewWillEnter, as that method won't run when app is launched in background.
  ngAfterContentInit() {
    this.initBackgroundFetch();
  }

  async initBackgroundFetch() {
    const status = await BackgroundFetch.configure({
      minimumFetchInterval: 15
    }, async (taskId) => {
      console.log('[BackgroundFetch] EVENT:', taskId);
      // Perform your work in an awaited Promise
      const result = await this.performYourWorkHere();
      console.log('[BackgroundFetch] work complete:', result);
      // [REQUIRED] Signal to the OS that your work is complete.
      BackgroundFetch.finish(taskId);
    }, async (taskId) => {
      // The OS has signalled that your remaining background-time has expired.
      // You must immediately complete your work and signal #finish.
      console.log('[BackgroundFetch] TIMEOUT:', taskId);
      // [REQUIRED] Signal to the OS that your work is complete.
      BackgroundFetch.finish(taskId);
    });

    // Checking BackgroundFetch status:
    if (status !== BackgroundFetch.STATUS_AVAILABLE) {
      // Uh-oh:  we have a problem:
      if (status === BackgroundFetch.STATUS_DENIED) {
        alert('The user explicitly disabled background behavior for this app or for the whole system.');
      } else if (status === BackgroundFetch.STATUS_RESTRICTED) {
        alert('Background updates are unavailable and the user cannot enable them again.')
      }
    }
  }

  async performYourWorkHere() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(true);
      }, 5000);
    });
  }
}
```

## Receiving Events After App Termination

- Only Android is able to continue receiving events after app termination.  See API Docs [__`enableHeadless`__](https://transistorsoft.github.io/capacitor-background-fetch/interfaces/backgroundfetchconfig.html#enableheadless).
- For iOS, there is __NO SUCH THING__ as [__`stopOnTerminate: false`__](https://transistorsoft.github.io/capacitor-background-fetch/interfaces/backgroundfetchconfig.html#stoponterminate).  When an iOS app is terminated, the OS will **no longer fire events**.

## Executing Custom Tasks

In addition to the default background-fetch task defined by [__`BackgroundFetch.configure`__](https://transistorsoft.github.io/capacitor-background-fetch/classes/backgroundfetch.html#configure), you may also execute your own arbitrary "oneshot" or periodic tasks (iOS requires additional [Setup Instructions](help/INSTALL-IOS.md#configure-infoplist-new-ios-13)).  See API Docs [__`BackgroundFetch.scheduleTask`__](https://transistorsoft.github.io/capacitor-background-fetch/classes/backgroundfetch.html#scheduletask).  However, all events will be fired into the Callback provided to [__`BackgroundFetch.configure`__](https://transistorsoft.github.io/capacitor-background-fetch/classes/backgroundfetch.html#configure).

### ⚠️ iOS:
- [__`BackgroundFetch.scheduleTask`__](https://transistorsoft.github.io/capacitor-background-fetch/classes/backgroundfetch.html#scheduletask) on *iOS* seems only to run when the device is plugged into power.
- [__`BackgroundFetch.scheduleTask`__](https://transistorsoft.github.io/capacitor-background-fetch/classes/backgroundfetch.html#scheduletask) on *iOS* are designed for *low-priority* tasks, such as purging cache files &mdash; they tend to be **unreliable for mission-critical tasks**.  [__`BackgroundFetch.scheduleTask`__](https://transistorsoft.github.io/capacitor-background-fetch/classes/backgroundfetch.html#scheduletask) will *never* run as frequently as you want.
- The default `fetch` event is much more reliable and fires far more often.
- [__`BackgroundFetch.scheduleTask`__](https://transistorsoft.github.io/capacitor-background-fetch/classes/backgroundfetch.html#scheduletask) on *iOS* stop when the *user* terminates the app.  There is no such thing as [__`stopOnTerminate: false`__](https://transistorsoft.github.io/capacitor-background-fetch/interfaces/backgroundfetchconfig.html#stoponterminate) for *iOS*.

```javascript
// Step 1:  Configure BackgroundFetch as usual.
let status = await BackgroundFetch.configure({
  minimumFetchInterval: 15
}, async (taskId) => {  // <-- Event callback
  // This is the fetch-event callback.
  console.log("[BackgroundFetch] taskId: ", taskId);

  // Use a switch statement to route task-handling.
  switch (taskId) {
    case 'com.foo.customtask':
      print("Received custom task");
      break;
    default:
      print("Default fetch task");
  }
  // Finish, providing received taskId.
  BackgroundFetch.finish(taskId);
}, async (taskId) => {  // <-- Task timeout callback
  // This task has exceeded its allowed running-time.
  // You must stop what you're doing and immediately .finish(taskId)
  BackgroundFetch.finish(taskId);
});

// Step 2:  Schedule a custom "oneshot" task "com.foo.customtask" to execute 5000ms from now.
BackgroundFetch.scheduleTask({
  taskId: "com.foo.customtask",
  forceAlarmManager: true,
  delay: 5000  // <-- milliseconds
});
```


## Debugging

### iOS Simulated Events

#### :new: `BGTaskScheduler` API for iOS 13+

- :warning: At the time of writing, the new task simulator does not yet work in Simulator; Only real devices.  Use [Old BackgroundFetch API](#old-backgroundfetch-api) so simulate events in Simulator.
- See Apple docs [Starting and Terminating Tasks During Development](https://developer.apple.com/documentation/backgroundtasks/starting_and_terminating_tasks_during_development?language=objc)
- After running your app in XCode, Click the `[||]` button to initiate a *Breakpoint*.
- In the console `(lldb)`, paste the following command (**Note:**  use cursor up/down keys to cycle through previously run commands):
```obj-c
e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"com.transistorsoft.fetch"]
```
- Click the `[ > ]` button to continue.  The task will execute and the Callback function provided to [__`BackgroundFetch.configure`__](https://transistorsoft.github.io/capacitor-background-fetch/classes/backgroundfetch.html#configure) will receive the event.


![](https://dl.dropboxusercontent.com/s/zr7w3g8ivf71u32/ios-simulate-bgtask-pause.png?dl=1)

![](https://dl.dropboxusercontent.com/s/87c9uctr1ka3s1e/ios-simulate-bgtask-paste.png?dl=1)

![](https://dl.dropboxusercontent.com/s/bsv0avap5c2h7ed/ios-simulate-bgtask-play.png?dl=1)

#### Simulating task-timeout events

- Only the new `BGTaskScheduler` api supports *simulated* task-timeout events.  To simulate a task-timeout, your `fetchCallback` must not call [__`BackgroundFetch.finish(taskId)`__](https://transistorsoft.github.io/capacitor-background-fetch/classes/backgroundfetch.html#finish):

```javascript
const status = await BackgroundFetch.configure({
  minimumFetchInterval: 15
}, async (taskId) => {  // <-- Event callback.
  // This is the task callback.
  console.log("[BackgroundFetch] taskId", taskId);
  //BackgroundFetch.finish(taskId); // <-- Disable .finish(taskId) when simulating an iOS task timeout
}, async (taskId) => {  // <-- Event timeout callback
  // This task has exceeded its allowed running-time.
  // You must stop what you're doing and immediately .finish(taskId)
  console.log("[BackgroundFetch] TIMEOUT taskId:", taskId);
  BackgroundFetch.finish(taskId);
});
```

- Now simulate an iOS task timeout as follows, in the same manner as simulating an event above:
```obj-c
e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateExpirationForTaskWithIdentifier:@"com.transistorsoft.fetch"]
```

#### Old `BackgroundFetch` API
- Simulate background fetch events in XCode using **`Debug->Simulate Background Fetch`**
- iOS can take some hours or even days to start a consistently scheduling background-fetch events since iOS schedules fetch events based upon the user's patterns of activity.  If *Simulate Background Fetch* works, your can be **sure** that everything is working fine.  You just need to wait.

### Android Simulated Events

- Observe plugin logs in `$ adb logcat`:

```bash
$ adb logcat *:S TSBackgroundFetch:V Capacitor/Console:V Capacitor/Plugin:V
```

- Simulate a background-fetch event on a device (insert *&lt;your.application.id&gt;*) (only works for sdk `21+`:
```bash
$ adb shell cmd jobscheduler run -f <your.application.id> 999
```
- For devices with sdk `<21`, simulate a "Headless JS" event with (insert *&lt;your.application.id&gt;*)
```bash
$ adb shell am broadcast -a <your.application.id>.event.BACKGROUND_FETCH

```

## Licence

The MIT License

Copyright (c) 2013 Chris Scott, Transistor Software <chris@transistorsoft.com>
http://transistorsoft.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
