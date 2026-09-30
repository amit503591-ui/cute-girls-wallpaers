import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Smartphone,
  Download,
  Palette,
  HardDriveDownload,
  Shield,
  Sparkles,
  Play,
  Share2,
  Sliders,
  Moon,
  Zap,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowUp,
  Cpu,
} from 'lucide-react';

interface ReadmeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme?: boolean;
}

export const ReadmeModal: React.FC<ReadmeModalProps> = ({
  isOpen,
  onClose,
  isDarkTheme = true,
}) => {
  const [activeTab, setActiveTab] = useState<'features' | 'apk' | 'specs'>('features');
  const [downloadStarted, setDownloadStarted] = useState(false);

  if (!isOpen) return null;

  const handleDownloadApk = () => {
    setDownloadStarted(true);
    const link = document.createElement('a');
    link.href = '/api/download-apk';
    link.setAttribute('download', 'CutePics-Android-v1.0.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadStarted(false), 4000);
  };

  const featureCards = [
    {
      icon: <Sparkles className="w-5 h-5 text-pink-500" />,
      title: 'Direct Image-First Feed',
      desc: 'Zero distracting hero text. High-res wallpapers appear immediately upon landing with dynamic model filter pills (佐拉, 紙魚, etc.).',
      badge: 'Photo First',
    },
    {
      icon: <Smartphone className="w-5 h-5 text-indigo-500" />,
      title: 'Android Wallpaper Studio',
      desc: 'Simulate live Android Home and Lock screens with real-time clock widgets, search bars, themed app grids, and gesture bars.',
      badge: 'Live Simulator',
    },
    {
      icon: <Palette className="w-5 h-5 text-purple-500" />,
      title: 'Material You Theming',
      desc: 'Canvas-based color quantization extracts 5 harmonious colors (Primary, Secondary, Accent, Surface, Text) to theme your phone widgets.',
      badge: 'Dynamic Colors',
    },
    {
      icon: <Shield className="w-5 h-5 text-amber-500" />,
      title: 'Device Presets & Safe Zones',
      desc: 'Aspect ratios for Pixel (20:9), Galaxy (19.5:9), Standard (16:9), and Tablet (4:3), plus visual punch-hole camera and dock safe zone overlays.',
      badge: 'No Blocked Faces',
    },
    {
      icon: <Play className="w-5 h-5 text-rose-500" />,
      title: 'Ambient Ken Burns Slideshow',
      desc: 'Fullscreen desktop and mobile ambient photo rotation with live clock HUD, speed controls (3s, 5s, 10s), and random shuffle.',
      badge: 'Desk Clock Mode',
    },
    {
      icon: <Share2 className="w-5 h-5 text-sky-500" />,
      title: 'Native Web Share API',
      desc: '1-tap native share sheet to send wallpapers with titles or direct image files to WhatsApp, Telegram, Instagram, and Discord.',
      badge: 'Social Sharing',
    },
    {
      icon: <HardDriveDownload className="w-5 h-5 text-cyan-500" />,
      title: 'Dual-Layer Offline Storage',
      desc: 'Pre-cache entire photo albums to CacheStorage & IndexedDB. Choose storage cap limits (50MB - 500MB) with auto-LRU pruning.',
      badge: 'Zero Mobile Data',
    },
    {
      icon: <Sliders className="w-5 h-5 text-emerald-500" />,
      title: 'Photo Enhancer & Dual Blur',
      desc: 'AMOLED True Black, Retro Film Grain, Soft Glow, and Cyber Vivid filters. Softly blur Home Screen so app icons pop.',
      badge: 'Aesthetic Filters',
    },
    {
      icon: <ArrowUp className="w-5 h-5 text-pink-500" />,
      title: 'Up/Down Scrubber & Go-To-Top',
      desc: 'Vertical draggable slider with live percentage tooltip (0%–100%) to smoothly scrub through hundreds of wallpapers.',
      badge: 'Fast Navigation',
    },
    {
      icon: <Moon className="w-5 h-5 text-amber-400" />,
      title: 'Dark & Light Mode',
      desc: 'Deep AMOLED black mode for battery saving and clean light theme, fully persisted in local preferences.',
      badge: 'Theme Adaptive',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div
        className={`relative w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border ${
          isDarkTheme ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDarkTheme ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>CutePics Android App Guide & Features</span>
                <span className="text-[11px] font-semibold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full">
                  v1.0.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Complete documentation, architecture breakdown & direct Android APK installer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadApk}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-xs shadow-md active:scale-95 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download APK</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={`px-5 py-2.5 border-b flex items-center gap-2 overflow-x-auto ${
            isDarkTheme ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('features')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'features'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Features ({featureCards.length})
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Direct APK Download & Install</span>
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Architecture & Specs
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: ALL FEATURES */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              {/* Quick Hero Banner inside Readme */}
              <div
                className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isDarkTheme
                    ? 'bg-gradient-to-r from-pink-950/30 via-slate-900 to-indigo-950/30 border-slate-800'
                    : 'bg-gradient-to-r from-pink-50 via-white to-indigo-50 border-slate-200'
                }`}
              >
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-xs font-bold text-pink-500 uppercase tracking-wider">
                    Companion For CutePics
                  </div>
                  <h3 className="text-lg font-extrabold">Everything You Need for Cute Wallpapers</h3>
                  <p className="text-xs text-slate-400 max-w-lg">
                    Direct access to thousands of high-resolution portrait photos, live Android phone simulators, Material You color extraction, and offline caching.
                  </p>
                </div>
                <button
                  onClick={handleDownloadApk}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition flex items-center gap-2 cursor-pointer flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadStarted ? 'Downloading APK...' : 'Direct APK (Android)'}</span>
                </button>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {featureCards.map((feat, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      isDarkTheme
                        ? 'bg-slate-950/60 border-slate-800 hover:border-pink-500/40'
                        : 'bg-white border-slate-200 hover:border-pink-400 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="p-2 rounded-xl bg-slate-800/40">{feat.icon}</div>
                        <span className="text-[10px] font-semibold text-pink-500 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full">
                          {feat.badge}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm mb-1">{feat.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DIRECT APK DOWNLOAD & INSTALLATION */}
          {activeTab === 'apk' && (
            <div className="space-y-5">
              {/* Download Callout Card */}
              <div
                className={`p-6 rounded-3xl border text-center space-y-3 ${
                  isDarkTheme
                    ? 'bg-gradient-to-b from-emerald-950/30 to-slate-950 border-emerald-500/30'
                    : 'bg-gradient-to-b from-emerald-50 to-white border-emerald-200'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto shadow-inner">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Download CutePics for Android</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    Download the standalone Android APK installer package directly onto your phone or tablet.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleDownloadApk}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloadStarted ? 'Downloading...' : 'Download CutePics-Android-v1.0.apk'}</span>
                  </button>

                  <a
                    href="/CutePics-Android-v1.0.apk"
                    download="CutePics-Android-v1.0.apk"
                    className={`w-full sm:w-auto px-4 py-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                      isDarkTheme
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                    }`}
                  >
                    <span>Direct Mirror Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                  <span>Package: com.cutepics.wallpaper.app</span>
                  <span>•</span>
                  <span>Version: 1.0.0</span>
                  <span>•</span>
                  <span>Architecture: Universal</span>
                </div>
              </div>

              {/* Step by Step Guide */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>How to Install on Your Android Device</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    className={`p-4 rounded-2xl border ${
                      isDarkTheme ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-2xl font-black text-pink-500">1</span>
                    <h5 className="font-bold text-xs mt-1">Download the APK</h5>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tap the green Download button above. The `.apk` file will download to your Android device's Downloads folder.
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-2xl border ${
                      isDarkTheme ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-2xl font-black text-indigo-500">2</span>
                    <h5 className="font-bold text-xs mt-1">Allow Unknown Apps</h5>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tap the downloaded file. When prompted, tap <strong>Settings</strong> and switch on <strong>"Allow from this source"</strong>.
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-2xl border ${
                      isDarkTheme ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-2xl font-black text-emerald-500">3</span>
                    <h5 className="font-bold text-xs mt-1">Tap Install & Launch</h5>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tap <strong>Install</strong>. Once completed, launch CutePics to customize and set HD wallpapers with zero cellular data!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPECS & ARCHITECTURE */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDarkTheme ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>Technical Architecture</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Frontend Framework:</span>
                    <span className="font-mono font-medium">React 19 + TypeScript + Vite + Tailwind CSS</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Backend Server:</span>
                    <span className="font-mono font-medium">Express.js Fullstack Server</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Offline Cache:</span>
                    <span className="font-mono font-medium">Dual Layer: IndexedDB (metadata) + CacheStorage API (blobs)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Wallpaper Rendering:</span>
                    <span className="font-mono font-medium">HTML5 Canvas @ 1080×2400 (Portrait Full HD)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Color Extraction:</span>
                    <span className="font-mono font-medium">Client-side Canvas pixel hue binning for Material You</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Source Content:</span>
                    <span className="font-mono font-medium">cutepics.24x7.hk (WordPress REST API)</span>
                  </div>
                </div>
              </div>

              {/* Endpoints */}
              <div
                className={`p-4 rounded-2xl border space-y-2 text-xs ${
                  isDarkTheme ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-pink-400" />
                  <span>Built-in API Endpoints</span>
                </h4>
                <ul className="space-y-1.5 font-mono text-[11px] text-slate-400">
                  <li>
                    <strong className="text-emerald-400">GET</strong> <span className="text-white">/api/posts?page=1&per_page=12&search=</span> — Fetches wallpaper albums
                  </li>
                  <li>
                    <strong className="text-emerald-400">GET</strong> <span className="text-white">/api/image-proxy?url=...&quality=...</span> — Image proxy with 30-day edge caching
                  </li>
                  <li>
                    <strong className="text-emerald-400">GET</strong> <span className="text-white">/api/download-apk</span> — Direct binary download of CutePics APK
                  </li>
                  <li>
                    <strong className="text-emerald-400">GET</strong> <span className="text-white">/api/health</span> — Health check
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 sm:p-5 border-t flex items-center justify-between ${
            isDarkTheme ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-xs text-slate-400">
            CutePics Android Wallpaper Companion • Free & Open Source
          </div>
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              isDarkTheme ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
