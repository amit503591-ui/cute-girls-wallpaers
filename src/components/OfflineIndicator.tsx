import React from 'react';
import { WifiOff, HardDrive } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      aria-label="Offline Mode Notification"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full bg-slate-900/95 border border-amber-500/40 px-4 py-2 text-xs font-medium text-amber-200 shadow-xl backdrop-blur-md animate-bounce"
    >
      <span className="flex h-2 w-2 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
      </span>
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Offline Mode Active — Browsing cached wallpapers</span>
      <HardDrive className="w-3.5 h-3.5 text-amber-400/80 ml-1" />
    </aside>
  );
};
