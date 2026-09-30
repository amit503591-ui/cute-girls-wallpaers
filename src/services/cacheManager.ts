import { WallpaperItem } from '../types';

const CACHE_NAME = 'cute-wallpapers-cache-v1';
const DB_NAME = 'cute_wallpapers_db';
const DB_VERSION = 1;
const STORE_NAME = 'cached_wallpapers';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const STORAGE_CAP_KEY = 'cutepics_storage_cap_mb';

export function getStorageCapMB(): number {
  try {
    const val = localStorage.getItem(STORAGE_CAP_KEY);
    return val ? parseInt(val, 10) : 100;
  } catch {
    return 100;
  }
}

export function setStorageCapMB(mb: number): void {
  try {
    localStorage.setItem(STORAGE_CAP_KEY, String(mb));
  } catch {}
}

export function getProxyImageUrl(originalUrl: string, quality: 'original' | 'fhd' | 'saver' = 'original'): string {
  if (!originalUrl) return '';
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}&quality=${quality}`;
}

// Prune least recently used wallpapers if storage exceeds cap
export async function enforceStorageCap(): Promise<void> {
  try {
    const capMB = getStorageCapMB();
    const items = await getOfflineWallpapers();
    const approxTotalMB = (items.length * 350) / 1024;
    if (approxTotalMB > capMB) {
      // Remove oldest cached items until within 85% of cap
      const targetCount = Math.floor((capMB * 0.85 * 1024) / 350);
      const toRemove = items.slice(targetCount);
      for (const item of toRemove) {
        await removeCachedWallpaper(item.id, item.originalUrl);
      }
    }
  } catch (e) {
    console.error('Error enforcing storage cap:', e);
  }
}

// Save image to CacheStorage and metadata to IndexedDB
export async function cacheWallpaperOffline(wallpaper: WallpaperItem): Promise<boolean> {
  try {
    const proxyUrl = getProxyImageUrl(wallpaper.originalUrl);

    // Fetch and store in CacheStorage
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      const matched = await cache.match(proxyUrl);
      if (!matched) {
        const response = await fetch(proxyUrl);
        if (response.ok) {
          await cache.put(proxyUrl, response.clone());
        }
      }
    }

    // Save metadata in IndexedDB
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const offlineItem: WallpaperItem = {
      ...wallpaper,
      isCachedOffline: true,
      cachedAt: Date.now(),
      proxyUrl,
    };
    store.put(offlineItem);

    await new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });

    // Check cap in background
    enforceStorageCap().catch(() => {});
    return true;
  } catch (err) {
    console.error('Failed to cache wallpaper offline:', err);
    return false;
  }
}


// Remove wallpaper from cache and IndexedDB
export async function removeCachedWallpaper(id: string, originalUrl: string): Promise<boolean> {
  try {
    const proxyUrl = getProxyImageUrl(originalUrl);
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(proxyUrl);
    }

    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.error('Failed to remove wallpaper from cache:', err);
    return false;
  }
}

// Check if a wallpaper is cached in CacheStorage or DB
export async function isWallpaperCached(originalUrl: string): Promise<boolean> {
  try {
    const proxyUrl = getProxyImageUrl(originalUrl);
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      const matched = await cache.match(proxyUrl);
      if (matched) return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Get all offline cached wallpapers from IndexedDB
export async function getOfflineWallpapers(): Promise<WallpaperItem[]> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const items = request.result as WallpaperItem[];
        // Sort newest cached first
        items.sort((a, b) => (b.cachedAt || 0) - (a.cachedAt || 0));
        resolve(items);
      };
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

// Get Cache Storage statistics (count and estimated MB)
export async function getCacheStats(): Promise<{ count: number; formattedSize: string; storageCapMB: number }> {
  try {
    const offlineItems = await getOfflineWallpapers();
    let approximateBytes = 0;

    // Use navigator.storage.estimate if available
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      approximateBytes = estimate.usage || 0;
    } else {
      // Estimate 350KB per wallpaper average
      approximateBytes = offlineItems.length * 350 * 1024;
    }

    const mb = (approximateBytes / (1024 * 1024)).toFixed(1);
    return {
      count: offlineItems.length,
      formattedSize: `${mb} MB`,
      storageCapMB: getStorageCapMB(),
    };
  } catch {
    return { count: 0, formattedSize: '0 MB', storageCapMB: getStorageCapMB() };
  }
}


// Clear all wallpaper cache and indexedDB store
export async function clearAllWallpaperCache(): Promise<boolean> {
  try {
    if ('caches' in window) {
      await caches.delete(CACHE_NAME);
    }
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.error('Error clearing cache:', err);
    return false;
  }
}

// Pre-cache top wallpapers in batch with progress callback
export async function preCacheWallpapers(
  wallpapers: WallpaperItem[],
  onProgress?: (completed: number, total: number) => void
): Promise<number> {
  let completed = 0;
  for (const wp of wallpapers) {
    const success = await cacheWallpaperOffline(wp);
    if (success) completed++;
    if (onProgress) {
      onProgress(completed, wallpapers.length);
    }
  }
  return completed;
}
