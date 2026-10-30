package com.ajanda.app;

import android.Manifest;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;

/**
 * Hatırlatıcıları ve kalıcı bildirimi yönetir.
 * JS tarafı gelecek ~60 günün hatırlatıcılarını ve günlük özetleri tek JSON olarak verir:
 * {"items":[{"id":1,"at":1730000000000,"title":"..","body":".."}],
 *  "ongoing":{"enabled":true,"days":{"2026-10-30":{"title":"..","lines":[{"t":"19:30","x":".."}],"empty":".."}}}}
 */
public class Scheduler {
    static final String CH_REM = "hatirlatici";
    static final String CH_ONGOING = "kalici";
    static final int ONGOING_ID = 1;
    static final int RC_MIDNIGHT = 900000;
    static final int RC_REFRESH_BASE = 800000;

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences("sched", Context.MODE_PRIVATE);
    }

    static void save(Context c, String json) {
        prefs(c).edit().putString("json", json).apply();
    }

    static JSONObject load(Context c) {
        try { return new JSONObject(prefs(c).getString("json", "{}")); } catch (Exception e) { return new JSONObject(); }
    }

    static void ensureChannels(Context c) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null) return;
        NotificationChannel rem = new NotificationChannel(CH_REM, "Hatırlatıcılar", NotificationManager.IMPORTANCE_HIGH);
        rem.setDescription("Görev ve etkinlik hatırlatıcıları");
        rem.enableVibration(true);
        nm.createNotificationChannel(rem);
        NotificationChannel on = new NotificationChannel(CH_ONGOING, "Günün özeti (kalıcı)", NotificationManager.IMPORTANCE_LOW);
        on.setDescription("Bildirim ekranında duran günlük özet");
        on.setShowBadge(false);
        on.setSound(null, null);
        on.enableVibration(false);
        nm.createNotificationChannel(on);
    }

    static boolean canNotify(Context c) {
        if (Build.VERSION.SDK_INT < 33) return true;
        return c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }

    static PendingIntent openApp(Context c, int rc) {
        Intent i = new Intent(c, MainActivity.class);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(c, rc, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    static PendingIntent alarmIntent(Context c, int rc, String action, String title, String body) {
        Intent i = new Intent(c, AlarmReceiver.class);
        i.setAction(action);
        i.putExtra("id", rc);
        if (title != null) i.putExtra("title", title);
        if (body != null) i.putExtra("body", body);
        return PendingIntent.getBroadcast(c, rc, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    static void setAlarm(AlarmManager am, long at, PendingIntent pi) {
        try {
            if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            } else {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            }
        } catch (SecurityException e) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        }
    }

    static synchronized void apply(Context c) {
        ensureChannels(c);
        AlarmManager am = c.getSystemService(AlarmManager.class);
        if (am == null) return;
        SharedPreferences p = prefs(c);

        // eskileri iptal et
        try {
            JSONArray old = new JSONArray(p.getString("ids", "[]"));
            for (int k = 0; k < old.length(); k++) {
                JSONObject o = old.getJSONObject(k);
                am.cancel(alarmIntent(c, o.getInt("rc"), o.getString("a"), null, null));
            }
        } catch (Exception ignored) { }

        JSONArray ids = new JSONArray();
        long now = System.currentTimeMillis();
        JSONObject data = load(c);
        try {
            JSONArray items = data.optJSONArray("items");
            int count = 0;
            if (items != null) {
                for (int k = 0; k < items.length() && count < 380; k++) {
                    JSONObject it = items.getJSONObject(k);
                    long at = it.optLong("at", 0);
                    if (at <= now) continue;
                    int rc = it.optInt("id", k + 1) % 700000;
                    setAlarm(am, at, alarmIntent(c, rc, "REM", it.optString("title"), it.optString("body")));
                    ids.put(new JSONObject().put("rc", rc).put("a", "REM"));
                    count++;
                }
            }
            // bugünün saatli işleri için kalıcı bildirim yenileme alarmları
            JSONObject today = todayEntry(data);
            if (today != null) {
                JSONArray lines = today.optJSONArray("lines");
                if (lines != null) {
                    for (int k = 0; k < lines.length() && k < 40; k++) {
                        long at = timeToday(lines.getJSONObject(k).optString("t")) + 1000;
                        if (at <= now) continue;
                        int rc = RC_REFRESH_BASE + k;
                        setAlarm(am, at, alarmIntent(c, rc, "REF", null, null));
                        ids.put(new JSONObject().put("rc", rc).put("a", "REF"));
                    }
                }
            }
            // gece yarısı yenileme
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.DAY_OF_YEAR, 1);
            cal.set(Calendar.HOUR_OF_DAY, 0);
            cal.set(Calendar.MINUTE, 0);
            cal.set(Calendar.SECOND, 30);
            setAlarm(am, cal.getTimeInMillis(), alarmIntent(c, RC_MIDNIGHT, "MID", null, null));
            ids.put(new JSONObject().put("rc", RC_MIDNIGHT).put("a", "MID"));
        } catch (Exception ignored) { }
        p.edit().putString("ids", ids.toString()).apply();
        refreshOngoing(c);
    }

    static String todayKey() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    static JSONObject todayEntry(JSONObject data) {
        JSONObject on = data.optJSONObject("ongoing");
        if (on == null) return null;
        JSONObject days = on.optJSONObject("days");
        if (days == null) return null;
        return days.optJSONObject(todayKey());
    }

    static long timeToday(String hhmm) {
        try {
            String[] parts = hhmm.split(":");
            Calendar cal = Calendar.getInstance();
            cal.set(Calendar.HOUR_OF_DAY, Integer.parseInt(parts[0]));
            cal.set(Calendar.MINUTE, Integer.parseInt(parts[1]));
            cal.set(Calendar.SECOND, 0);
            cal.set(Calendar.MILLISECOND, 0);
            return cal.getTimeInMillis();
        } catch (Exception e) {
            return 0;
        }
    }

    static void refreshOngoing(Context c) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null) return;
        JSONObject data = load(c);
        JSONObject on = data.optJSONObject("ongoing");
        if (on == null || !on.optBoolean("enabled", false) || !canNotify(c)) {
            nm.cancel(ONGOING_ID);
            return;
        }
        JSONObject today = todayEntry(data);
        String title = "Bugün";
        String text = "Güzel bir gün olsun.";
        List<String> rest = new ArrayList<>();
        if (today != null) {
            title = today.optString("title", title);
            text = today.optString("empty", text);
            JSONArray lines = today.optJSONArray("lines");
            long now = System.currentTimeMillis();
            boolean found = false;
            if (lines != null) {
                for (int k = 0; k < lines.length(); k++) {
                    JSONObject l = lines.optJSONObject(k);
                    if (l == null) continue;
                    long at = timeToday(l.optString("t"));
                    if (at + 60000 < now) continue;
                    String line = l.optString("t") + " · " + l.optString("x");
                    if (!found) { text = "Sıradaki: " + line; found = true; }
                    else rest.add(line);
                }
            }
        }
        Notification.Builder b = new Notification.Builder(c, CH_ONGOING)
                .setSmallIcon(R.drawable.ic_notif)
                .setContentTitle(title)
                .setContentText(text)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setShowWhen(false)
                .setColor(0xFF7A2843)
                .setContentIntent(openApp(c, 1));
        if (!rest.isEmpty()) {
            Notification.InboxStyle st = new Notification.InboxStyle();
            st.addLine(text);
            for (int k = 0; k < rest.size() && k < 5; k++) st.addLine(rest.get(k));
            b.setStyle(st);
        }
        nm.notify(ONGOING_ID, b.build());
    }

    static void notifyNow(Context c, int id, String title, String body) {
        if (!canNotify(c)) return;
        ensureChannels(c);
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null) return;
        Notification.Builder b = new Notification.Builder(c, CH_REM)
                .setSmallIcon(R.drawable.ic_notif)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new Notification.BigTextStyle().bigText(body))
                .setAutoCancel(true)
                .setColor(0xFF7A2843)
                .setCategory(Notification.CATEGORY_REMINDER)
                .setContentIntent(openApp(c, 100000 + (id % 100000)));
        nm.notify(10 + id, b.build());
    }
}
