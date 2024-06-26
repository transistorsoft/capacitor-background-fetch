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

:warning: A task identifier can be any string you wish, but it **MUST** be prefixed with `com.transistorsoft.`.

```javascript
BackgroundFetch.scheduleTask({
  taskId: 'com.transistorsoft.customtask',
  delay: 60 * 60 * 1000  //  In one hour (milliseconds)
});
```

## Privacy Manifest

Apple now requires apps provide a [Privacy Manifest for "sensitive" APIs](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api?language=objc) which could be abused for "fingerprinting" a user for malicious marketing activity.

If your app does not yet have a *Privacy Manifest* (__`PrivacyInfo.xcprivacy`__), create one now:

<details>
    <summary>ℹ️ Click here for detailed instructions...</summary>

- In XCode, __`File -> New -> File...`__:

![](https://dl.dropboxusercontent.com/scl/fi/n28028i3fbrxd67u491w2/file-new-PrivacyInfo.png?rlkey=sc7s1lyy8fli2c1hz2cfa4cpm&dl=1)

- Be sure to enable your `Targets: [x] YourApp`:

![](https://dl.dropboxusercontent.com/scl/fi/pmbfn5jypvns6r5pyhnui/file-new-PrivacyInfo-targets.png?rlkey=epvjffar23bxgyi9xax9ys40i&dl=1)


</details>


It's best to edit this file's XML manually.
- :open_file_folder: `ios/App/PrivacyInfo.xcprivacy`
- Add the following block within the `NSPrivacyAccessedAPITypes` `<array>` container:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">

<plist version="1.0">
<dict>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <!-- [1] background_fetch: UserDefaults -->
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>

            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>CA92.1</string>
            </array>
        </dict>        
    </array>
</dict>
</plist>
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
