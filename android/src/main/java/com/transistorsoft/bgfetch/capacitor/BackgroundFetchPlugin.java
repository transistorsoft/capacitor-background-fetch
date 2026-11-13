package com.transistorsoft.bgfetch.capacitor;

import android.app.Activity;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.transistorsoft.tsbackgroundfetch.BackgroundFetch;
import com.transistorsoft.tsbackgroundfetch.BackgroundFetchConfig;
import com.transistorsoft.tsbackgroundfetch.LifecycleManager;

import org.json.JSONException;

import java.lang.ref.WeakReference;

@CapacitorPlugin(name = "BackgroundFetch")
public class BackgroundFetchPlugin extends Plugin {
    public static final String TAG = "BackgroundFetchPlugin";

    private static final String EVENT_FETCH = "fetch";
    private static final String HEADLESS_CLASSNAME = "BackgroundFetchHeadlessTask";
    private static final String FETCH_TASK_ID     = "capacitor-background-fetch";

    @Override
    public void load() {
        super.load();

        Log.d(TAG, "load");
        // Poke BackgroundFetch to come alive.
        BackgroundFetch.getInstance(getContext());
    }

    // (WO-007) The BridgeActivity resumed most recently.  Static because each BridgeActivity has its own Bridge and its own
    // instance of this plugin; weak so that it never keeps a destroyed Activity alive.
    private static WeakReference<Activity> sResumedActivity = new WeakReference<>(null);

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        sResumedActivity = new WeakReference<>(getActivity());
        // (WO-007) A BridgeActivity is on screen, so the app is not headless.  ProcessLifecycleOwner sends no ON_START
        // when the new Activity resumes within 700 ms of the old one's pause, so nothing else clears the flag then.
        LifecycleManager.getInstance().setHeadless(false);
    }

    @Override
    protected void handleOnDestroy() {
        // (WO-007) Only the bridge sees its Activity destroyed in a live process: ProcessLifecycleOwner never sends
        // ON_DESTROY.  Unless the SDK goes headless here, the next fetch goes to this destroyed Bridge's listeners,
        // and nothing finishes it.  getActivity() is this Bridge's own Activity, the one being destroyed.  Two destroys
        // are not a termination:
        // - a configuration-change recreation (WO-003): a new Bridge follows at once;
        // - the destroy of an Activity that is no longer the one resumed last: when an app restarts itself, the new
        //   Activity resumes before the old one is destroyed, and its page is on screen.  React Native ignores that
        //   destroy too: it acts only on its current Activity.
        Activity activity = getActivity();
        if (activity != null && activity == sResumedActivity.get() && !activity.isChangingConfigurations()) {
            LifecycleManager.getInstance().setHeadless(true);
        }
        super.handleOnDestroy();
    }

    @PluginMethod
    public void configure(PluginCall call) {
        JSObject params = call.getObject("options");

        BackgroundFetch adapter = getAdapter();

        BackgroundFetch.Callback callback = new BackgroundFetch.Callback() {
            @Override public void onFetch(String taskId) {
                JSObject event = new JSObject();
                event.put("taskId", taskId);
                event.put("timeout", false);
                notifyListeners(EVENT_FETCH, event);
            }
            @Override public void onTimeout(String taskId) {
                JSObject event = new JSObject();
                event.put("taskId", taskId);
                event.put("timeout", true);
                notifyListeners(EVENT_FETCH, event);
            }
        };
        try {
            adapter.configure(buildConfig(params)
                    .setTaskId(FETCH_TASK_ID)
                    .setIsFetchTask(true)
                    .build(), callback);
            JSObject result = new JSObject();
            result.put("status", BackgroundFetch.STATUS_AVAILABLE);
            call.resolve(result);
        } catch (JSONException e) {
            e.printStackTrace();
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void start(PluginCall call) {
        BackgroundFetch adapter = getAdapter();
        adapter.start(FETCH_TASK_ID);

        JSObject result = new JSObject();
        result.put("status", adapter.status());
        call.resolve(result);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        String taskId = call.getString("taskId");
        if (taskId == null) taskId = FETCH_TASK_ID;
        BackgroundFetch adapter = getAdapter();
        adapter.stop(taskId);
        call.resolve();
    }

    @PluginMethod
    public void scheduleTask(PluginCall call) {
        JSObject params = call.getObject("options");
        BackgroundFetch adapter = getAdapter();
        try {
            adapter.scheduleTask(buildConfig(params).build());
            call.resolve();
        } catch (JSONException e) {
            e.printStackTrace();
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void finish(PluginCall call) {
        String taskId = call.getString("taskId");
        BackgroundFetch adapter = getAdapter();
        adapter.finish(taskId);
        call.resolve();
    }

    @PluginMethod
    public void status(PluginCall call) {
        JSObject result = new JSObject();
        result.put("status", getAdapter().status());
        call.resolve(result);
    }

    private BackgroundFetchConfig.Builder buildConfig(JSObject options) throws JSONException {
        BackgroundFetchConfig.Builder config = new BackgroundFetchConfig.Builder();
        if (options.has(BackgroundFetchConfig.FIELD_MINIMUM_FETCH_INTERVAL)) {
            config.setMinimumFetchInterval(options.getInt(BackgroundFetchConfig.FIELD_MINIMUM_FETCH_INTERVAL));
        }
        if (options.has(BackgroundFetchConfig.FIELD_TASK_ID)) {
            config.setTaskId(options.getString(BackgroundFetchConfig.FIELD_TASK_ID));
        }
        if (options.has(BackgroundFetchConfig.FIELD_DELAY)) {
            Integer delay = options.getInteger(BackgroundFetchConfig.FIELD_DELAY);
            config.setDelay(delay.longValue());
        }
        if (options.has(BackgroundFetchConfig.FIELD_STOP_ON_TERMINATE)) {
            config.setStopOnTerminate(options.getBoolean(BackgroundFetchConfig.FIELD_STOP_ON_TERMINATE));
        }
        if (options.has(BackgroundFetchConfig.FIELD_FORCE_ALARM_MANAGER)) {
            config.setForceAlarmManager(options.getBoolean(BackgroundFetchConfig.FIELD_FORCE_ALARM_MANAGER));
        }
        if (options.has(BackgroundFetchConfig.FIELD_START_ON_BOOT)) {
            config.setStartOnBoot(options.getBoolean(BackgroundFetchConfig.FIELD_START_ON_BOOT));
        }
        if (options.has("enableHeadless") && options.getBoolean("enableHeadless")) {
            config.setJobService(getHeadlessClassName());
        }
        if (options.has(BackgroundFetchConfig.FIELD_REQUIRED_NETWORK_TYPE)) {
            config.setRequiredNetworkType(options.getInt(BackgroundFetchConfig.FIELD_REQUIRED_NETWORK_TYPE));
        }
        if (options.has(BackgroundFetchConfig.FIELD_REQUIRES_BATTERY_NOT_LOW)) {
            config.setRequiresBatteryNotLow(options.getBoolean(BackgroundFetchConfig.FIELD_REQUIRES_BATTERY_NOT_LOW));
        }
        if (options.has(BackgroundFetchConfig.FIELD_REQUIRES_CHARGING)) {
            config.setRequiresCharging(options.getBoolean(BackgroundFetchConfig.FIELD_REQUIRES_CHARGING));
        }
        if (options.has(BackgroundFetchConfig.FIELD_REQUIRES_DEVICE_IDLE)) {
            config.setRequiresDeviceIdle(options.getBoolean(BackgroundFetchConfig.FIELD_REQUIRES_DEVICE_IDLE));
        }
        if (options.has(BackgroundFetchConfig.FIELD_REQUIRES_STORAGE_NOT_LOW)) {
            config.setRequiresStorageNotLow(options.getBoolean(BackgroundFetchConfig.FIELD_REQUIRES_STORAGE_NOT_LOW));
        }
        if (options.has(BackgroundFetchConfig.FIELD_PERIODIC)) {
            config.setPeriodic(options.getBoolean(BackgroundFetchConfig.FIELD_PERIODIC));
        }
        return config;
    }

    private String getHeadlessClassName() {
        return getContext().getPackageName() + "." + HEADLESS_CLASSNAME;
    }

    private BackgroundFetch getAdapter() {
        return BackgroundFetch.getInstance(getContext());
    }
}
