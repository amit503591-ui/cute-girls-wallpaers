import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Maximize,
  Minimize,
  Smartphone,
  Sparkles,
  Clock,
} from 'lucide-react';
import { WallpaperItem } from '../types';
import { getProxyImageUrl } from '../services/cacheManager';

interface SlideshowModalProps {
  wallpapers: WallpaperItem[];
  isOpen: boolean;
  onClose: () => void;
  onOpenStudio: (wp: WallpaperItem) => void;
  startIndex?: number;
}

export const SlideshowModal: React.FC<SlideshowModalProps> = ({
  wallpapers,
  isOpen,
  onClose,
  onOpenStudio,
  startIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [intervalSec, setIntervalSec] = useState(5);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showHud, setShowHud] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex, isOpen]);

  // Slideshow timer
  useEffect(() => {
    if (!isOpen || !isPlaying || wallpapers.length <= 1) return;

    setProgress(0);
    const stepMs = 50;
    const totalSteps = (intervalSec * 1000) / stepMs;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      setProgress((stepCount / totalSteps) * 100);

      if (stepCount >= totalSteps) {
        stepCount = 0;
        setProgress(0);
        if (isShuffle) {
          const nextIdx = Math.floor(Math.random() * wallpapers.length);
          setCurrentIndex(nextIdx);
        } else {
          setCurrentIndex((prev) => (prev + 1) % wallpapers.length);
        }
      }
    }, stepMs);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, intervalSec, isShuffle, wallpapers.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'h' || e.key === 'H') setShowHud((h) => !h);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, wallpapers.length]);

  if (!isOpen || wallpapers.length === 0) return null;

  const currentWp = wallpapers[currentIndex] || wallpapers[0];
  const proxyUrl = getProxyImageUrl(currentWp.originalUrl);

  const handleNext = () => {
    setProgress(0);
    if (isShuffle) {
      setCurrentIndex(Math.floor(Math.random() * wallpapers.length));
    } else {
      setCurrentIndex((prev) => (prev + 1) % wallpapers.length);
    }
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + wallpapers.length) % wallpapers.length);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Background with Ambient Glow */}
      <div
        className="absolute inset-0 scale-125 blur-3xl opacity-35 transition-all duration-1000 bg-center bg-cover"
        style={{ backgroundImage: `url(${proxyUrl})` }}
      />

      {/* Main Wallpaper with Ken Burns Pan/Zoom Animation */}
      <div
        className="relative z-10 w-full h-full flex items-center justify-center p-2 sm:p-6 cursor-pointer"
        onClick={() => setShowHud((h) => !h)}
      >
        <img
          key={currentWp.id}
          src={proxyUrl}
          alt={currentWp.postTitle}
          className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-700"
        />
      </div>

      {/* Ambient HUD: Clock & Date */}
      {showHud && (
        <div className="absolute top-6 left-6 z-20 pointer-events-none drop-shadow-lg text-white">
          <div className="text-3xl sm:text-4xl font-light tracking-tight font-sans">
            {timeStr}
          </div>
          <div className="text-xs sm:text-sm text-white/80 font-medium">
            {dateStr}
          </div>
        </div>
      )}

      {/* Top Controls Bar */}
      {showHud && (
        <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
          <button
            onClick={() => onOpenStudio(currentWp)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white text-xs font-semibold shadow-lg backdrop-blur-md active:scale-95 transition cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Set Wallpaper</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md transition cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Arrows */}
      {showHud && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/15 backdrop-blur-md transition cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/15 backdrop-blur-md transition cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Bottom Floating Control Deck */}
      {showHud && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 w-11/12 max-w-md">
          {/* Progress Bar */}
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-md">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 transition-all ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between w-full px-4 py-2 rounded-2xl bg-black/70 border border-white/15 backdrop-blur-xl text-white shadow-2xl">
            {/* Title / Counter */}
            <div className="text-left max-w-[130px] sm:max-w-[170px] truncate">
              <div className="text-xs font-semibold truncate">{currentWp.postTitle}</div>
              <div className="text-[10px] text-white/60">
                {currentIndex + 1} of {wallpapers.length}
              </div>
            </div>

            {/* Play / Pause / Shuffle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsShuffle((s) => !s)}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isShuffle
                    ? 'bg-pink-500/30 border-pink-500 text-pink-300'
                    : 'bg-white/10 border-white/10 text-white/70 hover:text-white'
                }`}
                title={isShuffle ? 'Shuffle is ON' : 'Shuffle is OFF'}
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="p-2.5 rounded-full bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md active:scale-95 transition cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
            </div>

            {/* Speed Switcher */}
            <div className="flex items-center gap-1 text-[11px] font-mono">
              {[3, 5, 10].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setIntervalSec(sec)}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                    intervalSec === sec
                      ? 'bg-white text-black font-bold'
                      : 'bg-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
