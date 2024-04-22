# CHANGELOG

## [5.2.5] &mdash; 2024-04-22
* [iOS] Code-sign `TSBackgroundFetch.xcframework` with new Apple Organization (*9224-2932 Quebec Inc*) certificate.

## [5.2.4] &mdash; 2024-03-28
* [iOS] Add `ios/Resources` to package.json or npm publish ignores the new Privacy Manifest.

## [5.2.3] &mdash; 2024-03-28
* [iOS] codesign `TSBackgroundFetch`
* [iOS] Add PrivacyInfo -> TSBackgroundFetch.xcframework

## [5.2.2] &mdash; 2024-03-19
* [iOS] Implement new [iOS Privacy Manifest](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files?language=objc)

## [5.2.0] &mdash; 2024-03-15
* [iOS] Only allow registration of `BGProcessingTasks` (*Permitted background task scheduler identifiers*) in `Info.plist` which are prefixed with `com.transistorsoft`.  Any other task identifier will be ignored.

## [5.1.1] &mdash; 2023-08-20
* [Android] Detect and dispose of duplicate events.  Android `JobService` has a bug for devices running <= Android M where multiple `backgrou
nd-fetch` events could fire within the same second.

## [5.1.0] &mdash; 2023-07-31
* [Android] Android 14 (SDK 34) support..
* [Android] Android 14 support:  When using `forceAlarmManager: true`, you must now optionally add the permission `android.permission.SCHEDULE_EXACT_ALARM` to your `AndroidManifest` to schedule **exact** alarms.  Otherwise `AlarmManager` will use **in-exact** alarms.
:open_file_folder: `AndroidManifest`
```xml
<manifest>
    <!-- [background-fetch] OPTIONAL:  allows forceAlarmManager: true to use exact alarms -->
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" android:maxSdkVersion="33" />
    .
    .
    .
</manifest>
```

## [5.0.0] &mdash; 2023-05-10
* Capacitor 5 support.

## [1.0.4] &mdash; 2023-05-03
* [Android] Gradle v8 now requires `namespace` attribute in gradle files.

## [1.0.3] &mdash; 2023-02-21
* [Android] log the jobId in `adb logcat` so that developers can simulate execution of `scheduleTask`:
```console
adb shell cmd jobscheduler run -f com.transistorsoft.backgroundfetch.capacitor.demo {jobId_here}
```
* Update /example to use latest @capacitor/cli:
```console
💊   Capacitor Doctor  💊

Latest Dependencies:

  @capacitor/cli: 4.6.3
  @capacitor/core: 4.6.3
  @capacitor/android: 4.6.3
  @capacitor/ios: 4.6.3

Installed Dependencies:

  @capacitor/cli: 4.6.3
  @capacitor/core: 4.6.3
  @capacitor/android: 4.6.3
  @capacitor/ios: 4.6.3
```

## [1.0.2] &mdash; 2022-11-11
* Update peerDependencies `"@capacitor/core": "^4.0.0"`.

## [1.0.1] &mdash; 2022-10-11
* [Android] Use `LifecycleManager` for modern headless-detection instead of legacy mechanism requiring permission `GET_TASKS`.

## [1.0.0] &mdash; 2022-04-06
* [Android] Update for Android 12:  add new required permission android.permission.SCHEDULE_EXACT_ALARM

## [0.0.6] &mdash; 2021-06-30
* [Changed][Android] Allow multiple calls to .configure to allow re-configuring the fetch task.  Existing task will be cancelled and a new periodic fetch task re-scheduled according to new config.
* [Changed][Android] Ignore initial fetch task fired immediately.
* [Changed][Android] `android:exported="false"` on `BootReceiver` to resolve reported security analysis.

## [0.0.5] &mdash; 2021-06-08
- Re-name iOS class Plugin -> BackgroundGeolocationModule.  Was a name collision with generic name.
- Specify `static_framework = true` in podspec.

## [0.0.4] &mdash; 2021-06-05
- Sanity-check delay provided to scheduleTask in JS API is a number.  Attempt to parseInt when not.

## [0.0.3] &mdash; 2021-06-02
- Initial Capacitor Beta Version
