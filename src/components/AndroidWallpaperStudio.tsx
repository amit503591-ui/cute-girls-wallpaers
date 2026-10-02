import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Smartphone,
  Sliders,
  Check,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Lock,
  Home,
  Layers,
  ZoomIn,
  Move,
  Palette,
  Shield,
  Sun,
  Flame,
  Camera,
  Copy,
} from 'lucide-react';
import { WallpaperItem, WallpaperSettings, MaterialYouPalette, DevicePreset, FilterPreset } from '../types';
import { getProxyImageUrl, cacheWallpaperOffline } from '../services/cacheManager';
import { extractMaterialYouPalette } from '../services/colorExtractor';

interface AndroidWallpaperStudioProps {
  wallpaper: WallpaperItem;
  isOpen: boolean;
  onClose: () => void;
  onCachedSuccessfully?: () => void;
  isDarkTheme?: boolean;
}

export const AndroidWallpaperStudio: React.FC<AndroidWallpaperStudioProps> = ({
  wallpaper,
  isOpen,
  onClose,
  onCachedSuccessfully,
  isDarkTheme = true,
}) => {
  const [screenMode, setScreenMode] = useState<'home' | 'lock'>('home');
  const [devicePreset, setDevicePreset] = useState<DevicePreset>('pixel');
  const [palette, setPalette] = useState<MaterialYouPalette | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const [settings, setSettings] = useState<WallpaperSettings>({
    target: 'home',
    aspectRatio: '9:19.5',
    fit: 'cover',
    brightness: 100,
    contrast: 100,
    blur: 0,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    filter: 'none',
    safeZoneOverlay: false,
    showParallax: false,
    homeIconBlur: false,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  const previewImgRef = useRef<HTMLImageElement | null>(null);
  const proxyUrl = getProxyImageUrl(wallpaper.originalUrl);

  // Extract Material You palette when wallpaper opens
  useEffect(() => {
    let active = true;
    extractMaterialYouPalette(proxyUrl).then((pal) => {
      if (active) setPalette(pal);
    });
    return () => {
      active = false;
    };
  }, [proxyUrl]);

  // Reset settings when wallpaper changes
  useEffect(() => {
    setSettings({
      target: 'home',
      aspectRatio: '9:19.5',
      fit: 'cover',
      brightness: 100,
      contrast: 100,
      blur: 0,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      filter: 'none',
      safeZoneOverlay: false,
      showParallax: false,
      homeIconBlur: false,
    });
    setAppliedMessage(null);
  }, [wallpaper.id]);

  if (!isOpen) return null;

  // Real-time time display for phone simulator
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Calculate CSS Filter string based on tone and filter preset
  const getFilterStyle = () => {
    let base = `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`;
    if (settings.homeIconBlur && screenMode === 'home') {
      base += ' blur(6px)';
    } else if (settings.blur > 0) {
      base += ` blur(${settings.blur}px)`;
    }

    switch (settings.filter) {
      case 'amoled':
        return `${base} contrast(135%) brightness(95%)`;
      case 'film':
        return `${base} sepia(20%) saturate(120%) contrast(110%)`;
      case 'bloom':
        return `${base} brightness(110%) saturate(115%)`;
      case 'vivid':
        return `${base} saturate(160%) contrast(125%)`;
      default:
        return base;
    }
  };

  const handleCopyColor = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2500);
  };

  // Render wallpaper onto canvas at full mobile resolution
  const renderWallpaperToCanvas = async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let targetWidth = 1080;
        let targetHeight = 2400; // Pixel default (20:9)

        if (devicePreset === 'galaxy') {
          targetWidth = 1440;
          targetHeight = 3120; // 19.5:9
        } else if (devicePreset === 'standard') {
          targetWidth = 1080;
          targetHeight = 1920; // 16:9
        } else if (devicePreset === 'tablet') {
          targetWidth = 2000;
          targetHeight = 2000; // 1:1 / 4:3
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        // Apply filters
        ctx.filter = getFilterStyle();

        if (settings.fit === 'blur-fill') {
          ctx.save();
          ctx.filter = `blur(45px) brightness(${settings.brightness * 0.7}%)`;
          ctx.drawImage(img, -50, -50, targetWidth + 100, targetHeight + 100);
          ctx.restore();

          const scale = Math.min(targetWidth / img.width, targetHeight / img.height) * settings.zoom;
          const w = img.width * scale;
          const h = img.height * scale;
          const x = (targetWidth - w) / 2 + (settings.offsetX * targetWidth) / 100;
          const y = (targetHeight - h) / 2 + (settings.offsetY * targetHeight) / 100;
          ctx.drawImage(img, x, y, w, h);
        } else if (settings.fit === 'contain') {
          ctx.fillStyle = settings.filter === 'amoled' ? '#000000' : '#05070d';
          ctx.fillRect(0, 0, targetWidth, targetHeight);

          const scale = Math.min(targetWidth / img.width, targetHeight / img.height) * settings.zoom;
          const w = img.width * scale;
          const h = img.height * scale;
          const x = (targetWidth - w) / 2 + (settings.offsetX * targetWidth) / 100;
          const y = (targetHeight - h) / 2 + (settings.offsetY * targetHeight) / 100;
          ctx.drawImage(img, x, y, w, h);
        } else {
          // Cover
          const scale = Math.max(targetWidth / img.width, targetHeight / img.height) * settings.zoom;
          const w = img.width * scale;
          const h = img.height * scale;
          const x = (targetWidth - w) / 2 + (settings.offsetX * targetWidth) / 100;
          const y = (targetHeight - h) / 2 + (settings.offsetY * targetHeight) / 100;
          ctx.drawImage(img, x, y, w, h);
        }

        canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
      };
      img.onerror = () => resolve(null);
      img.src = proxyUrl;
    });
  };

  // Main action: Apply and Set as Home Screen / Lock Screen Wallpaper
  const handleApplyWallpaper = async (targetScreen: 'home' | 'lock' | 'both') => {
    setIsExporting(true);
    setAppliedMessage('Optimizing wallpaper for Android display...');

    try {
      await cacheWallpaperOffline(wallpaper);
      if (onCachedSuccessfully) onCachedSuccessfully();

      const blob = await renderWallpaperToCanvas();
      if (!blob) throw new Error('Canvas render failed');

      const fileName = `CutePics_Wallpaper_${targetScreen.toUpperCase()}_${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      let sharedSuccessfully = false;
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `CutePics Android Wallpaper (${targetScreen === 'home' ? 'Home Screen' : targetScreen === 'lock' ? 'Lock Screen' : 'Home & Lock Screen'})`,
            text: `Set this cute wallpaper as your Android ${targetScreen} screen background!`,
            files: [file],
          });
          sharedSuccessfully = true;
          setAppliedMessage(`Wallpaper sent to Android system! Select "Set as Wallpaper" on your device.`);
        } catch (shareErr: any) {
          if (shareErr.name !== 'AbortError') {
            console.log('Share dismissed or unsupported:', shareErr);
          }
        }
      }

      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(downloadUrl);

      if (!sharedSuccessfully) {
        setAppliedMessage(
          `Wallpaper saved to Downloads & Gallery! Tap 3 dots in Gallery > "Set as Wallpaper: ${
            targetScreen === 'home' ? 'Home screen' : targetScreen === 'lock' ? 'Lock screen' : 'Both'
          }"`
        );
      }
    } catch {
      const anchor = document.createElement('a');
      anchor.href = proxyUrl;
      anchor.download = `CutePics_Wallpaper_${wallpaper.id}.png`;
      anchor.click();
      setAppliedMessage('Downloaded! Open Gallery > Set as wallpaper.');
    } finally {
      setIsExporting(false);
      setShowGuide(true);
    }
  };

  const primaryCol = palette?.primary || '#ec4899';
  const accentCol = palette?.accent || '#6366f1';
  const containerBg = palette?.containerBg || 'rgba(236, 72, 153, 0.25)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div
        className={`relative w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] border ${
          isDarkTheme ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header Bar */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isDarkTheme ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-600 text-white shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>Android Wallpaper Studio</span>
                <span className="text-[11px] font-semibold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full">
                  Material You
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Studio Body: Left is Simulator, Right is Controls */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
          {/* LEFT: Phone Simulator Preview */}
          <div
            className={`md:col-span-6 p-4 sm:p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r ${
              isDarkTheme ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100/70 border-slate-200'
            }`}
          >
            {/* Mode Switcher & Safe-zone Toggle */}
            <div className="flex items-center justify-between w-full max-w-[280px] mb-3">
              <div
                className={`flex items-center gap-1 p-1 rounded-2xl border ${
                  isDarkTheme ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <button
                  onClick={() => setScreenMode('home')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    screenMode === 'home'
                      ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => setScreenMode('lock')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    screenMode === 'lock'
                      ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock</span>
                </button>
              </div>

              {/* Safe Zone Toggle */}
              <button
                onClick={() => setSettings((s) => ({ ...s, safeZoneOverlay: !s.safeZoneOverlay }))}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                  settings.safeZoneOverlay
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : isDarkTheme
                    ? 'bg-slate-900 border-slate-800 text-slate-400'
                    : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                }`}
                title="Show Safe Zones (Punch-hole camera, clock area, dock)"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Safe Zones</span>
              </button>
            </div>

            {/* Android Phone Frame */}
            <div
              className={`relative aspect-[9/19.5] rounded-[42px] p-2.5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-2xl shadow-black ring-1 ring-slate-700/50 flex flex-col select-none overflow-hidden transition-all duration-300 ${
                devicePreset === 'tablet' ? 'w-[310px] aspect-[4/3]' : 'w-[240px] sm:w-[260px]'
              }`}
            >
              {/* Inner Screen */}
              <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-black flex flex-col">
                {/* Wallpaper Render */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  {settings.fit === 'blur-fill' && (
                    <div
                      className="absolute inset-0 scale-125 blur-xl opacity-60 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${proxyUrl})`,
                        filter: `brightness(${settings.brightness * 0.7}%) contrast(${settings.contrast}%)`,
                      }}
                    />
                  )}

                  <img
                    ref={previewImgRef}
                    src={proxyUrl}
                    alt="Wallpaper"
                    className={`w-full h-full ${

                      settings.fit === 'cover'
                        ? 'object-cover'
                        : settings.fit === 'contain'
                        ? 'object-contain'
                        : 'object-contain relative z-10'
                    }`}
                    style={{
                      transform: `scale(${settings.zoom}) translate(${settings.offsetX}%, ${settings.offsetY}%)`,
                      filter: getFilterStyle(),
                      transformOrigin: 'center center',
                    }}
                  />

                  {/* Android dimming gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
                </div>

                {/* Safe Zone Visual Overlays (if enabled) */}
                {settings.safeZoneOverlay && (
                  <div className="absolute inset-0 z-30 pointer-events-none border-2 border-dashed border-amber-400/50 m-1 rounded-[30px] flex flex-col justify-between p-2">
                    <div className="p-1 rounded bg-amber-500/20 text-[9px] text-amber-300 font-mono text-center">
                      Top Safe Margin
                    </div>
                    <div className="p-1 rounded bg-amber-500/20 text-[9px] text-amber-300 font-mono text-center">
                      Bottom Dock Safe Margin
                    </div>
                  </div>
                )}

                {/* Android Status Bar */}
                <div className="relative z-20 flex items-center justify-between px-5 pt-3 pb-1 text-[11px] font-semibold text-white">
                  <span>{hours}:{minutes}</span>
                  {/* Punch Hole Camera */}
                  <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-slate-800" />
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-[9px] font-mono">5G</span>
                    <span className="text-[9px]">98%</span>
                  </div>
                </div>

                {/* HOME SCREEN vs LOCK SCREEN WITH MATERIAL YOU THEMING */}
                {screenMode === 'home' ? (
                  <div className="relative z-20 flex-1 flex flex-col justify-between px-3.5 pb-2 pt-2">
                    {/* Material You Weather / Clock Widget */}
                    <div
                      className="mt-2 p-3 rounded-2xl backdrop-blur-md border shadow-lg transition-colors duration-500"
                      style={{
                        backgroundColor: containerBg,
                        borderColor: `${primaryCol}40`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold font-sans tracking-tight text-white">
                          {hours}:{minutes}
                        </span>
                        <span className="text-[11px] flex items-center gap-1 text-white font-medium">
                          ☀️ 78°F
                        </span>
                      </div>
                      <p className="text-[10px] text-white/90">{dateStr}</p>
                    </div>

                    {/* App Grid Simulating Themed Icons */}
                    <div className="grid grid-cols-4 gap-3 my-auto py-2">
                      {['Camera', 'Gallery', 'Music', 'Settings'].map((app, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <div
                            className="w-9 h-9 rounded-2xl backdrop-blur-md flex items-center justify-center text-xs text-white shadow-md border transition-colors duration-500"
                            style={{
                              backgroundColor: `${primaryCol}50`,
                              borderColor: `${accentCol}60`,
                            }}
                          >
                            {idx === 0 ? '📷' : idx === 1 ? '🖼️' : idx === 2 ? '🎵' : '⚙️'}
                          </div>
                          <span className="text-[9px] font-medium text-white drop-shadow-md">
                            {app}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Google Search Bar (Themed) */}
                    <div className="space-y-3">
                      <div
                        className="flex items-center justify-between px-3 py-1.5 rounded-full backdrop-blur-md border text-white shadow-sm transition-colors duration-500"
                        style={{
                          backgroundColor: containerBg,
                          borderColor: `${accentCol}40`,
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold" style={{ color: primaryCol }}>G</span>
                          <span className="text-[10px] text-white/80">Search...</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-white/80">
                          <span>🎙️</span>
                          <span>📷</span>
                        </div>
                      </div>

                      {/* Dock Apps */}
                      <div className="flex items-center justify-around py-1 px-1 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10">
                        {['📞', '💬', '🌐', '🌸'].map((icon, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs shadow-inner"
                            style={{ backgroundColor: `${primaryCol}30` }}
                          >
                            {icon}
                          </div>
                        ))}
                      </div>

                      {/* Android Gesture Bar */}
                      <div className="w-20 h-1 bg-white/80 rounded-full mx-auto" />
                    </div>
                  </div>
                ) : (
                  /* Lock Screen Simulator */
                  <div className="relative z-20 flex-1 flex flex-col justify-between px-4 pb-2 pt-6 text-white text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-[11px] text-white/80 mb-1">
                        <Lock className="w-3 h-3" style={{ color: primaryCol }} />
                        <span>Swipe up to unlock</span>
                      </div>
                      <div
                        className="text-5xl font-extralight tracking-tighter drop-shadow-lg transition-colors duration-500"
                        style={{ color: primaryCol }}
                      >
                        {hours}:{minutes}
                      </div>
                      <div className="text-xs text-white/90 font-medium mt-1">
                        {dateStr}
                      </div>

                      {/* Notification Card */}
                      <div
                        className="mt-6 p-2.5 rounded-2xl backdrop-blur-md border text-left flex items-center gap-2.5 shadow-lg transition-colors duration-500"
                        style={{
                          backgroundColor: containerBg,
                          borderColor: `${primaryCol}40`,
                        }}
                      >
                        <div
                          className="w-7 h-7 rounded-xl flex items-center justify-center text-xs"
                          style={{ backgroundColor: `${primaryCol}80` }}
                        >
                          🌸
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold text-white">CutePics Wallpaper</div>
                          <div className="text-[9px] text-white/80 truncate">Set as Android background</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between px-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-xs">
                          🔦
                        </div>
                        <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-xs">
                          📸
                        </div>
                      </div>
                      <div className="w-20 h-1 bg-white/80 rounded-full mx-auto" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Material You Palette Swatches */}
            {palette && (
              <div className="mt-4 w-full max-w-[280px]">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="font-semibold flex items-center gap-1">
                    <Palette className="w-3 h-3 text-pink-400" />
                    <span>Material You Palette</span>
                  </span>
                  {copiedHex && (
                    <span className="text-[10px] text-emerald-400 font-bold">
                      Copied {copiedHex}!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 justify-between p-2 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                  {[
                    { name: 'Primary', col: palette.primary },
                    { name: 'Secondary', col: palette.secondary },
                    { name: 'Accent', col: palette.accent },
                  ].map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleCopyColor(p.col)}
                      className="flex-1 flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer"
                      title={`Copy ${p.name} Hex: ${p.col}`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-white/30 shadow-sm"
                        style={{ backgroundColor: p.col }}
                      />
                      <span className="text-[9px] font-mono text-white/80">{p.col}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Customization Controls */}
          <div
            className={`md:col-span-6 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-5 ${
              isDarkTheme ? 'bg-slate-900' : 'bg-white'
            }`}
          >
            <div className="space-y-4">
              {/* Applied Message Banner */}
              {appliedMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">{appliedMessage}</div>
                </div>
              )}

              {/* Device Presets */}
              <div>
                <label className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                  <span>Target Android Device Preset</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'pixel' as DevicePreset, label: 'Pixel (20:9)' },
                    { id: 'galaxy' as DevicePreset, label: 'Galaxy (19.5:9)' },
                    { id: 'standard' as DevicePreset, label: 'Standard (16:9)' },
                    { id: 'tablet' as DevicePreset, label: 'Tablet (4:3)' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDevicePreset(d.id)}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-medium border text-center transition cursor-pointer ${
                        devicePreset === d.id
                          ? 'bg-pink-500/20 border-pink-500 text-pink-400 font-bold'
                          : isDarkTheme
                          ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Filter Presets */}
              <div>
                <label className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Aesthetic Photo Filters</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'none' as FilterPreset, label: 'Normal' },
                    { id: 'amoled' as FilterPreset, label: 'AMOLED' },
                    { id: 'film' as FilterPreset, label: 'Film Grain' },
                    { id: 'bloom' as FilterPreset, label: 'Soft Glow' },
                    { id: 'vivid' as FilterPreset, label: 'Cyber Vivid' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSettings((s) => ({ ...s, filter: f.id }))}
                      className={`py-1.5 px-1 rounded-xl text-[10px] font-medium border text-center transition cursor-pointer ${
                        settings.filter === f.id
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 font-bold'
                          : isDarkTheme
                          ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Fit Style */}
              <div>
                <label className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-pink-400" />
                  <span>Display Style</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSettings((s) => ({ ...s, fit: 'cover' }))}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                      settings.fit === 'cover'
                        ? 'bg-pink-500/20 border-pink-500 text-pink-400 font-bold'
                        : isDarkTheme
                        ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Fill (Cover)
                  </button>

                  <button
                    onClick={() => setSettings((s) => ({ ...s, fit: 'blur-fill' }))}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                      settings.fit === 'blur-fill'
                        ? 'bg-pink-500/20 border-pink-500 text-pink-400 font-bold'
                        : isDarkTheme
                        ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Frosted Ambient ✨
                  </button>

                  <button
                    onClick={() => setSettings((s) => ({ ...s, fit: 'contain' }))}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                      settings.fit === 'contain'
                        ? 'bg-pink-500/20 border-pink-500 text-pink-400 font-bold'
                        : isDarkTheme
                        ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Fit (Letterbox)
                  </button>
                </div>
              </div>

              {/* Dual-Screen Blur Toggle */}
              <div
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                  isDarkTheme ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="font-semibold">Dual-Screen Icon Blur</div>
                  <div className="text-[11px] text-slate-400">
                    Apply soft blur only on Home Screen so app icons pop
                  </div>
                </div>
                <button
                  onClick={() => setSettings((s) => ({ ...s, homeIconBlur: !s.homeIconBlur }))}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.homeIconBlur ? 'bg-pink-500' : isDarkTheme ? 'bg-slate-800' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.homeIconBlur ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Zoom & Positioning */}
              <div
                className={`space-y-3 p-3.5 rounded-2xl border ${
                  isDarkTheme ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Zoom Scale ({settings.zoom.toFixed(1)}x)</span>
                  </span>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, zoom: 1, offsetX: 0, offsetY: 0 }))}
                    className="text-[11px] text-pink-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2.2"
                  step="0.05"
                  value={settings.zoom}
                  onChange={(e) => setSettings((s) => ({ ...s, zoom: parseFloat(e.target.value) }))}
                  className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Move className="w-3 h-3" />
                    <span>Vertical Pan ({settings.offsetY}%)</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={settings.offsetY}
                  onChange={(e) => setSettings((s) => ({ ...s, offsetY: parseInt(e.target.value) }))}
                  className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Tone Adjustments */}
              <div
                className={`space-y-3 p-3.5 rounded-2xl border ${
                  isDarkTheme ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Brightness & Contrast</span>
                </span>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Brightness</span>
                    <span>{settings.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="130"
                    value={settings.brightness}
                    onChange={(e) => setSettings((s) => ({ ...s, brightness: parseInt(e.target.value) }))}
                    className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Contrast</span>
                    <span>{settings.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="140"
                    value={settings.contrast}
                    onChange={(e) => setSettings((s) => ({ ...s, contrast: parseInt(e.target.value) }))}
                    className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className={`space-y-2.5 pt-3 border-t ${isDarkTheme ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={() => handleApplyWallpaper('home')}
                disabled={isExporting}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-pink-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Home className="w-4 h-4" />
                <span>{isExporting ? 'Applying...' : 'Set as Home Screen Background'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleApplyWallpaper('lock')}
                  disabled={isExporting}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                    isDarkTheme
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-pink-400" />
                  <span>Set as Lock Screen</span>
                </button>

                <button
                  onClick={() => handleApplyWallpaper('both')}
                  disabled={isExporting}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                    isDarkTheme
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Set on Both Screens</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Modal */}
        {showGuide && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-pink-400" />
                  <h3 className="text-base font-bold text-white">How to Set on Android</h3>
                </div>
                <button
                  onClick={() => setShowGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-white mb-1">Method 1 (Instant):</div>
                  <p>When the system Share sheet appears, tap <strong>"Set as wallpaper"</strong> or select <strong>Google Photos / Wallpaper</strong>.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-white mb-1">Method 2 (From Gallery):</div>
                  <p>The image is also downloaded to your <strong>Gallery / Downloads</strong> folder. Open it, tap the three dots (⋮) &gt; <strong>Set as wallpaper</strong> &gt; <strong>Home screen</strong>.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-white mb-1">Samsung One UI / Xiaomi / Pixel:</div>
                  <p>Long press any blank spot on your Android home screen &gt; <strong>Wallpaper & style</strong> &gt; <strong>Change wallpapers</strong> &gt; Select from Gallery.</p>
                </div>
              </div>

              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs transition cursor-pointer"
              >
                Got It, Thank You!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
