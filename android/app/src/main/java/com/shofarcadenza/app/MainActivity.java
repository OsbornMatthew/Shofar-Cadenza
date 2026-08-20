package com.shofarcadenza.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static MainActivity activeInstance;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        activeInstance = this;

        // Auto-request notification permission for Android 13+ (API 33+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                        this,
                        new String[]{Manifest.permission.POST_NOTIFICATIONS},
                        101
                );
            }
        }

        try {
            WebView webView = this.getBridge().getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                settings.setMediaPlaybackRequiresUserGesture(false);
                webView.addJavascriptInterface(new MediaNotificationBridge(), "AndroidMediaNotification");
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onResume() {
        super.onResume();
        activeInstance = this;
    }

    public static void dispatchMediaAction(final String action) {
        if (activeInstance != null) {
            activeInstance.runOnUiThread(() -> {
                try {
                    WebView webView = activeInstance.getBridge().getWebView();
                    if (webView != null) {
                        webView.evaluateJavascript(
                                "if (window.cadenzaMediaAction) { window.cadenzaMediaAction('" + action + "'); }",
                                null
                        );
                    }
                } catch (Exception ignored) {}
            });
        }
    }

    public class MediaNotificationBridge {
        @JavascriptInterface
        public void updateNotification(String title, String artist, String album, String coverUrl, boolean isPlaying) {
            MediaNotificationManager.getInstance(MainActivity.this)
                    .update(MainActivity.this, title, artist, album, coverUrl, isPlaying);
        }

        @JavascriptInterface
        public void clearNotification() {
            MediaNotificationManager.getInstance(MainActivity.this)
                    .cancel(MainActivity.this);
        }
    }
}
