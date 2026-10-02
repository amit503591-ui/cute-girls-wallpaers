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
  ZoomOut,
  Move,
  Palette,
  Shield,
  Download,
  Eye,
  SlidersHorizontal,
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
  // studioTab: 'adjust' (active by default to ensure adjustment options appear immediately) or 'mockup'
  const [studioTab, setStudioTab] = useState<'adjust' | 'mockup'>('adjust');
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
    setStudioTab('adjust');
    setAppliedMessage(null);
  }, [wallpaper.id]);

  if (!isOpen) return null;

  // Real-time clock for simulator
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const getFilterStyle = (): string => {
    let filterString = `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`;
    if (settings.blur > 0) filterString += ` blur(${settings.blur}px)`;

    switch (settings.filter) {
      case 'amoled':
        filterString += ' contrast(135%) brightness(95%) saturate(125%)';
        break;
      case 'film':
        filterString += ' sepia(25%) contrast(110%) brightness(95%) saturate(85%)';
        break;
      case 'bloom':
        filterString += ' brightness(115%) contrast(95%) saturate(110%)';
        break;
      case 'vivid':
        filterString += ' saturate(160%) contrast(120%)';
        break;
    }
    return filterString;
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

      const fileName = `Wallpaper_${targetScreen.toUpperCase()}_${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      let sharedSuccessfully = false;
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `Android Wallpaper (${targetScreen === 'home' ? 'Home Screen' : targetScreen === 'lock' ? 'Lock Screen' : 'Home & Lock Screen'})`,
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

      if (!sharedSuccessfully) {
        // Fallback: Automatic download with instructions
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setAppliedMessage(
          `Wallpaper downloaded to device! Open Gallery > "Set as Wallpaper" for ${
            targetScreen === 'both' ? 'Home & Lock Screen' : targetScreen
          }.`
        );
      }
    } catch (err: any) {
      console.error('Error applying wallpaper:', err);
      setAppliedMessage('Failed to render wallpaper. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const primaryCol = palette?.primary || '#ec4899';
  const containerBg = palette?.containerBg || 'rgba(236, 72, 153, 0.25)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div
        className={`relative w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] border ${
          isDarkTheme ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header Bar */}
        <div
          className={`flex items-center justify-between px-3.5 sm:px-6 py-3 border-b shrink-0 ${
            isDarkTheme ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-600 text-white shadow-md">
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-1.5">
                <span>Set Wallpaper Studio</span>
              </h2>
            </div>
          </div>

          {/* Central Tabs: Adjust Options vs Phone Simulator Mockup */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs font-semibold">
            <button
              onClick={() => setStudioTab('adjust')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                studioTab === 'adjust'
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Adjust Options</span>
            </button>
            <button
              onClick={() => setStudioTab('mockup')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                studioTab === 'mockup'
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Phone Mockup</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowGuide(true)}
              title="Android setup guide"
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Applied Message Banner */}
        {appliedMessage && (
          <div className="p-3 mx-4 mt-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between gap-2.5 shrink-0 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{appliedMessage}</span>
            </div>
            <button
              onClick={() => setAppliedMessage(null)}
              className="text-xs text-emerald-400 hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto">
          {studioTab === 'adjust' ? (
            /* ================= TAB 1: ADJUSTMENT OPTIONS (APPEARS IMMEDIATELY ON CLICK) ================= */
            <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
              {/* Top Live Preview Box with Real-Time Adjustments */}
              <div
                className={`p-3 sm:p-4 rounded-3xl border flex flex-col sm:flex-row items-center justify-center gap-4 ${
                  isDarkTheme ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {/* Visual Preview Frame */}
                <div className="relative aspect-[9/16] w-36 sm:w-44 rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/20 select-none shrink-0">
                  {settings.fit === 'blur-fill' && (
                    <div
                      className="absolute inset-0 scale-125 blur-lg opacity-60 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${proxyUrl})`,
                        filter: `brightness(${settings.brightness * 0.7}%) contrast(${settings.contrast}%)`,
                      }}
                    />
                  )}
                  <img
                    ref={previewImgRef}
                    src={proxyUrl}
                    alt="Wallpaper preview"
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
                  {/* Subtle Android Frame Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50 pointer-events-none" />
                  <div className="absolute top-2 left-2 text-[9px] font-mono text-white/90">
                    {hours}:{minutes}
                  </div>
                  <div className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-emerald-400" />
                  <div className="absolute bottom-2 inset-x-0 flex justify-center">
                    <div className="w-10 h-0.5 rounded-full bg-white/70" />
                  </div>
                </div>

                {/* Quick Info & Preview Actions */}
                <div className="space-y-2.5 text-center sm:text-left flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs font-semibold">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Real-Time Adjustment Mode</span>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg">
                    Customize Wallpaper Appearance
                  </h3>
                  <p className="text-xs text-slate-400">
                    Adjust scaling, alignment, brightness, contrast, and color filters. Changes reflect live on preview above!
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      onClick={() => setStudioTab('mockup')}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View in Full Phone Simulator &rarr;</span>
                    </button>
                    <span className="text-slate-500">•</span>
                    <button
                      onClick={() =>
                        setSettings((s) => ({
                          ...s,
                          zoom: 1,
                          offsetX: 0,
                          offsetY: 0,
                          brightness: 100,
                          contrast: 100,
                          blur: 0,
                          filter: 'none',
                          fit: 'cover',
                        }))
                      }
                      className="inline-flex items-center gap-1 text-xs text-pink-400 hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset All</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 1: Display Fit Style */}
              <div
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  isDarkTheme ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <label className="text-xs font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-pink-400" />
                  <span>1. Display Fit Mode</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cover' as const, label: 'Fill Screen (Cover)' },
                    { id: 'contain' as const, label: 'Fit Entire Image' },
                    { id: 'blur-fill' as const, label: 'Frosted Ambient ✨' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSettings((s) => ({ ...s, fit: item.id }))}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                        settings.fit === item.id
                          ? 'bg-pink-500/20 border-pink-500 text-pink-400 shadow-sm'
                          : isDarkTheme
                          ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Zoom & Pan Adjustment Controls */}
              <div
                className={`p-4 rounded-2xl border space-y-4 ${
                  isDarkTheme ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
                    <span>2. Zoom & Scale ({settings.zoom.toFixed(2)}x)</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setSettings((s) => ({ ...s, zoom: Math.max(1, Number((s.zoom - 0.1).toFixed(2))) }))
                      }
                      title="Zoom Out"
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    >
                      <ZoomOut className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() =>
                        setSettings((s) => ({ ...s, zoom: Math.min(2.5, Number((s.zoom + 0.1).toFixed(2))) }))
                      }
                      title="Zoom In"
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.05"
                  value={settings.zoom}
                  onChange={(e) => setSettings((s) => ({ ...s, zoom: parseFloat(e.target.value) }))}
                  className="w-full accent-pink-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                />

                {/* Pan X and Pan Y */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Move className="w-3 h-3" />
                        <span>Vertical Pan (Y)</span>
                      </span>
                      <span>{settings.offsetY}%</span>
                    </div>
                    <input
                      type="range"
                      min="-35"
                      max="35"
                      step="1"
                      value={settings.offsetY}
                      onChange={(e) => setSettings((s) => ({ ...s, offsetY: parseInt(e.target.value) }))}
                      className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Move className="w-3 h-3 rotate-90" />
                        <span>Horizontal Pan (X)</span>
                      </span>
                      <span>{settings.offsetX}%</span>
                    </div>
                    <input
                      type="range"
                      min="-35"
                      max="35"
                      step="1"
                      value={settings.offsetX}
                      onChange={(e) => setSettings((s) => ({ ...s, offsetX: parseInt(e.target.value) }))}
                      className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Brightness, Contrast & Tone */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDarkTheme ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>3. Lighting, Brightness & Contrast</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Brightness</span>
                      <span>{settings.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="140"
                      value={settings.brightness}
                      onChange={(e) => setSettings((s) => ({ ...s, brightness: parseInt(e.target.value) }))}
                      className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
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

              {/* SECTION 4: Aesthetic Photo Filters */}
              <div
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  isDarkTheme ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <label className="text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>4. Aesthetic Photo Filters</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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
                      className={`py-2 px-1 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                        settings.filter === f.id
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 font-bold'
                          : isDarkTheme
                          ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 5: Target Device Aspect Ratio */}
              <div
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  isDarkTheme ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <label className="text-xs font-semibold flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>5. Android Screen Target Ratio</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'pixel' as DevicePreset, label: 'Pixel (20:9)' },
                    { id: 'galaxy' as DevicePreset, label: 'Galaxy (19.5:9)' },
                    { id: 'standard' as DevicePreset, label: 'Standard (16:9)' },
                    { id: 'tablet' as DevicePreset, label: 'Tablet (4:3)' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDevicePreset(d.id)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                        devicePreset === d.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                          : isDarkTheme
                          ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 6: Material You Extracted Palette */}
              {palette && (
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isDarkTheme ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-pink-400" />
                      <span>Material You Extracted Color Palette</span>
                    </span>
                    {copiedHex && (
                      <span className="text-[10px] text-emerald-400 font-bold">
                        Copied {copiedHex}!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {[
                      { name: 'Primary', col: palette.primary },
                      { name: 'Secondary', col: palette.secondary },
                      { name: 'Accent', col: palette.accent },
                    ].map((p, i) => (
                      <button
                        key={i}
                        onClick={() => handleCopyColor(p.col)}
                        className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-pink-500/50 transition cursor-pointer"
                        title={`Copy ${p.name}: ${p.col}`}
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: p.col }}
                        />
                        <span className="text-[11px] font-mono">{p.col}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ================= TAB 2: FULL ANDROID PHONE SIMULATOR MOCKUP ================= */
            <div className="p-4 sm:p-6 flex flex-col items-center justify-center space-y-4">
              {/* Simulator Mode Switcher & Safe-zone Toggle */}
              <div className="flex items-center justify-between w-full max-w-[280px]">
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

                <button
                  onClick={() => setSettings((s) => ({ ...s, safeZoneOverlay: !s.safeZoneOverlay }))}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                    settings.safeZoneOverlay
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : isDarkTheme
                      ? 'bg-slate-900 border-slate-800 text-slate-400'
                      : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                  }`}
                  title="Show Safe Zones"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Safe Zones</span>
                </button>
              </div>

              {/* Android Phone Frame Mockup */}
              <div
                className={`relative aspect-[9/19.5] rounded-[42px] p-2.5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-2xl ring-1 ring-slate-700/50 flex flex-col select-none overflow-hidden transition-all duration-300 ${
                  devicePreset === 'tablet' ? 'w-[310px] aspect-[4/3]' : 'w-[240px] sm:w-[260px]'
                }`}
              >
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
                      src={proxyUrl}
                      alt="Wallpaper preview"
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

                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
                  </div>

                  {/* Safe Zone Visual Overlays */}
                  {settings.safeZoneOverlay && (
                    <div className="absolute inset-0 z-30 pointer-events-none border-2 border-dashed border-amber-400/50 m-1 rounded-[30px] flex flex-col justify-between p-2">
                      <div className="p-1 rounded bg-amber-500/20 text-[9px] text-amber-300 font-mono text-center">
                        Top Camera Margin
                      </div>
                      <div className="p-1 rounded bg-amber-500/20 text-[9px] text-amber-300 font-mono text-center">
                        Bottom Dock Margin
                      </div>
                    </div>
                  )}

                  {/* Android Status Bar */}
                  <div className="relative z-20 flex items-center justify-between px-5 pt-3 pb-1 text-[11px] font-semibold text-white">
                    <span>{hours}:{minutes}</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-slate-800" />
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-[9px] font-mono">5G</span>
                      <span className="text-[9px]">98%</span>
                    </div>
                  </div>

                  {/* Home Screen vs Lock Screen Widgets */}
                  {screenMode === 'home' ? (
                    <div className="relative z-20 flex-1 flex flex-col justify-between px-3.5 pb-2 pt-2">
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
                        <div className="text-[11px] text-white/80 mt-1">{dateStr}</div>
                      </div>

                      {/* Dock Icons */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-around px-2 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
                          {['📞', '💬', '🌐', '📷'].map((icon, i) => (
                            <div
                              key={i}
                              className="w-9 h-9 rounded-2xl flex items-center justify-center text-sm shadow-md"
                              style={{ backgroundColor: `${primaryCol}30` }}
                            >
                              {icon}
                            </div>
                          ))}
                        </div>
                        <div className="w-20 h-1 bg-white/80 rounded-full mx-auto" />
                      </div>
                    </div>
                  ) : (
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
                      </div>
                      <div className="w-20 h-1 bg-white/80 rounded-full mx-auto mb-1" />
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setStudioTab('adjust')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold hover:bg-pink-500/20 transition cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust Image Settings (Sliders, Zoom, Filters) &rarr;</span>
              </button>
            </div>
          )}
        </div>

        {/* ================= STICKY BOTTOM ACTION BAR (ALWAYS VISIBLE & PROMINENT) ================= */}
        <div
          className={`p-3.5 sm:p-5 border-t shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDarkTheme ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-slate-400 w-full sm:w-auto">
            <span>Ready to set? Choose an option:</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <button
              onClick={() => handleApplyWallpaper('lock')}
              disabled={isExporting}
              className={`flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl border text-xs font-semibold transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                isDarkTheme
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-pink-400" />
              <span>Lock Screen</span>
            </button>

            <button
              onClick={() => handleApplyWallpaper('both')}
              disabled={isExporting}
              className={`flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl border text-xs font-semibold transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                isDarkTheme
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Both Screens</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => handleApplyWallpaper('home')}
              disabled={isExporting}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-pink-500/25 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Home className="w-4 h-4" />
              <span>{isExporting ? 'Applying Wallpaper...' : 'Set as Home Screen'}</span>
            </button>
          </div>
        </div>

        {/* Instructions Guide Modal */}
        {showGuide && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-pink-400" />
                  <h3 className="text-base font-bold text-white">How to Set Wallpaper on Android</h3>
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
                  <div className="font-semibold text-white mb-1">Method 1 (Direct Share):</div>
                  <p>When the Android Share sheet appears, tap <strong>"Set as wallpaper"</strong> or select <strong>Wallpaper & Style</strong>.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-white mb-1">Method 2 (From Gallery):</div>
                  <p>The adjusted image is saved in your <strong>Downloads/Gallery</strong> folder. Open it &gt; tap three dots (⋮) &gt; <strong>Set as wallpaper</strong>.</p>
                </div>
              </div>

              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs transition cursor-pointer"
              >
                Got It!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
