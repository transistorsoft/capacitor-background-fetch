# CHANGELOG

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
