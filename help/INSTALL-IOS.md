# iOS Setup (REQUIRED)

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

### Cocoapods version

```bash
$ pod --version
// if < 1.10.0
$ sudo gem install cocoapods
```

## Configure Background Capabilities

- Open your XCode project with `npx cap open ios`.
- Select the root of your project.  Select **Capabilities** tab.  Enable **Background Modes** and enable the following mode:

- [x] *Background fetch*
- [x] *Background processing* (:new: __iOS 13+__; Only if you intend to use `BackgroundFetch.scheduleTask`)

![](https://dl.dropboxusercontent.com/s/9vik5kxoklk63ob/ios-setup-background-modes.png?dl=1)


## Configure `Info.plist` (:new: __iOS 13+__)
1.  Open your `Info.plist` and add the key *"Permitted background task scheduler identifiers"*

![](https://dl.dropboxusercontent.com/s/t5xfgah2gghqtws/ios-setup-permitted-identifiers.png?dl=1)

2.  Add the **required identifier `com.transistorsoft.fetch`**.

![](https://dl.dropboxusercontent.com/s/kwdio2rr256d852/ios-setup-permitted-identifiers-add.png?dl=1)

3.  If you intend to execute your own custom tasks via **`BackgroundFetch.scheduleTask`**, you must add those custom identifiers as well.  For example, if you intend to execute a custom **`taskId: 'com.transistorsoft.customtask'`**, you must add the identifier **`com.transistorsoft.customtask`** to your *"Permitted background task scheduler identifiers"*, as well.

:warning: A task identifier can be any string you wish, but it's a good idea to prefix them now with `com.transistorsoft.` &mdash;  In the future, the `com.transistorsoft` prefix **may become required**.

```javascript
BackgroundFetch.scheduleTask({
  taskId: 'com.transistorsoft.customtask',
  delay: 60 * 60 * 1000  //  In one hour (milliseconds)
});
```

## `AppDelegate.swift` (:new: __iOS 13+__)

- Edit your __`AppDelegate.swift`__ and add the following code:

```diff
import UIKit
import Capacitor
+import TSBackgroundFetch

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.

+       // [capacitor-background-fetch]
+       let fetchManager = TSBackgroundFetch.sharedInstance();
+       fetchManager?.didFinishLaunching();

        return true
    }

+   // [capacitor-background-fetch]
+   func application(_ application: UIApplication, performFetchWithCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
+       print("BackgroundFetchPlugin AppDelegate received fetch event");
+       let fetchManager = TSBackgroundFetch.sharedInstance();
+       fetchManager?.perform(completionHandler: completionHandler, applicationState: application.applicationState);
+   }
```
