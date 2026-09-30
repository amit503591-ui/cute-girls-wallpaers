# CutePics Android HD Wallpaper Studio

> **Direct Portrait Wallpapers, Material You Theming, Live Android Simulator & Offline Caching Companion for cutepics.24x7.hk**

CutePics is a high-performance, mobile-optimized Progressive Web App and Android companion designed specifically for browsing thousands of portrait HD wallpapers and effortlessly setting them as Android Home and Lock screen backgrounds.

---

## 🚀 Key Features

### 1. Direct Image-First Interface
- **Zero Distraction**: The bulky introductory hero banner and descriptions have been removed. Wallpapers load immediately right below the sticky navigation bar.
- **Dynamic Model & Series Quick Filter**: Automatically parses post titles to provide one-tap filter pills (e.g. *All*, *佐拉*, *紙魚*, etc.) for fast photoshoot exploration.

### 2. Android Wallpaper Studio & Live Phone Simulator
- **True Mobile Screen Simulator**: Realistic Google Pixel / Samsung Galaxy phone bezel previewing how the wallpaper looks behind Android status bars, lock-screen clocks, themed Google Search bars, app icon grids, and gesture bars.
- **Home vs. Lock Screen Switcher**: Test how wallpapers appear on both Home Screen and Lock Screen with interactive notifications and clock styles.
- **Safe-Zone Overlays**: Visual guides showing punch-hole camera position, clock zone, and bottom app dock safe margins so important subjects are never blocked.
- **Target Device Presets**:
  - Google Pixel (20:9, 1080×2400)
  - Samsung Galaxy Ultra (19.5:9, 1440×3120)
  - Standard Mobile (16:9, 1080×1920)
  - Tablet / Foldable (4:3 / 1:1, 2000×2000)

### 3. Material You Dynamic Theming
- **Dynamic Palette Extraction**: Real-time canvas color quantization samples wallpaper pixels to generate a 5-color Material You palette (*Primary*, *Secondary*, *Accent*, *Surface*, *Text*).
- **Themed Android UI**: The simulator clock widget, Google search pill, app icons, and notification chips dynamically recolor to match the extracted wallpaper palette.
- **Copy Hex Codes**: Tap any color swatch to copy its exact Hex code to clipboard.

### 4. Aesthetic Photo Filters & Dual-Screen Icon Blur
- **Filter Presets**:
  - *Normal* (Original colors)
  - *AMOLED True Black* (Deep contrast and zero-backlight black levels)
  - *Retro Film Grain* (Warm film tone with subtle vintage saturation)
  - *Soft Glow Bloom* (Ethereal pastel lighting)
  - *Cyber Vivid* (Punchy high-saturation pop)
- **Dual-Screen Icon Blur**: Applies an optional subtle Gaussian blur to the Home Screen so Android launcher app icons remain readable, while preserving the Lock Screen in crystal clarity.

### 5. Ambient Fullscreen Slideshow Mode
- Fullscreen slideshow with smooth Ken Burns pan/zoom animation.
- Real-time Clock and Date HUD.
- Speed controls (3s, 5s, 10s), pause/play, random shuffle, and one-tap "Set Wallpaper" action.
- Perfect for desk clock displays or ambient digital photo frames.

### 6. Native Web Share API
- Native share sheet integration (`navigator.share`) to share wallpapers with friends on social media.
- Supports direct file sharing via `navigator.canShare({ files: [file] })` for WhatsApp, Telegram, Instagram, and Discord.
- Instant fallback with clipboard link copy and direct social links (WhatsApp, Telegram, X / Twitter, Reddit).

### 7. Dual-Layer Offline Storage & Data Optimization
- **CacheStorage + IndexedDB**: Pre-cache entire albums or individual wallpapers for zero-cellular-data browsing.
- **Storage Quota Cap**: Choose between **50MB**, **100MB**, **250MB**, or **500MB** limits with automatic LRU (least recently used) pruning.
- **Resolution Quality Switcher**: Select between *Ultra HD* (Original), *FHD 1080p*, and *Data Saver* (720p).
- **Backup & Restore Favorites**: Export your bookmarked wallpapers as a `.json` backup file or restore them anytime.

### 8. Smooth Up/Down Scroll Navigation
- **Go To Top**: Floating button appears after scrolling down, smoothly taking you back to top.
- **Interactive Vertical Scroll Slider**: Draggable scrubber with real-time percentage tooltip (0%–100%) to glide through thousands of wallpapers.

### 9. Dark & Light Modes
- Seamless theme toggle in the header with persistent state in `localStorage`.
- High-contrast AMOLED-friendly dark palette and crisp, airy light theme.

---

## 📱 Direct Android APK Download

CutePics can be downloaded and installed directly on your Android device as a standalone native APK package:

- **Direct Download Link**: [`/CutePics-Android-v1.0.apk`](/CutePics-Android-v1.0.apk)
- **API Endpoint**: [`/api/download-apk`](/api/download-apk)

### Android Installation Steps:
1. Tap **Download Android APK** in the app header or README menu.
2. In your Android notification shade or Downloads folder, tap `CutePics-Android-v1.0.apk`.
3. If prompted with *"Install unknown apps"*, tap **Settings** and toggle **"Allow from this source"**.
4. Tap **Install** and open **CutePics**!

Alternatively, you can install the app as a PWA by tapping the **"Install App"** button in Chrome or your browser menu > **"Add to Home screen"**.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **Backend** | Express (Node.js fullstack runner) |
| **Graphics** | HTML5 Canvas API (Full resolution 1080×2400 rendering, filters & color extraction) |
| **Storage** | IndexedDB + CacheStorage API (PWA Offline First) |
| **Icons** | Lucide React |

---

## 📡 API Endpoints

- `GET /api/posts?page=1&per_page=12&search=` — Fetches and parses wallpaper sets from cutepics.24x7.hk.
- `GET /api/image-proxy?url=<encoded_url>&quality=<original|fhd|saver>` — High-speed image proxy with CORS headers, upstream AVIF/WebP preservation, and 30-day cache headers.
- `GET /api/download-apk` — Direct download of the Android APK installer package.
- `GET /api/health` — Service health check.

---

## 📄 License
MIT License. Content copyright belongs to original creators on cutepics.24x7.hk.
