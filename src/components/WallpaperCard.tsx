import React, { useState } from 'react';
import {
  Heart,
  Smartphone,
  HardDriveDownload,
  CheckCircle2,
} from 'lucide-react';
import { WallpaperItem } from '../types';
import { getProxyImageUrl } from '../services/cacheManager';

interface WallpaperCardProps {
  wallpaper: WallpaperItem;
  isFavorited: boolean;
  isOfflineCached: boolean;
  isDataSaver: boolean;
  onSelect: (wallpaper: WallpaperItem) => void;
  onSetAsWallpaper: (wallpaper: WallpaperItem) => void;
  onToggleFavorite: (wallpaper: WallpaperItem) => void;
  onToggleCacheOffline: (wallpaper: WallpaperItem) => void;
  isDarkTheme?: boolean;
}

export const WallpaperCard: React.FC<WallpaperCardProps> = ({
  wallpaper,
  isFavorited,
  isOfflineCached,
  isDataSaver,
  onSelect,
  onSetAsWallpaper,
  onToggleFavorite,
  onToggleCacheOffline,
  isDarkTheme = true,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const proxyUrl = getProxyImageUrl(wallpaper.originalUrl);

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden border shadow-md hover:shadow-xl transition-all duration-300 flex flex-col ${
        isDarkTheme
          ? 'bg-slate-900/90 border-slate-800/80 hover:border-pink-500/40 text-slate-200'
          : 'bg-white border-slate-200 hover:border-pink-400 text-slate-800'
      }`}
    >
      {/* Aspect Ratio Container */}
      <div
        className={`relative w-full aspect-[9/14] sm:aspect-[9/15] overflow-hidden cursor-pointer ${
          isDarkTheme ? 'bg-slate-950' : 'bg-slate-100'
        }`}
        onClick={() => onSelect(wallpaper)}
      >
        {/* Skeleton */}
        {!imageLoaded && !imageError && (
          <div
            className={`absolute inset-0 animate-pulse flex items-center justify-center ${
              isDarkTheme
                ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950'
                : 'bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200'
            }`}
          >
            <span className="text-slate-400 text-xs font-mono">Loading...</span>
          </div>
        )}

        {/* Fallback on error */}
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-900 text-slate-400">
            <span className="text-xs">Failed to load preview</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setImageError(false);
              }}
              className="mt-2 text-[11px] text-pink-400 underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <img
            src={proxyUrl}
            alt={wallpaper.postTitle}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1">
            {isOfflineCached && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-semibold backdrop-blur-md">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                <span>Cached</span>
              </span>
            )}
            {isDataSaver && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/30 text-amber-300 text-[9px] font-mono backdrop-blur-md">
                Saver
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(wallpaper);
            }}
            aria-label="Add to favorites"
            className="pointer-events-auto p-2 rounded-full bg-black/60 border border-white/20 text-white hover:text-pink-400 backdrop-blur-md transition active:scale-90 cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorited ? 'fill-pink-500 text-pink-500' : 'text-white/80'
              }`}
            />
          </button>
        </div>

        {/* Hover / Overlay Action Bar */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between gap-2 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetAsWallpaper(wallpaper);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white text-xs font-semibold shadow-md active:scale-95 transition cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Set Wallpaper</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCacheOffline(wallpaper);
            }}
            title={isOfflineCached ? 'Remove from offline cache' : 'Save offline'}
            className={`p-2 rounded-xl border backdrop-blur-md transition active:scale-95 cursor-pointer ${
              isOfflineCached
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-black/60 border-white/20 text-white hover:text-pink-300'
            }`}
          >
            <HardDriveDownload className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Info Footer */}
      <div
        className={`p-2.5 flex items-center justify-between gap-2 border-t ${
          isDarkTheme ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-50 border-slate-100'
        }`}
      >
        <p className="text-xs font-medium line-clamp-1 truncate" title={wallpaper.postTitle}>
          {wallpaper.postTitle}
        </p>
        <span className="text-[10px] text-slate-400 whitespace-nowrap">
          #{wallpaper.index + 1}
        </span>
      </div>
    </div>
  );
};
