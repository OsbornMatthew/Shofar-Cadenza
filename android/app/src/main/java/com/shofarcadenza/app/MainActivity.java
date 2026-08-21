package com.shofarcadenza.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static MainActivity activeInstance;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        activeInstance = this;

        // Set root background to Obsidian Dark #060608
        if (getWindow() != null) {
            getWindow().getDecorView().setBackgroundColor(Color.parseColor("#060608"));
        }

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

        // Global Back Gesture & Hardware Back Button Interception
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                try {
                    WebView webView = getBridge().getWebView();
                    if (webView != null) {
                        webView.evaluateJavascript(
                                "typeof window.cadenzaHandleBack === 'function' ? window.cadenzaHandleBack() : false;",
                                value -> {
                                    if ("false".equals(value) || "null".equals(value) || value == null) {
                                        // Minimize app to background without killing music
                                        moveTaskToBack(true);
                                    }
                                }
                        );
                    } else {
                        moveTaskToBack(true);
                    }
                } catch (Exception e) {
                    moveTaskToBack(true);
                }
            }
        });

        try {
            WebView webView = this.getBridge().getWebView();
            if (webView != null) {
                webView.setBackgroundColor(Color.parseColor("#060608"));
                webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
                webView.setVerticalScrollBarEnabled(false);
                webView.setHorizontalScrollBarEnabled(false);

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

    @Override
    public void onDestroy() {
        try {
            MediaNotificationManager.getInstance(this).cancel(this);
        } catch (Exception ignored) {}
        super.onDestroy();
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
        public void updateNotification(String title, String artist, String album, String coverUrl, boolean isPlaying, double currentTimeSec, double durationSec) {
            MediaNotificationManager.getInstance(MainActivity.this)
                    .update(MainActivity.this, title, artist, album, coverUrl, isPlaying, currentTimeSec, durationSec);
        }

        @JavascriptInterface
        public void clearNotification() {
            MediaNotificationManager.getInstance(MainActivity.this)
                    .cancel(MainActivity.this);
        }
    }
}
