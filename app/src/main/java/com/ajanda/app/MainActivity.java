package com.ajanda.app;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.Settings;
import android.util.Base64;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends Activity {
    static final String HOST = "app.ajanda.local";
    static final String BASE = "https://" + HOST + "/";
    WebView web;
    ValueCallback<Uri[]> fileCallback;
    boolean useUpdatedWeb = false;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        Window w = getWindow();
        w.setStatusBarColor(Color.parseColor("#140A0E"));
        w.setNavigationBarColor(Color.parseColor("#140A0E"));
        Scheduler.ensureChannels(this);
        chooseWebRoot();

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#140A0E"));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setTextZoom(100);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        web.addJavascriptInterface(new Bridge(), "Native");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (!HOST.equals(u.getHost())) return null;
                return serve(u.getPath());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (HOST.equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("image/*");
                if (p.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                try {
                    startActivityForResult(Intent.createChooser(i, "Fotoğraf seç"), 42);
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });
        setContentView(web);
        web.loadUrl(BASE + "index.html");
    }

    /* ---------- web dosyalarını sunma ---------- */

    void chooseWebRoot() {
        File upd = new File(getFilesDir(), "web/index.html");
        useUpdatedWeb = false;
        if (upd.exists()) {
            int updV = versionOf(readFileStr(new File(getFilesDir(), "web/version.json")));
            int assetV = versionOf(readAssetStr("web/version.json"));
            useUpdatedWeb = updV >= assetV;
        }
    }

    int versionOf(String json) {
        try { return new JSONObject(json).optInt("version", 0); } catch (Exception e) { return 0; }
    }

    String readAssetStr(String path) {
        try (InputStream in = getAssets().open(path)) { return new String(readAll(in), StandardCharsets.UTF_8); }
        catch (Exception e) { return "{}"; }
    }

    static String readFileStr(File f) {
        try (InputStream in = new FileInputStream(f)) { return new String(readAll(in), StandardCharsets.UTF_8); }
        catch (Exception e) { return null; }
    }

    static byte[] readAll(InputStream in) throws java.io.IOException {
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        byte[] buf = new byte[16384];
        int n;
        while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
        return bo.toByteArray();
    }

    static String mimeOf(String path) {
        String p = path.toLowerCase();
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".js")) return "application/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".json")) return "application/json";
        if (p.endsWith(".svg")) return "image/svg+xml";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".webp")) return "image/webp";
        if (p.endsWith(".woff2")) return "font/woff2";
        if (p.endsWith(".gif")) return "image/gif";
        return "image/jpeg";
    }

    WebResourceResponse serve(String path) {
        if (path == null || path.equals("/") || path.isEmpty()) path = "/index.html";
        if (path.contains("..")) return notFound();
        try {
            InputStream in;
            if (path.startsWith("/u/")) {
                File f = new File(dataDir(this), path.substring(1));
                if (!f.exists()) return notFound();
                in = new FileInputStream(f);
            } else if (useUpdatedWeb) {
                File f = new File(getFilesDir(), "web" + path);
                if (f.exists()) in = new FileInputStream(f);
                else in = getAssets().open("web" + path);
            } else {
                in = getAssets().open("web" + path);
            }
            WebResourceResponse r = new WebResourceResponse(mimeOf(path), "UTF-8", in);
            Map<String, String> h = new HashMap<>();
            h.put("Cache-Control", "no-cache");
            h.put("Access-Control-Allow-Origin", "*");
            r.setResponseHeaders(h);
            return r;
        } catch (Exception e) {
            return notFound();
        }
    }

    WebResourceResponse notFound() {
        WebResourceResponse r = new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream(new byte[0]));
        r.setStatusCodeAndReasonPhrase(404, "Not Found");
        return r;
    }

    static File dataDir(Context c) {
        File d = new File(c.getFilesDir(), "data");
        if (!d.exists()) d.mkdirs();
        return d;
    }

    static File safeFile(File root, String rel) {
        if (rel == null || rel.contains("..")) return null;
        while (rel.startsWith("/")) rel = rel.substring(1);
        return new File(root, rel);
    }

    static boolean atomicWrite(File f, byte[] data) {
        try {
            File parent = f.getParentFile();
            if (parent != null && !parent.exists()) parent.mkdirs();
            File tmp = new File(f.getAbsolutePath() + ".tmp");
            try (FileOutputStream out = new FileOutputStream(tmp)) {
                out.write(data);
                out.getFD().sync();
            }
            return tmp.renameTo(f);
        } catch (Exception e) {
            return false;
        }
    }

    static void deleteRecursive(File f) {
        if (f == null || !f.exists()) return;
        if (f.isDirectory()) {
            File[] list = f.listFiles();
            if (list != null) for (File c : list) deleteRecursive(c);
        }
        f.delete();
    }

    void js(final String code) {
        runOnUiThread(() -> { if (web != null) web.evaluateJavascript(code, null); });
    }

    /* ---------- yaşam döngüsü ---------- */

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("window.__back?String(window.__back()):'false'", v -> {
            if (v == null || !v.contains("true")) moveTaskToBack(true);
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.evaluateJavascript("window.__resume&&window.__resume()", null);
    }

    @Override
    protected void onPause() {
        if (web != null) web.evaluateJavascript("window.__pause&&window.__pause()", null);
        super.onPause();
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (req != 42 || fileCallback == null) return;
        Uri[] result = null;
        if (res == RESULT_OK && data != null) {
            if (data.getClipData() != null) {
                int n = data.getClipData().getItemCount();
                result = new Uri[n];
                for (int i = 0; i < n; i++) result[i] = data.getClipData().getItemAt(i).getUri();
            } else if (data.getData() != null) {
                result = new Uri[]{data.getData()};
            }
        }
        fileCallback.onReceiveValue(result);
        fileCallback = null;
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] results) {
        super.onRequestPermissionsResult(code, perms, results);
        boolean ok = results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED;
        js("window.__onPermission&&window.__onPermission(" + ok + ")");
    }

    /* ---------- JS köprüsü ---------- */

    class Bridge {
        @JavascriptInterface
        public String readText(String rel) {
            File f = safeFile(dataDir(MainActivity.this), rel);
            return f == null ? null : readFileStr(f);
        }

        @JavascriptInterface
        public boolean writeText(String rel, String text) {
            File f = safeFile(dataDir(MainActivity.this), rel);
            return f != null && atomicWrite(f, text.getBytes(StandardCharsets.UTF_8));
        }

        @JavascriptInterface
        public boolean writeBase64(String rel, String b64) {
            File f = safeFile(dataDir(MainActivity.this), rel);
            if (f == null) return false;
            try { return atomicWrite(f, Base64.decode(b64, Base64.DEFAULT)); } catch (Exception e) { return false; }
        }

        @JavascriptInterface
        public String readBase64(String rel) {
            File f = safeFile(dataDir(MainActivity.this), rel);
            if (f == null || !f.exists()) return null;
            try (InputStream in = new FileInputStream(f)) {
                return Base64.encodeToString(readAll(in), Base64.NO_WRAP);
            } catch (Exception e) { return null; }
        }

        @JavascriptInterface
        public boolean exists(String rel) {
            File f = safeFile(dataDir(MainActivity.this), rel);
            return f != null && f.exists();
        }

        @JavascriptInterface
        public boolean deleteFile(String rel) {
            File f = safeFile(dataDir(MainActivity.this), rel);
            if (f == null) return false;
            deleteRecursive(f);
            return true;
        }

        @JavascriptInterface
        public String listFiles(String relDir) {
            File d = safeFile(dataDir(MainActivity.this), relDir == null ? "" : relDir);
            JSONArray a = new JSONArray();
            if (d != null && d.isDirectory()) {
                File[] list = d.listFiles();
                if (list != null) for (File f : list) a.put(f.getName());
            }
            return a.toString();
        }

        /* web güncellemesi */
        @JavascriptInterface
        public boolean webBegin() {
            File n = new File(getFilesDir(), "web_new");
            deleteRecursive(n);
            return n.mkdirs();
        }

        @JavascriptInterface
        public boolean webWrite(String rel, String b64) {
            File f = safeFile(new File(getFilesDir(), "web_new"), rel);
            if (f == null) return false;
            try { return atomicWrite(f, Base64.decode(b64, Base64.DEFAULT)); } catch (Exception e) { return false; }
        }

        @JavascriptInterface
        public boolean webCommit() {
            File n = new File(getFilesDir(), "web_new");
            if (!new File(n, "index.html").exists()) return false;
            File cur = new File(getFilesDir(), "web");
            File old = new File(getFilesDir(), "web_old");
            deleteRecursive(old);
            if (cur.exists() && !cur.renameTo(old)) return false;
            if (!n.renameTo(cur)) { old.renameTo(cur); return false; }
            deleteRecursive(old);
            runOnUiThread(() -> { chooseWebRoot(); web.loadUrl(BASE + "index.html"); });
            return true;
        }

        @JavascriptInterface
        public void webReset() {
            deleteRecursive(new File(getFilesDir(), "web"));
            runOnUiThread(() -> { chooseWebRoot(); web.loadUrl(BASE + "index.html"); });
        }

        @JavascriptInterface
        public void reload() {
            runOnUiThread(() -> web.reload());
        }

        @JavascriptInterface
        public String appInfo() {
            JSONObject o = new JSONObject();
            try {
                PackageInfo pi = getPackageManager().getPackageInfo(getPackageName(), 0);
                o.put("versionName", pi.versionName);
                o.put("versionCode", Build.VERSION.SDK_INT >= 28 ? pi.getLongVersionCode() : pi.versionCode);
                o.put("sdk", Build.VERSION.SDK_INT);
                o.put("updatedWeb", useUpdatedWeb);
                o.put("assetWebVersion", versionOf(readAssetStr("web/version.json")));
                o.put("model", Build.MANUFACTURER + " " + Build.MODEL);
            } catch (Exception ignored) { }
            return o.toString();
        }

        /* bildirimler */
        @JavascriptInterface
        public void schedule(String json) {
            Scheduler.save(MainActivity.this, json);
            Scheduler.apply(MainActivity.this);
        }

        @JavascriptInterface
        public void refreshOngoing() {
            Scheduler.refreshOngoing(MainActivity.this);
        }

        @JavascriptInterface
        public boolean notificationsAllowed() {
            if (Build.VERSION.SDK_INT < 33) return true;
            return checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        }

        @JavascriptInterface
        public void requestNotificationPermission() {
            if (Build.VERSION.SDK_INT >= 33) {
                runOnUiThread(() -> requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 7));
            } else {
                js("window.__onPermission&&window.__onPermission(true)");
            }
        }

        @JavascriptInterface
        public void testNotification(String title, String body) {
            Scheduler.notifyNow(MainActivity.this, 424242, title, body);
        }

        @JavascriptInterface
        public boolean batteryOptimized() {
            PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
            return pm != null && !pm.isIgnoringBatteryOptimizations(getPackageName());
        }

        @JavascriptInterface
        public void openBatterySettings() {
            runOnUiThread(() -> {
                try {
                    Intent i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    i.setData(Uri.parse("package:" + getPackageName()));
                    startActivity(i);
                } catch (Exception e) {
                    openAppSettings();
                }
            });
        }

        @JavascriptInterface
        public void openAppSettings() {
            runOnUiThread(() -> {
                try {
                    Intent i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                    i.setData(Uri.parse("package:" + getPackageName()));
                    startActivity(i);
                } catch (Exception ignored) { }
            });
        }

        /* parmak izi */
        @JavascriptInterface
        public boolean biometricAvailable() {
            if (Build.VERSION.SDK_INT >= 29) {
                android.hardware.biometrics.BiometricManager bm = getSystemService(android.hardware.biometrics.BiometricManager.class);
                return bm != null && bm.canAuthenticate() == android.hardware.biometrics.BiometricManager.BIOMETRIC_SUCCESS;
            }
            return Build.VERSION.SDK_INT >= 28 && getPackageManager().hasSystemFeature(PackageManager.FEATURE_FINGERPRINT);
        }

        @JavascriptInterface
        public void biometric(final String title) {
            if (Build.VERSION.SDK_INT < 28) { js("window.__onBio&&window.__onBio(false)"); return; }
            runOnUiThread(() -> {
                try {
                    android.hardware.biometrics.BiometricPrompt p = new android.hardware.biometrics.BiometricPrompt.Builder(MainActivity.this)
                            .setTitle(title)
                            .setNegativeButton("Şifre ile gir", getMainExecutor(), (d, w) -> js("window.__onBio&&window.__onBio(false)"))
                            .build();
                    p.authenticate(new CancellationSignal(), getMainExecutor(), new android.hardware.biometrics.BiometricPrompt.AuthenticationCallback() {
                        @Override
                        public void onAuthenticationSucceeded(android.hardware.biometrics.BiometricPrompt.AuthenticationResult r) {
                            js("window.__onBio&&window.__onBio(true)");
                        }

                        @Override
                        public void onAuthenticationError(int code, CharSequence msg) {
                            js("window.__onBio&&window.__onBio(false)");
                        }
                    });
                } catch (Exception e) {
                    js("window.__onBio&&window.__onBio(false)");
                }
            });
        }

        /* görünüm */
        @JavascriptInterface
        public void setBars(final String hex, final boolean lightIcons) {
            runOnUiThread(() -> {
                try {
                    int c = Color.parseColor(hex);
                    getWindow().setStatusBarColor(c);
                    getWindow().setNavigationBarColor(c);
                    web.setBackgroundColor(c);
                    int f = 0;
                    if (lightIcons) f = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                    getWindow().getDecorView().setSystemUiVisibility(f);
                } catch (Exception ignored) { }
            });
        }

        @JavascriptInterface
        public void toast(final String msg) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show());
        }

        @JavascriptInterface
        public void vibrate(int ms) {
            try {
                Vibrator v = (Vibrator) getSystemService(VIBRATOR_SERVICE);
                if (v != null) v.vibrate(VibrationEffect.createOneShot(Math.max(5, ms), VibrationEffect.DEFAULT_AMPLITUDE));
            } catch (Exception ignored) { }
        }

        @JavascriptInterface
        public void openUrl(final String url) {
            runOnUiThread(() -> {
                try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception ignored) { }
            });
        }
    }
}
