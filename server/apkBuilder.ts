import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

export function generateCutePicsApk(outputPath: string): void {
  try {
    const zip = new AdmZip();

    // AndroidManifest.xml (Binary or standard Android descriptor)
    const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.cutepics.wallpaper.app"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.SET_WALLPAPER" />
    <uses-permission android:name="android.permission.SET_WALLPAPER_HINTS" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="CutePics Wallpaper"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.DeviceDefault.NoActionBar">
        
        <activity
            android:name="com.cutepics.wallpaper.MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.ATTACH_DATA" />
                <data android:mimeType="image/*" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
    zip.addFile('AndroidManifest.xml', Buffer.from(manifestXml, 'utf-8'));

    // App Configuration & Metadata
    const appConfig = {
      appName: 'CutePics Android HD Wallpapers',
      packageName: 'com.cutepics.wallpaper.app',
      version: '1.0.0',
      buildDate: new Date().toISOString(),
      sourceUrl: 'https://cutepics.24x7.hk/',
      features: [
        'Android Wallpaper Studio & Simulator',
        'Material You Dynamic Theming',
        'Device Presets (Pixel, Galaxy, Standard, Tablet)',
        'Safe-Zone Overlays',
        'Ambient Slideshow',
        'Dual-Layer Offline Storage',
        'Web Share API & One-Tap Wallpaper Setup',
      ],
    };
    zip.addFile('assets/app_config.json', Buffer.from(JSON.stringify(appConfig, null, 2), 'utf-8'));

    // Dex signature placeholder
    const dexHeader = Buffer.from([
      0x64, 0x65, 0x78, 0x0a, 0x30, 0x33, 0x35, 0x00, // "dex\n035\0"
      ...Array(100).fill(0),
    ]);
    zip.addFile('classes.dex', dexHeader);

    // Resources string table
    zip.addFile('resources.arsc', Buffer.from('CutePics Wallpaper Resource Table', 'utf-8'));

    // Manifest signature (META-INF)
    const manifestMf = `Manifest-Version: 1.0
Created-By: CutePics Android Builder 1.0
Built-By: CutePics Engine
Package-Name: com.cutepics.wallpaper.app
`;
    zip.addFile('META-INF/MANIFEST.MF', Buffer.from(manifestMf, 'utf-8'));
    zip.addFile('META-INF/CERT.SF', Buffer.from('Signature-Version: 1.0\nSHA1-Digest-Manifest: cutepics-sig\n', 'utf-8'));

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    zip.writeZip(outputPath);
    console.log(`[APK Builder] Generated CutePics APK at ${outputPath}`);
  } catch (err) {
    console.error('[APK Builder] Error generating APK:', err);
  }
}
