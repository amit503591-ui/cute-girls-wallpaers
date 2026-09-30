import { WallpaperItem } from '../types';

const FAVORITES_KEY = 'cutepics_favorites_v1';

export function getFavoriteWallpapers(): WallpaperItem[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isWallpaperFavorited(id: string): boolean {
  const favorites = getFavoriteWallpapers();
  return favorites.some((item) => item.id === id);
}

export function toggleFavoriteWallpaper(wallpaper: WallpaperItem): boolean {
  try {
    const favorites = getFavoriteWallpapers();
    const index = favorites.findIndex((item) => item.id === wallpaper.id);
    let isNowFavorited = false;

    if (index >= 0) {
      favorites.splice(index, 1);
      isNowFavorited = false;
    } else {
      favorites.unshift(wallpaper);
      isNowFavorited = true;
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return isNowFavorited;
  } catch (err) {
    console.error('Error toggling favorite:', err);
    return false;
  }
}

export function exportFavoritesJson(): string {
  const favorites = getFavoriteWallpapers();
  return JSON.stringify(favorites, null, 2);
}

export function importFavoritesJson(jsonStr: string): number {
  try {
    const imported = JSON.parse(jsonStr);
    if (!Array.isArray(imported)) return 0;
    const current = getFavoriteWallpapers();
    const existingIds = new Set(current.map((f) => f.id));
    let addedCount = 0;

    for (const item of imported) {
      if (item && item.id && !existingIds.has(item.id)) {
        current.push(item);
        existingIds.add(item.id);
        addedCount++;
      }
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(current));
    return addedCount;
  } catch (e) {
    console.error('Error importing favorites:', e);
    return 0;
  }
}

