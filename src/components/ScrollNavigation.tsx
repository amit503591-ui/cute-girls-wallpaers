import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUp, ArrowDown, ChevronsUp, ChevronsDown } from 'lucide-react';

interface ScrollNavigationProps {
  isDarkTheme?: boolean;
}

export const ScrollNavigation: React.FC<ScrollNavigationProps> = ({ isDarkTheme = true }) => {
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 100
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Update scroll percentage on page scroll
  const handleScroll = useCallback(() => {
    if (typeof window === 'undefined') return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (scrollTop > 200) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }

    if (scrollHeight > 0) {
      const pct = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
      setScrollProgress(pct);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Scroll to Top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to Bottom
  const scrollToBottom = () => {
    const scrollHeight = document.documentElement.scrollHeight;
    window.scrollTo({ top: scrollHeight, behavior: 'smooth' });
  };

  // Handle direct scrubbing on the vertical track
  const handleScrub = useCallback((clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const trackHeight = rect.height;
    const offsetY = clientY - rect.top;
    const clampedY = Math.max(0, Math.min(trackHeight, offsetY));
    const pct = (clampedY / trackHeight) * 100;
    setScrollProgress(pct);

    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (scrollHeight > 0) {
      const targetScroll = (pct / 100) * scrollHeight;
      window.scrollTo({ top: targetScroll, behavior: 'auto' });
    }
  }, []);

  // Mouse / Touch Drag events
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setShowTooltip(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleScrub(e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleScrub(e.clientY);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    setShowTooltip(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <aside
      aria-label="Scroll navigation controls"
      className={`fixed right-3 sm:right-5 bottom-20 z-40 flex flex-col items-center gap-1.5 transition-all duration-300 select-none ${
        isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      {/* Scroll Percentage Tooltip */}
      {(showTooltip || isDragging) && (
        <div
          className={`absolute right-12 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold shadow-xl border pointer-events-none whitespace-nowrap transition-all ${
            isDarkTheme
              ? 'bg-slate-900 border-slate-700 text-pink-400'
              : 'bg-white border-slate-200 text-pink-600'
          }`}
          style={{ top: `${Math.min(90, Math.max(10, scrollProgress))}%` }}
        >
          {Math.round(scrollProgress)}%
        </div>
      )}

      {/* Quick Go-To-Top Button */}
      <button
        onClick={scrollToTop}
        title="Scroll to Top"
        aria-label="Scroll to top"
        className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white shadow-xl shadow-pink-500/25 border border-white/20 active:scale-90 transition cursor-pointer group"
      >
        <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
      </button>

      {/* Up & Down Scroll Slider Widget */}
      <div
        className={`p-1.5 rounded-2xl backdrop-blur-md border shadow-2xl flex flex-col items-center gap-1.5 transition-all ${
          isDarkTheme
            ? 'bg-slate-950/85 border-slate-800 text-slate-300'
            : 'bg-white/90 border-slate-200 text-slate-700'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => !isDragging && setShowTooltip(false)}
      >
        {/* Top jump icon */}
        <button
          onClick={scrollToTop}
          className="p-1 rounded-lg text-slate-400 hover:text-pink-500 hover:bg-slate-800/40 transition cursor-pointer"
          title="Jump to Top"
          aria-label="Jump to top"
        >
          <ChevronsUp className="w-3.5 h-3.5" />
        </button>

        {/* Vertical Track & Scrubber Slider */}
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`relative w-4 h-28 sm:h-36 rounded-full cursor-pointer flex justify-center py-1 transition-colors ${
            isDarkTheme ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-200 hover:bg-slate-300'
          }`}
          title="Drag slider up or down to scroll"
        >
          {/* Active Filled Rail */}
          <div
            className="absolute top-0 w-1.5 rounded-full bg-gradient-to-b from-pink-500 to-indigo-500"
            style={{ height: `${scrollProgress}%` }}
          />

          {/* Draggable Slider Thumb */}
          <div
            className={`absolute w-3.5 h-3.5 rounded-full shadow-md border transition-transform cursor-grab active:cursor-grabbing ${
              isDragging
                ? 'scale-125 bg-pink-500 border-white ring-2 ring-pink-500/50'
                : isDarkTheme
                ? 'bg-white border-pink-500 hover:scale-110'
                : 'bg-pink-600 border-white hover:scale-110'
            }`}
            style={{
              top: `calc(${scrollProgress}% - 7px)`,
            }}
          />
        </div>

        {/* Bottom jump icon */}
        <button
          onClick={scrollToBottom}
          className="p-1 rounded-lg text-slate-400 hover:text-pink-500 hover:bg-slate-800/40 transition cursor-pointer"
          title="Jump to Bottom"
          aria-label="Jump to bottom"
        >
          <ChevronsDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Go-To-Bottom Button */}
      <button
        onClick={scrollToBottom}
        title="Scroll to Bottom"
        aria-label="Scroll to bottom"
        className={`p-2 rounded-xl border backdrop-blur-md shadow-lg active:scale-90 transition cursor-pointer group ${
          isDarkTheme
            ? 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            : 'bg-white/90 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
      </button>
    </aside>
  );
};
