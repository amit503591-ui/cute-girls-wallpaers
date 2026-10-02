import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  HardDriveDownload,
  Download,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Play,
  Images,
  Copy,
  Check,
  Send,
  ExternalLink,
} from 'lucide-react';
import { WallpaperItem } from '../types';
import { getProxyImageUrl, cacheWallpaperOffline, removeCachedWallpaper } from '../services/cacheManager';

interface WallpaperDetailModalProps {
  wallpaper: WallpaperItem | null;
  allWallpapers?: WallpaperItem[];
  isOpen: boolean;
  onClose: () => void;
  onOpenStudio: (wallpaper: WallpaperItem) => void;
  onOpenSlideshow?: (startIndex: number) => void;
  onSelectWallpaper?: (wallpaper: WallpaperItem) => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  isFavorited: boolean;
  isOfflineCached: boolean;
  onToggleFavorite: (wallpaper: WallpaperItem) => void;
  onCacheStatusChange: () => void;
  isDarkTheme?: boolean;
}

export const WallpaperDetailModal: React.FC<WallpaperDetailModalProps> = ({
  wallpaper,
  allWallpapers = [],
  isOpen,
  onClose,
  onOpenStudio,
  onOpenSlideshow,
  onSelectWallpaper,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  isFavorited,
  isOfflineCached,
  onToggleFavorite,
  onCacheStatusChange,
  isDarkTheme = true,
}) => {
  const [isCaching, setIsCaching] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showSocialMenu, setShowSocialMenu] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext && hasNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNext, onPrev, hasNext, hasPrev, onClose]);

  if (!isOpen || !wallpaper) return null;

  const proxyUrl = getProxyImageUrl(wallpaper.originalUrl);
  const shareUrl = wallpaper.originalUrl || window.location.href;

  // Find other wallpapers from the same album
  const relatedWallpapers = allWallpapers.filter(
    (w) => w.postId === wallpaper.postId && w.id !== wallpaper.id
  );

  const handleToggleOffline = async () => {
    setIsCaching(true);
    try {
      if (isOfflineCached) {
        await removeCachedWallpaper(wallpaper.id, wallpaper.originalUrl);
      } else {
        await cacheWallpaperOffline(wallpaper);
      }
      onCacheStatusChange();
    } finally {
      setIsCaching(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CutePics_${wallpaper.postId}_${wallpaper.index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch {
      const a = document.createElement('a');
      a.href = proxyUrl;
      a.download = `CutePics_${wallpaper.postId}_${wallpaper.index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Web Share API Implementation with fallback
  const handleShare = async () => {
    setIsSharing(true);

    const shareData = {
      title: 'HD Portrait Wallpaper',
      text: 'Check out this cute portrait wallpaper!',
      url: shareUrl,
    };


    // 1. Try Web Share API with image file attachment if supported
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        // Attempt file sharing first if supported
        try {
          const res = await fetch(proxyUrl);
          if (res.ok) {
            const blob = await res.blob();
            const file = new File([blob], `CutePics_${wallpaper.id}.png`, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                ...shareData,
                files: [file],
              });
              setShareToast('Wallpaper shared successfully!');
              setTimeout(() => setShareToast(null), 3000);
              setIsSharing(false);
              return;
            }
          }
        } catch {
          // File creation failed or blocked by CORS, proceed to URL share
        }

        // Standard Web Share API with text & URL
        await navigator.share(shareData);
        setShareToast('Wallpaper shared successfully!');
        setTimeout(() => setShareToast(null), 3000);
        setIsSharing(false);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // User dismissed the share sheet
          setIsSharing(false);
          return;
        }
        console.warn('Web Share failed, using clipboard fallback:', err);
      }
    }

    // 2. Fallback: Copy link to clipboard & display toast
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareToast('Wallpaper URL copied to clipboard! Share it with your friends.');
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setShareToast('Wallpaper URL copied to clipboard!');
      }
      setShowSocialMenu(true);
      setTimeout(() => setShareToast(null), 4000);
    } catch {
      setShareToast('Failed to copy. URL: ' + shareUrl);
      setTimeout(() => setShareToast(null), 4000);
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareToast('Wallpaper URL copied!');
      setTimeout(() => setShareToast(null), 3000);
    } catch {}
  };

  // Direct Social Share URLs
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent('Check out this cute portrait wallpaper');

  const socialLinks = [
    {
      name: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      color: 'bg-emerald-600 hover:bg-emerald-700',
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      color: 'bg-sky-500 hover:bg-sky-600',
    },
    {
      name: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      color: 'bg-slate-800 hover:bg-black',
    },
    {
      name: 'Reddit',
      href: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
      color: 'bg-orange-600 hover:bg-orange-700',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div
        className={`relative w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] border ${
          isDarkTheme ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Top Bar */}
        <div
          className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b ${
            isDarkTheme ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm sm:text-base">
              Wallpaper #{wallpaper.index + 1}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSlideshow && (
              <button
                onClick={() => {
                  const idx = allWallpapers.findIndex((w) => w.id === wallpaper.id);
                  onClose();
                  onOpenSlideshow(idx >= 0 ? idx : 0);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  isDarkTheme ? 'bg-slate-800 hover:bg-slate-700 text-pink-400 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-pink-600 border-slate-200'
                }`}
                title="Launch Ambient Slideshow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Slideshow</span>
              </button>
            )}

            <button
              onClick={() => onToggleFavorite(wallpaper)}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isDarkTheme ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}
              title="Add to favorites"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorited ? 'fill-pink-500 text-pink-500' : 'hover:text-pink-400'
                }`}
              />
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isDarkTheme ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main View: Image with Carousel arrows */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center min-h-[300px] sm:min-h-[440px] overflow-hidden select-none">
          {hasPrev && onPrev && (
            <button
              onClick={onPrev}
              className="absolute left-3 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/85 text-white/80 hover:text-white border border-white/10 backdrop-blur-md transition shadow-lg cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div className="relative max-h-[55vh] sm:max-h-[64vh] w-full flex items-center justify-center p-2">
            <img
              src={proxyUrl}
              alt="Wallpaper"
              className="max-h-[53vh] sm:max-h-[62vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>


          {hasNext && onNext && (
            <button
              onClick={onNext}
              className="absolute right-3 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/85 text-white/80 hover:text-white border border-white/10 backdrop-blur-md transition shadow-lg cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {isOfflineCached && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Offline Ready</span>
            </div>
          )}

          {/* Share Toast Notification */}
          {shareToast && (
            <div className="absolute bottom-4 z-30 px-4 py-2 rounded-2xl bg-slate-900/95 border border-pink-500/50 text-white text-xs font-medium shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{shareToast}</span>
            </div>
          )}
        </div>

        {/* More from this album carousel strip */}
        {relatedWallpapers.length > 0 && (
          <div
            className={`px-4 py-2 border-t flex items-center gap-2 overflow-x-auto no-scrollbar ${
              isDarkTheme ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1">
              <Images className="w-3.5 h-3.5 text-pink-400" />
              <span>More in album:</span>
            </span>
            <div className="flex items-center gap-2">
              {relatedWallpapers.slice(0, 10).map((rel) => (
                <button
                  key={rel.id}
                  onClick={() => onSelectWallpaper && onSelectWallpaper(rel)}
                  className="w-12 h-14 rounded-lg overflow-hidden border border-slate-700/80 hover:border-pink-500 flex-shrink-0 transition transform hover:scale-105 cursor-pointer"
                >
                  <img
                    src={getProxyImageUrl(rel.originalUrl)}
                    alt="Wallpaper"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                </button>
              ))}
            </div>
          </div>
        )}

        {/* Social Share Menu (when opened) */}
        {showSocialMenu && (
          <div
            className={`px-4 sm:px-6 py-2.5 border-t flex items-center justify-between gap-2 overflow-x-auto ${
              isDarkTheme ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold whitespace-nowrap">
              <Send className="w-3.5 h-3.5 text-pink-500" />
              <span>Share to:</span>
            </div>
            <div className="flex items-center gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-3 py-1 rounded-xl text-white text-xs font-medium ${s.color} transition flex items-center gap-1`}
                >
                  <span>{s.name}</span>
                  <ExternalLink className="w-3 h-3 opacity-75" />
                </a>
              ))}
              <button
                onClick={copyToClipboard}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium border flex items-center gap-1 transition cursor-pointer ${
                  isDarkTheme ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700'
                }`}
                title="Copy link"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Link</span>
              </button>
            </div>
            <button
              onClick={() => setShowSocialMenu(false)}
              className="text-xs text-slate-400 hover:text-white p-1"
            >
              ×
            </button>
          </div>
        )}

        {/* Modal Action Footer */}
        <div
          className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDarkTheme ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="text-xs text-slate-400 w-full sm:w-auto">
            Portrait HD wallpaper optimized for Android screen setup
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {/* Cache Offline Button */}
            <button
              onClick={handleToggleOffline}
              disabled={isCaching}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition active:scale-95 cursor-pointer ${
                isOfflineCached
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : isDarkTheme
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <HardDriveDownload className="w-4 h-4" />
              <span>{isOfflineCached ? 'Cached Offline' : 'Cache Offline'}</span>
            </button>

            {/* Download HD Button */}
            <button
              onClick={handleDownload}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition active:scale-95 cursor-pointer ${
                isDarkTheme
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{downloadSuccess ? 'Downloaded!' : 'Download HD'}</span>
            </button>

            {/* WEB SHARE API BUTTON */}
            <button
              onClick={handleShare}
              disabled={isSharing}
              aria-label="Share wallpaper"
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition active:scale-95 cursor-pointer ${
                isDarkTheme
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-950 border-slate-200'
              }`}
              title="Share wallpaper via Web Share API or social media"
            >
              <Share2 className="w-4 h-4 text-pink-500" />
              <span>{isSharing ? 'Sharing...' : 'Share'}</span>
            </button>

            {/* Set as Wallpaper Studio Button */}
            <button
              onClick={() => {
                onClose();
                onOpenStudio(wallpaper);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-pink-500/25 active:scale-95 transition cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Set as Android Background</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
