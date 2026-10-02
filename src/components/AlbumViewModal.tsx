import React, { useState } from 'react';
import {
  X,
  Images,
  HardDriveDownload,
  ExternalLink,
  Check,
} from 'lucide-react';
import { PostItem, WallpaperItem } from '../types';
import { WallpaperCard } from './WallpaperCard';
import { preCacheWallpapers } from '../services/cacheManager';

interface AlbumViewModalProps {
  post: PostItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectWallpaper: (wp: WallpaperItem) => void;
  onSetAsWallpaper: (wp: WallpaperItem) => void;
  onToggleFavorite: (wp: WallpaperItem) => void;
  onToggleCacheOffline: (wp: WallpaperItem) => void;
  favoritedIds: Set<string>;
  cachedIds: Set<string>;
  isDataSaver: boolean;
  onAlbumCached: () => void;
  isDarkTheme?: boolean;
}

export const AlbumViewModal: React.FC<AlbumViewModalProps> = ({
  post,
  isOpen,
  onClose,
  onSelectWallpaper,
  onSetAsWallpaper,
  onToggleFavorite,
  onToggleCacheOffline,
  favoritedIds,
  cachedIds,
  isDataSaver,
  onAlbumCached,
  isDarkTheme = true,
}) => {
  const [isBatchCaching, setIsBatchCaching] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<string | null>(null);

  if (!isOpen || !post) return null;

  const wallpapers: WallpaperItem[] = post.images.map((url, idx) => ({
    id: `${post.id}-${idx}`,
    originalUrl: url,
    proxyUrl: `/api/image-proxy?url=${encodeURIComponent(url)}`,
    postId: post.id,
    postTitle: post.title,
    index: idx,
  }));

  const handleCacheAll = async () => {
    setIsBatchCaching(true);
    setCacheStatus(`Caching all ${wallpapers.length} wallpapers...`);
    try {
      await preCacheWallpapers(wallpapers);
      setCacheStatus(`All ${wallpapers.length} wallpapers saved offline!`);
      onAlbumCached();
    } catch {
      setCacheStatus('Error caching album.');
    } finally {
      setIsBatchCaching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div
        className={`relative w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border ${
          isDarkTheme ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDarkTheme ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-500">
              <Images className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold truncate">
                Photo Collection
              </h3>

              <p className="text-xs text-slate-400">
                {wallpapers.length} Wallpapers in this album
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCacheAll}
              disabled={isBatchCaching}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer disabled:opacity-50 ${
                isDarkTheme
                  ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-cyan-700 border-slate-200'
              }`}
            >
              <HardDriveDownload className="w-3.5 h-3.5 text-cyan-500" />
              <span className="hidden sm:inline">Cache Entire Album</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        {cacheStatus && (
          <div className="px-5 py-2 bg-cyan-950/80 text-xs text-cyan-300 border-b border-cyan-800/40 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{cacheStatus}</span>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {wallpapers.map((wp) => (
              <WallpaperCard
                key={wp.id}
                wallpaper={wp}
                isFavorited={favoritedIds.has(wp.id)}
                isOfflineCached={cachedIds.has(wp.id)}
                isDataSaver={isDataSaver}
                onSelect={onSelectWallpaper}
                onSetAsWallpaper={onSetAsWallpaper}
                onToggleFavorite={onToggleFavorite}
                onToggleCacheOffline={onToggleCacheOffline}
                isDarkTheme={isDarkTheme}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between text-xs text-slate-400 ${
            isDarkTheme ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span>Tap any wallpaper to view or customize for Android home screen</span>
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-pink-500 hover:underline"
          >
            <span>View on CutePics</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
