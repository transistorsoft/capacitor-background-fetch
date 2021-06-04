package com.transistorsoft.backgroundfetch.capacitor.demo;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.transistorsoft.tsbackgroundfetch.BackgroundFetch;
import com.transistorsoft.tsbackgroundfetch.BGTask;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class BackgroundFetchHeadlessTask{
  // An ExecutorService to execute tasks in background-thread.
  private static ExecutorService sThreadPool = Executors.newCachedThreadPool();
  // Same key as confgured with @ionic/storage:
  //  await Storage.configure({group: 'BackgroundFetchDemo'});
  private static final String STORAGE_KEY = "BackgroundFetchDemo";
  // DateFormatter for rendering timestamp.
  private static final SimpleDateFormat sDateFormat = new SimpleDateFormat("MM/dd hh:mm:s", Locale.US);

  public void onFetch(Context context,  BGTask task) {
    // Get a reference to the BackgroundFetch Android API.
    final BackgroundFetch backgroundFetch = BackgroundFetch.getInstance(context);
    // Get the taskId.
    String taskId = task.getTaskId();
    // Log a message to adb logcat.
    Log.d("TSBackgroundFetch", "\uD83D\uDC80 BackgroundFetchHeadlessTask onFetch" + taskId);

    boolean isTimeout = task.getTimedOut();
    // Is this a timeout?
    if (isTimeout) {
      BackgroundFetch.getInstance(context).finish(taskId);
      return;
    }

    // Persist this fetch event into SharedPreferences in a background-thread.
    sThreadPool.execute(new PersistEventTask(context, taskId, () -> {
      // Signal finish just like the Javascript API.
      backgroundFetch.finish(taskId);
    }));
  }

  interface Callback {
    void onComplete();
  }

  // Persist a fetch event into SharedPreferences for @ionic/storage to have access to this data.
  static class PersistEventTask implements Runnable {
    private final Callback mCallback;
    private final String mTaskId;
    private final Context mContext;

    PersistEventTask(Context context, String taskId, Callback callback) {
      mContext = context;
      mTaskId = taskId;
      mCallback = callback;
    }

    @Override
    public void run() {
      SharedPreferences prefs = mContext.getSharedPreferences(STORAGE_KEY, Context.MODE_PRIVATE);
      String json = prefs.getString("events", "[]");
      try {
        JSONObject event = new JSONObject();
        event.put("taskId", mTaskId);
        event.put("timestamp", sDateFormat.format(new Date()));
        event.put("headless", true);

        JSONArray events = new JSONArray(json);
        events.put(event);

        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("events", events.toString());
        editor.apply();
        mCallback.onComplete();
      } catch (JSONException e) {
        Log.d("TSBackgroundFetch", "BackgroundFetchHeadlessTask failed to parse JSON events from SharedPreferences");
        e.printStackTrace();
        mCallback.onComplete();
      }
    }
  }
}
