import React from 'react';
import {
  Image as ImageIcon,
  FolderHeart,
  HardDriveDownload,
  Bookmark,
  Search,
  Zap,
  Smartphone,
  RefreshCw,
  Sun,
  Moon,
  Play,
  BookOpen,
  Download,
  QrCode,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentTab: 'wallpapers' | 'albums' | 'offline' | 'favorites';
  setCurrentTab: (tab: 'wallpapers' | 'albums' | 'offline' | 'favorites') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDataSaver: boolean;
  setIsDataSaver: (val: boolean | ((prev: boolean) => boolean)) => void;
  cachedCount: number;
  openOfflineModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onStartSlideshow?: () => void;
  onDownloadApk: () => void;
  onOpenApkQr: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  searchQuery,
  setSearchQuery,
  isDataSaver,
  setIsDataSaver,
  cachedCount,
  openOfflineModal,
  onRefresh,
  isLoading,
  theme,
  toggleTheme,
  onDownloadApk,
  onOpenApkQr,
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 ${
        isDark ? 'bg-slate-950/85 border-slate-800/80 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        {/* Top Bar: Brand, Status, and Controls */}
        <div className="flex items-center justify-between h-13 sm:h-15 gap-1.5 sm:gap-2">
          {/* Logo & Clean Title with Responsive Font */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <div className="relative flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-[1px] shadow-sm shadow-pink-500/20 shrink-0">
              <div
                className={`w-full h-full rounded-[10px] sm:rounded-[14px] flex items-center justify-center ${
                  isDark ? 'bg-slate-950' : 'bg-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-pink-500" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <span className="font-bold text-xs sm:text-sm md:text-base tracking-tight">
              Wallpapers
            </span>
          </div>

          {/* Search bar on desktop */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-2">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search models, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-4 py-1 text-xs rounded-xl transition ${
                  isDark
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:border-pink-500'
                    : 'bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-pink-500'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons & Badges - Fits perfectly on single screen */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Unified APK Download + QR Scan Pill */}
            <div className="flex items-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 p-0.5 text-white shadow-sm shrink-0">
              <button
                onClick={onDownloadApk}
                title="Download Android APK directly"
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs font-bold hover:bg-white/10 rounded-l-[10px] active:scale-95 transition cursor-pointer"
              >
                <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>APK</span>
              </button>
              <div className="w-[1px] h-3 bg-white/30" />
              <button
                onClick={onOpenApkQr}
                title="Scan QR Code to download APK on Android"
                className="flex items-center gap-1 px-1 sm:px-1.5 py-1 hover:bg-white/10 rounded-r-[10px] active:scale-95 transition cursor-pointer"
              >
                <QrCode className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xl:inline text-[9px] pr-0.5">QR</span>
              </button>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              className={`p-1 sm:p-1.5 rounded-xl border transition active:scale-95 cursor-pointer shrink-0 ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Refresh button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh wallpapers"
              className={`p-1 sm:p-1.5 rounded-xl border transition active:scale-95 cursor-pointer shrink-0 ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-900 border-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin text-pink-500' : ''}`} />
            </button>

            {/* Offline cache button */}
            <button
              onClick={openOfflineModal}
              title="Manage Offline Storage"
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-xl border text-[10px] sm:text-xs font-medium transition cursor-pointer shrink-0 ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <HardDriveDownload className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-500" />
              <span className="hidden sm:inline">Offline</span>
              {cachedCount > 0 && (
                <span className="px-1 py-0.1 rounded-full bg-cyan-500/20 text-cyan-400 text-[9px] font-bold">
                  {cachedCount}
                </span>
              )}
            </button>

            {/* PWA Install Button (desktop / larger screens) */}
            <div className="hidden sm:flex shrink-0">
              <PWAInstallButton />
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-2 pt-1">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search wallpapers, models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-7 py-1 text-[11px] sm:text-xs rounded-xl transition ${
                isDark
                  ? 'bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:border-pink-500'
                  : 'bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-pink-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs - Adjusted Font Sizes to Fit On Screen */}
        <nav
          aria-label="Main Navigation"
          className={`flex items-center justify-between sm:justify-start gap-1 sm:gap-2 py-1.5 border-t overflow-x-auto no-scrollbar ${
            isDark ? 'border-slate-900' : 'border-slate-100'
          }`}
        >
          <button
            onClick={() => setCurrentTab('wallpapers')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
              currentTab === 'wallpapers'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span><span className="hidden sm:inline">All </span>Wallpapers</span>
          </button>

          <button
            onClick={() => setCurrentTab('albums')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
              currentTab === 'albums'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FolderHeart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span><span className="hidden sm:inline">Posts & </span>Albums</span>
          </button>

          <button
            onClick={() => setCurrentTab('offline')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
              currentTab === 'offline'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HardDriveDownload className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
            <span>Offline {cachedCount > 0 && `(${cachedCount})`}</span>
          </button>

          <button
            onClick={() => setCurrentTab('favorites')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
              currentTab === 'favorites'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-400" />
            <span>Favorites</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

