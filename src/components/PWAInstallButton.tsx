import React, { useState } from 'react';
import { DownloadCloud, Smartphone, Check, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
        <Check className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Installed App</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 4000);
    }
  };

  return (
    <>
      {isInstallable ? (
        <button
          onClick={handleInstallClick}
          aria-label="Install Android App"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-pink-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      ) : (
        <button
          onClick={() => setShowGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
          title="Add to Android Home Screen"
        >
          <DownloadCloud className="w-3.5 h-3.5 text-pink-400" />
          <span>Install App</span>
        </button>
      )}

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-pink-400" />
                <h3 className="text-base font-semibold text-white">
                  {isIOS ? 'Add to Home Screen' : 'Install on Android'}
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {isIOS ? (
                <>
                  <p className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-xs text-pink-400 font-bold">1</span>
                    <span>Tap the <strong>Share</strong> icon in the bottom Safari toolbar.</span>
                  </p>
                  <p className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-xs text-pink-400 font-bold">2</span>
                    <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                  </p>
                </>
              ) : (
                <>
                  <p className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-xs text-pink-400 font-bold">1</span>
                    <span>Open in <strong>Chrome</strong> on your Android device.</span>
                  </p>
                  <p className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-xs text-pink-400 font-bold">2</span>
                    <span>Tap the <strong>⋮ (three dots)</strong> menu in Chrome &gt; tap <strong>Install app</strong> or <strong>Add to Home Screen</strong>.</span>
                  </p>
                </>
              )}
              <p className="flex items-start gap-2.5">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-xs text-pink-400 font-bold">✓</span>
                <span>Launches in full-screen standalone mode with complete offline caching!</span>
              </p>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="mt-6 w-full rounded-xl bg-pink-500 hover:bg-pink-600 py-2.5 text-sm font-semibold text-white transition cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
