import React, { useState } from 'react';
import {
  X,
  HardDriveDownload,
  Trash2,
  Zap,
  CheckCircle2,
  Download,
  Wifi,
  FileJson,
  Upload,
  Gauge,
  Sliders,
} from 'lucide-react';
import { WallpaperItem, ResolutionQuality } from '../types';
import {
  clearAllWallpaperCache,
  preCacheWallpapers,
  getStorageCapMB,
  setStorageCapMB,
  enforceStorageCap,
} from '../services/cacheManager';
import { exportFavoritesJson, importFavoritesJson } from '../services/favoritesManager';

interface OfflineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cachedCount: number;
  cachedSizeStr: string;
  availableWallpapers: WallpaperItem[];
  onCacheUpdated: () => void;
  resolution: ResolutionQuality;
  setResolution: (q: ResolutionQuality) => void;
  isDarkTheme?: boolean;
}

export const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({
  isOpen,
  onClose,
  cachedCount,
  cachedSizeStr,
  availableWallpapers,
  onCacheUpdated,
  resolution,
  setResolution,
  isDarkTheme = true,
}) => {
  const [isPreCaching, setIsPreCaching] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [currentCap, setCurrentCap] = useState(() => getStorageCapMB());

  if (!isOpen) return null;

  const handlePreCache = async (limit: number) => {
    setIsPreCaching(true);
    setStatusMsg(`Pre-caching top ${limit} wallpapers for offline browsing...`);
    const targets = availableWallpapers.slice(0, limit);
    setProgress({ completed: 0, total: targets.length });

    try {
      const cached = await preCacheWallpapers(targets, (comp, tot) => {
        setProgress({ completed: comp, total: tot });
      });
      setStatusMsg(`Successfully cached ${cached} wallpapers for offline use!`);
      onCacheUpdated();
    } catch {
      setStatusMsg('Error during pre-caching.');
    } finally {
      setIsPreCaching(false);
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    setShowConfirmClear(false);
    try {
      await clearAllWallpaperCache();
      setStatusMsg('Offline cache cleared successfully.');
      onCacheUpdated();
    } catch {
      setStatusMsg('Failed to clear cache.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleCapChange = async (mb: number) => {
    setCurrentCap(mb);
    setStorageCapMB(mb);
    await enforceStorageCap();
    onCacheUpdated();
    setStatusMsg(`Cache quota limit set to ${mb}MB. Older items will auto-prune.`);
  };

  const handleExportFavorites = () => {
    const jsonStr = exportFavoritesJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CutePics_Favorites_Backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMsg('Favorites exported successfully as JSON file!');
  };

  const handleImportFavorites = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const count = importFavoritesJson(content);
      setStatusMsg(`Imported ${count} new favorite wallpapers!`);
      onCacheUpdated();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div
        className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 max-h-[92vh] overflow-y-auto border ${
          isDarkTheme ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${isDarkTheme ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <HardDriveDownload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Offline Storage & Quota</h3>
              <p className="text-xs text-slate-400">Manage offline caching, resolutions, and backups</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cache Overview Card */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className={`p-4 rounded-2xl border ${isDarkTheme ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[11px] font-medium text-slate-400">Wallpapers Cached</span>
            <div className="text-2xl font-bold mt-1">{cachedCount}</div>
            <span className="text-[10px] text-cyan-400 font-medium">Ready for offline viewing</span>
          </div>

          <div className={`p-4 rounded-2xl border ${isDarkTheme ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[11px] font-medium text-slate-400">Storage Used / Limit</span>
            <div className="text-2xl font-bold mt-1">
              {cachedSizeStr} <span className="text-xs font-normal text-slate-500">/ {currentCap}MB</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">Auto-prunes LRU</span>
          </div>
        </div>

        {/* Progress Bar (if pre-caching) */}
        {isPreCaching && (
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/30">
            <div className="flex items-center justify-between text-xs text-cyan-300 font-semibold mb-1.5">
              <span>Downloading for Offline...</span>
              <span>
                {progress.completed} / {progress.total}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                style={{
                  width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Status Message */}
        {statusMsg && !isPreCaching && (
          <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Storage Cap Quota Setting */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-semibold flex items-center gap-1.5 text-slate-300">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Storage Quota Cap (Auto-prunes oldest items)</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[50, 100, 250, 500].map((mb) => (
              <button
                key={mb}
                onClick={() => handleCapChange(mb)}
                className={`py-2 px-1 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                  currentCap === mb
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                    : isDarkTheme
                    ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {mb} MB
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Switcher */}
        <div className="mt-4 space-y-2">
          <label className="text-xs font-semibold flex items-center gap-1.5 text-slate-300">
            <Sliders className="w-3.5 h-3.5 text-pink-400" />
            <span>Download Resolution Quality</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'original' as ResolutionQuality, label: 'Ultra HD', desc: 'Original' },
              { id: 'fhd' as ResolutionQuality, label: 'FHD 1080p', desc: 'Balanced' },
              { id: 'saver' as ResolutionQuality, label: 'Data Saver', desc: '720p Fast' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setResolution(r.id)}
                className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                  resolution === r.id
                    ? 'bg-pink-500/20 border-pink-500 text-pink-400 font-bold'
                    : isDarkTheme
                    ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <div>{r.label}</div>
                <div className="text-[10px] text-slate-500">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Pre-cache Batch Action */}
        <div className="mt-5 space-y-2">
          <div className="text-xs font-semibold flex items-center gap-1.5 text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Pre-load for Zero-Data Browsing</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handlePreCache(15)}
              disabled={isPreCaching || availableWallpapers.length === 0}
              className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer ${
                isDarkTheme ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pre-cache 15 Photos</span>
            </button>

            <button
              onClick={() => handlePreCache(30)}
              disabled={isPreCaching || availableWallpapers.length === 0}
              className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer ${
                isDarkTheme ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-pink-400" />
              <span>Pre-cache 30 Photos</span>
            </button>
          </div>
        </div>

        {/* Backup & Restore Favorites */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
          <div className="text-xs font-semibold flex items-center gap-1.5 text-slate-300">
            <FileJson className="w-3.5 h-3.5 text-indigo-400" />
            <span>Backup & Restore Favorites</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportFavorites}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                isDarkTheme ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export JSON</span>
            </button>

            <label
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                isDarkTheme ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-pink-400" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportFavorites} className="hidden" />
            </label>
          </div>
        </div>

        {/* Clear Cache */}
        {cachedCount > 0 && (
          <div className="mt-4">
            {showConfirmClear ? (
              <div className="p-3 rounded-xl border border-red-500/40 bg-red-950/40 text-center space-y-2">
                <p className="text-xs text-red-200">
                  Clear all {cachedCount} offline wallpapers and free up {cachedSizeStr}?
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleClearCache}
                    disabled={isClearing}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    {isClearing ? 'Clearing...' : 'Yes, Clear All'}
                  </button>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    disabled={isClearing}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                disabled={isClearing}
                className="w-full py-2.5 px-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Clear Offline Cache</span>
              </button>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className={`mt-5 w-full py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            isDarkTheme ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
          }`}
        >
          Done
        </button>
      </div>
    </div>
  );
};
