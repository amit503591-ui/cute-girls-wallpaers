import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AlertCircle,
  FolderHeart,
  Image as ImageIcon,
  Zap,
  Bookmark,
  ChevronDown,
  HardDriveDownload,
  Filter,
  Play,
} from 'lucide-react';
import { WallpaperItem, PostItem, ResolutionQuality } from './types';
import { Navbar } from './components/Navbar';
import { WallpaperCard } from './components/WallpaperCard';
import { WallpaperDetailModal } from './components/WallpaperDetailModal';
import { AndroidWallpaperStudio } from './components/AndroidWallpaperStudio';
import { OfflineManagerModal } from './components/OfflineManagerModal';
import { AlbumCard } from './components/AlbumCard';
import { AlbumViewModal } from './components/AlbumViewModal';
import { SlideshowModal } from './components/SlideshowModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ScrollNavigation } from './components/ScrollNavigation';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import {
  getOfflineWallpapers,
  getCacheStats,
  cacheWallpaperOffline,
  removeCachedWallpaper,
} from './services/cacheManager';
import {
  getFavoriteWallpapers,
  toggleFavoriteWallpaper,
} from './services/favoritesManager';

export default function App() {
  const isOnline = useOnlineStatus();

  // Dark / Light Theme
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('cutepics_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('cutepics_theme', next);
      } catch {}
      return next;
    });
  };

  const isDark = theme === 'dark';

  // Navigation & Data State
  const [currentTab, setCurrentTab] = useState<'wallpapers' | 'albums' | 'offline' | 'favorites'>('wallpapers');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeModelFilter, setActiveModelFilter] = useState('All');

  // Resolution Quality Setting
  const [resolution, setResolution] = useState<ResolutionQuality>(() => {
    try {
      return (localStorage.getItem('cutepics_resolution') as ResolutionQuality) || 'original';
    } catch {
      return 'original';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cutepics_resolution', resolution);
    } catch {}
  }, [resolution]);

  // Data Saver preference in localStorage
  const [isDataSaver, setIsDataSaver] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cutepics_data_saver') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cutepics_data_saver', String(isDataSaver));
    } catch {}
  }, [isDataSaver]);

  // Offline Cache & Favorites state
  const [cachedWallpapers, setCachedWallpapers] = useState<WallpaperItem[]>([]);
  const [cachedCount, setCachedCount] = useState(0);
  const [cachedSizeStr, setCachedSizeStr] = useState('0 MB');
  const [favoriteWallpapers, setFavoriteWallpapers] = useState<WallpaperItem[]>([]);

  // Modals state
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperItem | null>(null);
  const [studioWallpaper, setStudioWallpaper] = useState<WallpaperItem | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<PostItem | null>(null);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [slideshowStartIndex, setSlideshowStartIndex] = useState(0);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load offline cache & favorites on mount
  const refreshCacheAndFavorites = useCallback(async () => {
    try {
      const offline = await getOfflineWallpapers();
      setCachedWallpapers(offline);
      const stats = await getCacheStats();
      setCachedCount(stats.count);
      setCachedSizeStr(stats.formattedSize);

      const favs = getFavoriteWallpapers();
      setFavoriteWallpapers(favs);
    } catch (e) {
      console.error('Error refreshing cache stats:', e);
    }
  }, []);

  useEffect(() => {
    refreshCacheAndFavorites();
  }, [refreshCacheAndFavorites]);

  const cachedIds = useMemo(() => new Set(cachedWallpapers.map((w) => w.id)), [cachedWallpapers]);
  const favoritedIds = useMemo(() => new Set(favoriteWallpapers.map((w) => w.id)), [favoriteWallpapers]);

  // Extract distinct model/series names from post titles for quick-filter tabs
  const modelFilters = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      const colonIdx = p.title.indexOf('：');
      if (colonIdx > 0) {
        set.add(p.title.slice(0, colonIdx).trim());
      } else {
        const parts = p.title.split(/\s+/);
        if (parts[0] && parts[0].length <= 8) set.add(parts[0]);
      }
    });
    return ['All', ...Array.from(set).slice(0, 8)];
  }, [posts]);

  // Filter wallpapers by active model tag if selected
  const displayedWallpapers = useMemo(() => {
    if (activeModelFilter === 'All') return wallpapers;
    return wallpapers.filter((w) => w.postTitle.includes(activeModelFilter));
  }, [wallpapers, activeModelFilter]);

  // Fetch posts and wallpapers from API
  const fetchPosts = useCallback(async (targetPage = 1, append = false, query = '') => {
    if (targetPage === 1 && !append) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        per_page: '12',
      });
      if (query.trim()) {
        params.set('search', query.trim());
      }

      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const newPosts: PostItem[] = data.posts || [];
      const newWallpapers: WallpaperItem[] = data.wallpapers || [];

      if (append) {
        setPosts((prev) => [...prev, ...newPosts]);
        setWallpapers((prev) => [...prev, ...newWallpapers]);
      } else {
        setPosts(newPosts);
        setWallpapers(newWallpapers);
      }

      setPage(data.page || targetPage);
      setTotalPages(data.totalPages || 1);
      setTotalPosts(data.totalPosts || 0);
    } catch (err: any) {
      console.error('Fetch error:', err);
      if (!isOnline) {
        setError('Offline Mode: Browsing your cached offline wallpapers.');
        if (cachedWallpapers.length > 0 && currentTab === 'wallpapers') {
          setCurrentTab('offline');
        }
      } else {
        setError(err.message || 'Failed to load cute wallpapers.');
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [isOnline, cachedWallpapers.length, currentTab]);

  useEffect(() => {
    fetchPosts(1, false, debouncedSearch);
  }, [debouncedSearch, fetchPosts]);

  const handleLoadMore = () => {
    if (!isLoadingMore && page < totalPages) {
      fetchPosts(page + 1, true, debouncedSearch);
    }
  };

  const handleToggleFavorite = (wp: WallpaperItem) => {
    toggleFavoriteWallpaper(wp);
    refreshCacheAndFavorites();
  };

  const handleToggleCacheOffline = async (wp: WallpaperItem) => {
    if (cachedIds.has(wp.id)) {
      await removeCachedWallpaper(wp.id, wp.originalUrl);
    } else {
      await cacheWallpaperOffline(wp);
    }
    await refreshCacheAndFavorites();
  };

  const currentWallpaperIndex = useMemo(() => {
    if (!selectedWallpaper) return -1;
    return displayedWallpapers.findIndex((w) => w.id === selectedWallpaper.id);
  }, [selectedWallpaper, displayedWallpapers]);

  const handleNextWallpaper = () => {
    if (currentWallpaperIndex >= 0 && currentWallpaperIndex < displayedWallpapers.length - 1) {
      setSelectedWallpaper(displayedWallpapers[currentWallpaperIndex + 1]);
    }
  };

  const handlePrevWallpaper = () => {
    if (currentWallpaperIndex > 0) {
      setSelectedWallpaper(displayedWallpapers[currentWallpaperIndex - 1]);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col antialiased selection:bg-pink-500/30 transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDataSaver={isDataSaver}
        setIsDataSaver={setIsDataSaver}
        cachedCount={cachedCount}
        openOfflineModal={() => setIsOfflineModalOpen(true)}
        onRefresh={() => fetchPosts(1, false, debouncedSearch)}
        isLoading={isLoading}
        theme={theme}
        toggleTheme={toggleTheme}
        onStartSlideshow={() => {
          setSlideshowStartIndex(0);
          setIsSlideshowOpen(true);
        }}
      />

      {/* COMPACT FILTER BAR - DIRECTLY SHOWS IMAGES RIGHT BELOW NAVBAR */}
      {currentTab === 'wallpapers' && modelFilters.length > 1 && (
        <div
          className={`border-b px-4 sm:px-6 py-2.5 transition-colors ${
            isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3 text-pink-500" />
                <span>Model:</span>
              </span>
              {modelFilters.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveModelFilter(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    activeModelFilter === tag
                      ? 'bg-pink-500 text-white shadow-sm'
                      : isDark
                      ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Quick Count & Slideshow Button */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap">
              <span>{displayedWallpapers.length} Wallpapers</span>
              <button
                onClick={() => {
                  setSlideshowStartIndex(0);
                  setIsSlideshowOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 font-semibold cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Play Slideshow</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area - Wallpapers immediately visible */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Error notification if any */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs sm:text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchPosts(1, false, debouncedSearch)}
              className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-semibold text-xs whitespace-nowrap cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* TAB 1: ALL WALLPAPERS */}
        {currentTab === 'wallpapers' && (
          <div>
            {isLoading && wallpapers.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`aspect-[9/15] rounded-2xl animate-pulse ${
                      isDark ? 'bg-slate-900 border border-slate-800' : 'bg-slate-200 border border-slate-300'
                    }`}
                  />
                ))}
              </div>
            ) : displayedWallpapers.length === 0 ? (
              <div
                className={`text-center py-16 rounded-3xl border p-8 space-y-3 ${
                  isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <ImageIcon className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold">No wallpapers found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search query or reset the model filter.
                </p>
                <button
                  onClick={() => {
                    setActiveModelFilter('All');
                    setSearchQuery('');
                    fetchPosts(1, false, '');
                  }}
                  className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
                  {displayedWallpapers.map((wp) => (
                    <WallpaperCard
                      key={wp.id}
                      wallpaper={wp}
                      isFavorited={favoritedIds.has(wp.id)}
                      isOfflineCached={cachedIds.has(wp.id)}
                      isDataSaver={isDataSaver}
                      onSelect={(item) => setSelectedWallpaper(item)}
                      onSetAsWallpaper={(item) => setStudioWallpaper(item)}
                      onToggleFavorite={handleToggleFavorite}
                      onToggleCacheOffline={handleToggleCacheOffline}
                      isDarkTheme={isDark}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {page < totalPages && (
                  <div className="mt-8 flex flex-col items-center justify-center gap-2">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className={`px-6 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 ${
                        isDark
                          ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-pink-500/40 text-white'
                          : 'bg-white hover:bg-slate-100 border-slate-200 hover:border-pink-400 text-slate-800'
                      }`}
                    >
                      {isLoadingMore ? (
                        <>
                          <span className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                          <span>Loading more...</span>
                        </>
                      ) : (
                        <>
                          <span>Load More Wallpapers</span>
                          <ChevronDown className="w-4 h-4 text-pink-500" />
                        </>
                      )}
                    </button>
                    <span className="text-[11px] text-slate-400">
                      Page {page} of {totalPages}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 2: POSTS & ALBUMS */}
        {currentTab === 'albums' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <FolderHeart className="w-5 h-5 text-indigo-500" />
                  <span>Albums & Photo Series</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Full photoshoot sets from cutepics.24x7.hk
                </p>
              </div>
            </div>

            {isLoading && posts.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`aspect-[4/3] rounded-2xl animate-pulse ${
                      isDark ? 'bg-slate-900 border border-slate-800' : 'bg-slate-200 border border-slate-300'
                    }`}
                  />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div
                className={`text-center py-16 rounded-3xl border p-8 space-y-3 ${
                  isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <FolderHeart className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold">No albums found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try refreshing or adjusting your search term.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {posts.map((post) => (
                  <AlbumCard
                    key={post.id}
                    post={post}
                    onOpenAlbum={(p) => setSelectedAlbum(p)}
                    onCacheWholeAlbum={async (p) => {
                      const albumWallpapers = p.images.map((url, idx) => ({
                        id: `${p.id}-${idx}`,
                        originalUrl: url,
                        proxyUrl: `/api/image-proxy?url=${encodeURIComponent(url)}`,
                        postId: p.id,
                        postTitle: p.title,
                        index: idx,
                      }));
                      for (const wp of albumWallpapers) {
                        await cacheWallpaperOffline(wp);
                      }
                      await refreshCacheAndFavorites();
                    }}
                    isAlbumCached={
                      post.images.length > 0 &&
                      post.images.every((_, idx) => cachedIds.has(`${post.id}-${idx}`))
                    }
                    isDarkTheme={isDark}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OFFLINE SAVED */}
        {currentTab === 'offline' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <HardDriveDownload className="w-5 h-5 text-cyan-500" />
                  <span>Offline Saved Wallpapers</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-500 font-mono font-bold">
                    {cachedWallpapers.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Instant loading with zero cellular data consumption
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOfflineModalOpen(true)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  Manage Storage ({cachedSizeStr})
                </button>
              </div>
            </div>

            {cachedWallpapers.length === 0 ? (
              <div
                className={`text-center py-20 rounded-3xl border p-8 space-y-4 ${
                  isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 mx-auto">
                  <HardDriveDownload className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold">No Wallpapers Saved Offline Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Save wallpapers for offline browsing so they load instantly even without a cellular network.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsOfflineModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs transition cursor-pointer"
                  >
                    Pre-cache Wallpapers
                  </button>
                  <button
                    onClick={() => setCurrentTab('wallpapers')}
                    className={`px-4 py-2 rounded-xl font-semibold text-xs transition cursor-pointer ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    Browse Wallpapers
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
                {cachedWallpapers.map((wp) => (
                  <WallpaperCard
                    key={wp.id}
                    wallpaper={wp}
                    isFavorited={favoritedIds.has(wp.id)}
                    isOfflineCached={true}
                    isDataSaver={false}
                    onSelect={(item) => setSelectedWallpaper(item)}
                    onSetAsWallpaper={(item) => setStudioWallpaper(item)}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleCacheOffline={handleToggleCacheOffline}
                    isDarkTheme={isDark}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FAVORITES */}
        {currentTab === 'favorites' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-pink-500" />
                  <span>My Starred Wallpapers</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-500 font-mono font-bold">
                    {favoriteWallpapers.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Quick access to all bookmarked wallpapers
                </p>
              </div>

              {favoriteWallpapers.length > 0 && (
                <button
                  onClick={() => {
                    setSlideshowStartIndex(0);
                    setIsSlideshowOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500 text-white text-xs font-semibold shadow-sm hover:bg-pink-600 transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Favorites Slideshow</span>
                </button>
              )}
            </div>

            {favoriteWallpapers.length === 0 ? (
              <div
                className={`text-center py-20 rounded-3xl border p-8 space-y-4 ${
                  isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500 mx-auto">
                  <Bookmark className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold">No Favorites Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Tap the heart icon on any wallpaper card to save it into your personal collection.
                </p>
                <button
                  onClick={() => setCurrentTab('wallpapers')}
                  className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs transition cursor-pointer"
                >
                  Explore Wallpapers
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
                {favoriteWallpapers.map((wp) => (
                  <WallpaperCard
                    key={wp.id}
                    wallpaper={wp}
                    isFavorited={true}
                    isOfflineCached={cachedIds.has(wp.id)}
                    isDataSaver={isDataSaver}
                    onSelect={(item) => setSelectedWallpaper(item)}
                    onSetAsWallpaper={(item) => setStudioWallpaper(item)}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleCacheOffline={handleToggleCacheOffline}
                    isDarkTheme={isDark}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Floating Go-To-Top and Vertical Scroll Navigation Slider */}
      <ScrollNavigation isDarkTheme={isDark} />

      {/* MODALS */}
      {/* 1. Android Wallpaper Studio (Material You, Presets, Filters, Set Background) */}
      {studioWallpaper && (
        <AndroidWallpaperStudio
          wallpaper={studioWallpaper}
          isOpen={true}
          onClose={() => setStudioWallpaper(null)}
          onCachedSuccessfully={refreshCacheAndFavorites}
          isDarkTheme={isDark}
        />
      )}

      {/* 2. Wallpaper Detail Modal (High-Res Viewer, Carousel, Album Strip) */}
      {selectedWallpaper && (
        <WallpaperDetailModal
          wallpaper={selectedWallpaper}
          allWallpapers={displayedWallpapers}
          isOpen={true}
          onClose={() => setSelectedWallpaper(null)}
          onOpenStudio={(wp) => setStudioWallpaper(wp)}
          onOpenSlideshow={(idx) => {
            setSlideshowStartIndex(idx);
            setIsSlideshowOpen(true);
          }}
          onSelectWallpaper={(wp) => setSelectedWallpaper(wp)}
          onNext={handleNextWallpaper}
          onPrev={handlePrevWallpaper}
          hasNext={currentWallpaperIndex < displayedWallpapers.length - 1}
          hasPrev={currentWallpaperIndex > 0}
          isFavorited={favoritedIds.has(selectedWallpaper.id)}
          isOfflineCached={cachedIds.has(selectedWallpaper.id)}
          onToggleFavorite={handleToggleFavorite}
          onCacheStatusChange={refreshCacheAndFavorites}
          isDarkTheme={isDark}
        />
      )}

      {/* 3. Album View Modal */}
      {selectedAlbum && (
        <AlbumViewModal
          post={selectedAlbum}
          isOpen={true}
          onClose={() => setSelectedAlbum(null)}
          onSelectWallpaper={(wp) => setSelectedWallpaper(wp)}
          onSetAsWallpaper={(wp) => setStudioWallpaper(wp)}
          onToggleFavorite={handleToggleFavorite}
          onToggleCacheOffline={handleToggleCacheOffline}
          favoritedIds={favoritedIds}
          cachedIds={cachedIds}
          isDataSaver={isDataSaver}
          onAlbumCached={refreshCacheAndFavorites}
          isDarkTheme={isDark}
        />
      )}

      {/* 4. Offline Storage & Quota Manager Modal */}
      <OfflineManagerModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        cachedCount={cachedCount}
        cachedSizeStr={cachedSizeStr}
        availableWallpapers={wallpapers}
        onCacheUpdated={refreshCacheAndFavorites}
        resolution={resolution}
        setResolution={setResolution}
        isDarkTheme={isDark}
      />

      {/* 5. Ambient Fullscreen Slideshow Modal */}
      {isSlideshowOpen && (
        <SlideshowModal
          wallpapers={
            currentTab === 'favorites'
              ? favoriteWallpapers
              : currentTab === 'offline'
              ? cachedWallpapers
              : displayedWallpapers
          }
          startIndex={slideshowStartIndex}
          isOpen={true}
          onClose={() => setIsSlideshowOpen(false)}
          onOpenStudio={(wp) => {
            setIsSlideshowOpen(false);
            setStudioWallpaper(wp);
          }}
        />
      )}
    </div>
  );
}
