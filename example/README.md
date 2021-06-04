# Demo App

## Installation

- First clone the plugin repo.

```console
git clone https://github.com/transistorsoft/capacitor-background-fetch.git
cd capacitor-background-fetch
```

- Now compile the plugin's typescript source code.

```console
npm install
npm run build
```

- Now install the `/example` as you would any Capacitor app.

```console
cd example
npm install

ionic build
npx cap sync
```

- Now run it:

```console
ionic capacitor run android
ionic capacitor run ios
```

## Simulating events.

### Android

```console
adb shell cmd jobscheduler run -f com.transistorsoft.backgroundfetch.capacitor.demo 999
```

The `/example` folder has a script that can run the command above:

```console
./scripts/simulate-fetch
```

### iOS

See the plugin [README](../README.md#ios-simulated-events) to learn how to simulate iOS fetch events.

```console
 e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"com.transistorsoft.fetch"]
```

