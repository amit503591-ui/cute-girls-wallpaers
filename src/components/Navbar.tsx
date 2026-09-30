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
  onStartSlideshow: () => void;
  openReadmeModal: () => void;
  onDownloadApk: () => void;
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
  onStartSlideshow,
  openReadmeModal,
  onDownloadApk,
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 ${
        isDark ? 'bg-slate-950/85 border-slate-800/80 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Bar: Brand, Status, and Controls */}
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-[1px] shadow-lg shadow-pink-500/20">
              <div
                className={`w-full h-full rounded-[15px] flex items-center justify-center ${
                  isDark ? 'bg-slate-950' : 'bg-white'
                }`}
              >
                <Smartphone className="w-5 h-5 text-pink-500" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight flex items-center gap-1.5">
                  CutePics{' '}
                  <span className="text-pink-500 font-medium text-xs px-1.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/20">
                    Android
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal hidden sm:block">
                HD Wallpapers from cutepics.24x7.hk
              </p>
            </div>
          </div>

          {/* Search bar on desktop */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-2 lg:mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search models, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl transition ${
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

          {/* Right Action Icons & Badges */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Direct APK Download Button */}
            <button
              onClick={onDownloadApk}
              title="Download Android APK directly"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>APK</span>
            </button>

            {/* Readme / Guide Button */}
            <button
              onClick={openReadmeModal}
              title="App Guide & Feature Documentation"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition active:scale-95 cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-pink-400 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-200 text-pink-600 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            {/* Ambient Slideshow button */}
            <button
              onClick={onStartSlideshow}
              title="Launch Ambient Slideshow"
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition active:scale-95 cursor-pointer ${
                isDark
                  ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Slideshow</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              className={`p-2 rounded-xl border transition active:scale-95 cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Refresh button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh wallpapers"
              className={`p-2 rounded-xl border transition active:scale-95 cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-900 border-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-pink-500' : ''}`} />
            </button>

            {/* Offline cache button */}
            <button
              onClick={openOfflineModal}
              title="Manage Offline Storage"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <HardDriveDownload className="w-3.5 h-3.5 text-cyan-500" />
              <span className="hidden sm:inline">Offline</span>
              {cachedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">
                  {cachedCount}
                </span>
              )}
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search cute wallpapers, models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl transition ${
                isDark
                  ? 'bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:border-pink-500'
                  : 'bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-pink-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          aria-label="Main Navigation"
          className={`flex items-center gap-2 overflow-x-auto py-2 no-scrollbar border-t ${
            isDark ? 'border-slate-900' : 'border-slate-100'
          }`}
        >
          <button
            onClick={() => setCurrentTab('wallpapers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              currentTab === 'wallpapers'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>All Wallpapers</span>
          </button>

          <button
            onClick={() => setCurrentTab('albums')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              currentTab === 'albums'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FolderHeart className="w-3.5 h-3.5" />
            <span>Posts & Albums</span>
          </button>

          <button
            onClick={() => setCurrentTab('offline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              currentTab === 'offline'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HardDriveDownload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Offline Saved {cachedCount > 0 && `(${cachedCount})`}</span>
          </button>

          <button
            onClick={() => setCurrentTab('favorites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              currentTab === 'favorites'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-pink-400" />
            <span>Favorites</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
