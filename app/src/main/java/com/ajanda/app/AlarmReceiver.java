package com.ajanda.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class AlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        String a = i.getAction();
        if ("REM".equals(a)) {
            String title = i.getStringExtra("title");
            String body = i.getStringExtra("body");
            Scheduler.notifyNow(c, i.getIntExtra("id", 0), title == null ? "Hatırlatma" : title, body == null ? "" : body, i.getStringExtra("tid"), i.getStringExtra("k"));
            Scheduler.refreshOngoing(c);
        } else if ("MID".equals(a)) {
            Scheduler.apply(c);
        } else {
            Scheduler.refreshOngoing(c);
        }
    }
}
