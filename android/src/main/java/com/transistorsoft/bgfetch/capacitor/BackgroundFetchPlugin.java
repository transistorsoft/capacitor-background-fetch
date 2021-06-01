package com.transistorsoft.bgfetch.capacitor;

import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.transistorsoft.tsbackgroundfetch.BackgroundFetch;
import com.transistorsoft.tsbackgroundfetch.BackgroundFetchConfig;

import org.json.JSONException;

@CapacitorPlugin(name = "BackgroundFetch")
public class BackgroundFetchPlugin extends Plugin {
    public static final String TAG = "BackgroundFetchPlugin";

    private static final String EVENT_FETCH = "fetch";
    private static final String HEADLESS_CLASSNAME = "BackgroundFetchHeadlessTask";
    private static final String FETCH_TASK_ID     = "capacitor-background-fetch";

    @Override
    public void load() {
        Log.d(TAG, "load");
        super.load();
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
        return getActivity().getClass().getPackage().getName() + "." + HEADLESS_CLASSNAME;
    }

    private BackgroundFetch getAdapter() {
        return BackgroundFetch.getInstance(getContext());
    }
}
