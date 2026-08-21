package com.shofarcadenza.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class MediaNotificationReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;
        String action = intent.getAction();
        if ("com.shofarcadenza.app.ACTION_TOGGLE".equals(action)) {
            MainActivity.dispatchMediaAction("toggle");
        } else if ("com.shofarcadenza.app.ACTION_NEXT".equals(action)) {
            MainActivity.dispatchMediaAction("next");
        } else if ("com.shofarcadenza.app.ACTION_PREV".equals(action)) {
            MainActivity.dispatchMediaAction("prev");
        } else if ("com.shofarcadenza.app.ACTION_STOP".equals(action)) {
            MediaNotificationManager.getInstance(context).cancel(context);
            MainActivity.dispatchMediaAction("stop");
        }
    }
}
