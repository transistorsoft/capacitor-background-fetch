# Android Setup (REQUIRED)

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

## Gradle Configuration

The SDK requires a custom __`maven url`__ in the root __`android/build.gradle`__:

### :open_file_folder: **`android/build.gradle`**

```diff
allprojects {
    repositories {
        google()
        mavenCentral()
+       maven {
+           // capacitor-background-fetch
+           url("${project(':transistorsoft-capacitor-background-fetch').projectDir}/libs")
+       }

    }
}
```

## Configure __`proguard-rules.pro`__

1.  In *Android Studio*, edit `android/app/proguard-rules.pro (ProGuard rules for android.app)`.
2.  Add the following rule:

```bash
# [capacitor-background-fetch]
-keep class **BackgroundFetchHeadlessTask { *; }
```

## Precise event-scheduling with `forceAlarmManager: true`:

**Only** If you wish to use precise scheduling of events with __`forceAlarmManager: true`__, *Android 14 (SDK 34)*, has restricted usage of ["`AlarmManager` exact alarms"](https://developer.android.com/about/versions/14/changes/schedule-exact-alarms).  To continue using precise timing of events with *Android 14*, you can manually add this permission to your __`AndroidManifest`__.  Otherwise, the plugin will gracefully fall-back to "*in-exact* `AlarmManager` scheduling":

:open_file_folder: In your `AndroidManifest`, add the following permission (**exactly as-shown**):

```xml
  <manifest>
      <uses-permission android:minSdkVersion="34" android:name="android.permission.USE_EXACT_ALARM" />
      .
      .
      .
  </manifest>
```
:warning: It has been announced that *Google Play Store* [has plans to impose greater scrutiny](https://support.google.com/googleplay/android-developer/answer/13161072?sjid=3640341614632608469-NA) over usage of this permission (which is why the plugin does not automatically add it).

