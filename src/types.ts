export interface WallpaperItem {
  id: string;
  originalUrl: string;
  proxyUrl: string;
  postId: number;
  postTitle: string;
  index: number;
  isCachedOffline?: boolean;
  cachedAt?: number;
  width?: number;
  height?: number;
}

export interface PostItem {
  id: number;
  date: string;
  slug: string;
  link: string;
  title: string;
  featuredImage: string;
  imagesCount: number;
  images: string[];
}

export interface WallpaperFilterOptions {
  search: string;
  sortBy: 'latest' | 'popular' | 'album';
  viewMode: 'wallpapers' | 'albums';
}

export interface MaterialYouPalette {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  text: string;
  containerBg: string;
}

export type DevicePreset = 'pixel' | 'galaxy' | 'standard' | 'tablet';
export type FilterPreset = 'none' | 'amoled' | 'film' | 'bloom' | 'vivid';
export type ResolutionQuality = 'original' | 'fhd' | 'saver';

export interface WallpaperSettings {
  target: 'home' | 'lock' | 'both';
  aspectRatio: '9:19.5' | '9:16' | '4:5' | '1:1';
  fit: 'cover' | 'contain' | 'blur-fill';
  brightness: number; // 50 - 150 (default 100)
  contrast: number; // 50 - 150 (default 100)
  blur: number; // 0 - 20 (default 0)
  zoom: number; // 1 - 2.5 (default 1)
  offsetX: number; // -100 to 100
  offsetY: number; // -100 to 100
  filter: FilterPreset;
  safeZoneOverlay: boolean;
  showParallax: boolean;
  homeIconBlur: boolean;
}

export interface CacheStats {
  count: number;
  sizeBytes: number;
  formattedSize: string;
  storageCapMB: number;
}

