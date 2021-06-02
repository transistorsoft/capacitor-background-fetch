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
        jcenter()
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
