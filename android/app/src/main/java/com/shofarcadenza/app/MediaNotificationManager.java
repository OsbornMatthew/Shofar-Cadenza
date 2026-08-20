package com.shofarcadenza.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MediaNotificationManager {
    public static final String CHANNEL_ID = "shofar_cadenza_playback";
    public static final int NOTIFICATION_ID = 777;

    private static MediaNotificationManager instance;
    private MediaSessionCompat mediaSession;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private Bitmap lastCoverBitmap = null;
    private String lastCoverUrl = null;

    private MediaNotificationManager(Context context) {
        createChannel(context);
        try {
            mediaSession = new MediaSessionCompat(context.getApplicationContext(), "ShofarCadenzaSession");
            mediaSession.setActive(true);
        } catch (Exception ignored) {}
    }

    public static synchronized MediaNotificationManager getInstance(Context context) {
        if (instance == null) {
            instance = new MediaNotificationManager(context.getApplicationContext());
        }
        return instance;
    }

    private void createChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Music Playback",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Shofar Cadenza playback controls");
            channel.setShowBadge(false);
            channel.setSound(null, null);
            channel.enableLights(false);
            channel.enableVibration(false);

            NotificationManager manager = context.getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    public void update(Context context, String title, String artist, String album, String coverUrl, boolean isPlaying) {
        executor.execute(() -> {
            try {
                Bitmap cover = getCoverBitmap(coverUrl);
                buildAndShow(context, title, artist, album, cover, isPlaying);
            } catch (Exception e) {
                buildAndShow(context, title, artist, album, null, isPlaying);
            }
        });
    }

    private Bitmap getCoverBitmap(String coverUrl) {
        if (coverUrl == null || coverUrl.isEmpty()) return null;
        if (coverUrl.equals(lastCoverUrl) && lastCoverBitmap != null) {
            return lastCoverBitmap;
        }

        try {
            URL url = new URL(coverUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setDoInput(true);
            connection.setConnectTimeout(4000);
            connection.setReadTimeout(4000);
            connection.connect();
            InputStream input = connection.getInputStream();
            Bitmap bitmap = BitmapFactory.decodeStream(input);
            if (bitmap != null) {
                lastCoverUrl = coverUrl;
                lastCoverBitmap = Bitmap.createScaledBitmap(bitmap, 256, 256, true);
                return lastCoverBitmap;
            }
        } catch (Exception ignored) {}
        return null;
    }

    private void buildAndShow(Context context, String title, String artist, String album, Bitmap cover, boolean isPlaying) {
        try {
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }

            Intent openAppIntent = new Intent(context, MainActivity.class);
            openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent contentPendingIntent = PendingIntent.getActivity(context, 0, openAppIntent, flags);

            Intent prevIntent = new Intent("com.shofarcadenza.app.ACTION_PREV").setPackage(context.getPackageName());
            PendingIntent prevPending = PendingIntent.getBroadcast(context, 1, prevIntent, flags);

            Intent toggleIntent = new Intent("com.shofarcadenza.app.ACTION_TOGGLE").setPackage(context.getPackageName());
            PendingIntent togglePending = PendingIntent.getBroadcast(context, 2, toggleIntent, flags);

            Intent nextIntent = new Intent("com.shofarcadenza.app.ACTION_NEXT").setPackage(context.getPackageName());
            PendingIntent nextPending = PendingIntent.getBroadcast(context, 3, nextIntent, flags);

            if (mediaSession != null) {
                PlaybackStateCompat.Builder stateBuilder = new PlaybackStateCompat.Builder()
                        .setActions(PlaybackStateCompat.ACTION_PLAY | PlaybackStateCompat.ACTION_PAUSE |
                                PlaybackStateCompat.ACTION_SKIP_TO_NEXT | PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS)
                        .setState(isPlaying ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED,
                                PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN, 1.0f);
                mediaSession.setPlaybackState(stateBuilder.build());
            }

            androidx.media.app.NotificationCompat.MediaStyle mediaStyle =
                    new androidx.media.app.NotificationCompat.MediaStyle()
                            .setShowActionsInCompactView(0, 1, 2);
            if (mediaSession != null) {
                mediaStyle.setMediaSession(mediaSession.getSessionToken());
            }

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(R.drawable.ic_stat_music)
                    .setContentTitle(title != null && !title.isEmpty() ? title : "Shofar Cadenza")
                    .setContentText(artist != null && !artist.isEmpty() ? artist : "Playing")
                    .setSubText(album != null && !album.isEmpty() ? album : "Shofar Cadenza")
                    .setContentIntent(contentPendingIntent)
                    .setStyle(mediaStyle)
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                    .setPriority(NotificationCompat.PRIORITY_LOW)
                    .setOngoing(isPlaying)
                    .setAutoCancel(false)
                    .addAction(R.drawable.ic_media_prev, "Previous", prevPending)
                    .addAction(isPlaying ? R.drawable.ic_media_pause : R.drawable.ic_media_play,
                            isPlaying ? "Pause" : "Play", togglePending)
                    .addAction(R.drawable.ic_media_next, "Next", nextPending);

            if (cover != null) {
                builder.setLargeIcon(cover);
            }

            NotificationManagerCompat manager = NotificationManagerCompat.from(context);
            manager.notify(NOTIFICATION_ID, builder.build());
        } catch (SecurityException ignored) {
            // notification permission not yet granted on Android 13+
        } catch (Exception ignored) {}
    }

    public void cancel(Context context) {
        try {
            NotificationManagerCompat manager = NotificationManagerCompat.from(context);
            manager.cancel(NOTIFICATION_ID);
        } catch (Exception ignored) {}
    }
}
