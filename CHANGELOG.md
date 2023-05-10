# CHANGELOG

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
