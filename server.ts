import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generateCutePicsApk } from './server/apkBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const FALLBACK_POSTS = [
  {
    id: 20516,
    date: '2026-10-02T13:31:40',
    slug: 'ajiang-voluptuous-silhouette',
    link: 'https://cutepics.24x7.hk/',
    title: '阿江的無敵豐盈上圍，令所有人目光無法移開',
    featuredImage: 'https://img.photos18.com/images/image/3281/32810981.avif?0',
    imagesCount: 10,
    images: [
      'https://img.photos18.com/images/image/3281/32810981.avif?0',
      'https://img.photos18.com/images/image/3281/32810982.avif?0',
      'https://img.photos18.com/images/image/3281/32810983.avif?0',
      'https://img.photos18.com/images/image/3281/32810984.avif?0',
      'https://img.photos18.com/images/image/3281/32810985.avif?0',
      'https://img.photos18.com/images/image/3281/32810986.avif?0',
      'https://img.photos18.com/images/image/3281/32810987.avif?0',
      'https://img.photos18.com/images/image/3281/32810988.avif?0',
      'https://img.photos18.com/images/image/3281/32810989.avif?0',
      'https://img.photos18.com/images/image/3281/32810990.avif?0',
    ],
  },
  {
    id: 20514,
    date: '2026-10-02T12:19:13',
    slug: 'angela-zhang-curves',
    link: 'https://cutepics.24x7.hk/',
    title: '張安琪性感曲線惹火誘人！視角逆天',
    featuredImage: 'https://img.photos18.com/images/image/3281/32810961.avif?0',
    imagesCount: 10,
    images: [
      'https://img.photos18.com/images/image/3281/32810961.avif?0',
      'https://img.photos18.com/images/image/3281/32810962.avif?0',
      'https://img.photos18.com/images/image/3281/32810963.avif?0',
      'https://img.photos18.com/images/image/3281/32810964.avif?0',
      'https://img.photos18.com/images/image/3281/32810965.avif?0',
      'https://img.photos18.com/images/image/3281/32810966.avif?0',
      'https://img.photos18.com/images/image/3281/32810967.avif?0',
      'https://img.photos18.com/images/image/3281/32810968.avif?0',
      'https://img.photos18.com/images/image/3281/32810969.avif?0',
      'https://img.photos18.com/images/image/3281/32810970.avif?0',
    ],
  },
  {
    id: 20502,
    date: '2026-09-30T14:22:25',
    slug: 'zola-slim-silhouette',
    link: 'https://cutepics.24x7.hk/',
    title: '佐拉：纖細身姿間乳香氤氳',
    featuredImage: 'https://cutepics.24x7.hk/wp-content/uploads/2026/09/32810921.avif',
    imagesCount: 11,
    images: [
      'https://cutepics.24x7.hk/wp-content/uploads/2026/09/32810921.avif',
      'https://img.photos18.com/images/image/3281/32810921.avif?0',
      'https://img.photos18.com/images/image/3281/32810922.avif?0',
      'https://img.photos18.com/images/image/3281/32810923.avif?0',
      'https://img.photos18.com/images/image/3281/32810924.avif?0',
      'https://img.photos18.com/images/image/3281/32810925.avif?0',
      'https://img.photos18.com/images/image/3281/32810926.avif?0',
      'https://img.photos18.com/images/image/3281/32810927.avif?0',
      'https://img.photos18.com/images/image/3281/32810928.avif?0',
      'https://img.photos18.com/images/image/3281/32810929.avif?0',
      'https://img.photos18.com/images/image/3281/32810930.avif?0',
    ],
  },
  {
    id: 20500,
    date: '2026-09-30T06:28:32',
    slug: 'paperfish-aesthetic-charm',
    link: 'https://cutepics.24x7.hk/',
    title: '紙魚：白嫩美體的極致誘惑',
    featuredImage: 'https://cutepics.24x7.hk/wp-content/uploads/2026/09/32810891.avif',
    imagesCount: 11,
    images: [
      'https://cutepics.24x7.hk/wp-content/uploads/2026/09/32810891.avif',
      'https://img.photos18.com/images/image/3281/32810891.avif?0',
      'https://img.photos18.com/images/image/3281/32810892.avif?0',
      'https://img.photos18.com/images/image/3281/32810893.avif?0',
      'https://img.photos18.com/images/image/3281/32810894.avif?0',
      'https://img.photos18.com/images/image/3281/32810895.avif?0',
      'https://img.photos18.com/images/image/3281/32810896.avif?0',
      'https://img.photos18.com/images/image/3281/32810897.avif?0',
      'https://img.photos18.com/images/image/3281/32810898.avif?0',
      'https://img.photos18.com/images/image/3281/32810899.avif?0',
      'https://img.photos18.com/images/image/3281/32810900.avif?0',
    ],
  },
];


function buildFallbackResult(page: number, perPage: number) {
  const allWallpapers: Array<{
    id: string;
    originalUrl: string;
    postId: number;
    postTitle: string;
    index: number;
  }> = [];

  FALLBACK_POSTS.forEach((post) => {
    post.images.forEach((imgUrl, index) => {
      allWallpapers.push({
        id: `${post.id}-${index}`,
        originalUrl: imgUrl,
        postId: post.id,
        postTitle: post.title,
        index,
      });
    });
  });

  return {
    posts: FALLBACK_POSTS,
    wallpapers: allWallpapers,
    page,
    perPage,
    totalPages: 5,
    totalPosts: 50,
  };
}
interface CacheEntry {
  timestamp: number;
  data: any;
}
const postsCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Helper to decode HTML entities in titles
function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .trim();
}

// Extract images from post content
function extractImagesFromContent(contentHtml: string): string[] {
  if (!contentHtml) return [];
  const urls = new Set<string>();

  // Look for hrefs pointing to images (often high-res links in lightbox/fancybox)
  const hrefRegex = /href=["']([^"']+\.(?:avif|webp|jpg|jpeg|png)(?:\?[^"']*)?)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = hrefRegex.exec(contentHtml)) !== null) {
    const raw = match[1].trim();
    if (raw.startsWith('http')) {
      urls.add(raw);
    }
  }

  // Look for src attributes
  const srcRegex = /src=["']([^"']+\.(?:avif|webp|jpg|jpeg|png)(?:\?[^"']*)?)["']/gi;
  while ((match = srcRegex.exec(contentHtml)) !== null) {
    const raw = match[1].trim();
    if (raw.startsWith('http') && !raw.includes('gravatar') && !raw.includes('plugins/')) {
      urls.add(raw);
    }
  }

  return Array.from(urls);
}

const inFlightRequests = new Map<string, Promise<any>>();

async function fetchFromWordPress(page: number, perPage: number, search: string) {
  const wpUrl = new URL('https://cutepics.24x7.hk/wp-json/wp/v2/posts');
  // Avoid heavy _embed query which causes slow DB joins and timeouts
  wpUrl.searchParams.set('_fields', 'id,date,slug,link,title,content');
  wpUrl.searchParams.set('page', String(page));
  wpUrl.searchParams.set('per_page', String(perPage));
  if (search.trim()) {
    wpUrl.searchParams.set('search', search.trim());
  }

  const response = await fetch(wpUrl.toString(), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Mobile Safari/537.36',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(22000),
  });

  if (!response.ok) {
    if (response.status === 400 && page > 1) {
      return {
        posts: [],
        wallpapers: [],
        page,
        perPage,
        totalPages: page - 1,
        totalPosts: (page - 1) * perPage,
      };
    }
    throw new Error(`WordPress API returned status ${response.status}`);
  }

  const totalPages = parseInt(response.headers.get('x-wp-totalpages') || '1', 10);
  const totalPosts = parseInt(response.headers.get('x-wp-total') || '0', 10);
  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Expected array of posts');
  }

  const parsedPosts = data.map((post: any) => {
    const title = decodeHtmlEntities(post.title?.rendered || 'Cute Wallpaper');
    const contentImages = extractImagesFromContent(post.content?.rendered || '');
    const featuredImage = contentImages.length > 0 ? contentImages[0] : '';

    return {
      id: post.id,
      date: post.date,
      slug: post.slug,
      link: post.link,
      title,
      featuredImage,
      imagesCount: contentImages.length,
      images: contentImages,
    };
  });

  const allWallpapers: Array<{
    id: string;
    originalUrl: string;
    postId: number;
    postTitle: string;
    index: number;
  }> = [];

  parsedPosts.forEach((post) => {
    post.images.forEach((imgUrl, index) => {
      allWallpapers.push({
        id: `${post.id}-${index}`,
        originalUrl: imgUrl,
        postId: post.id,
        postTitle: post.title,
        index,
      });
    });
  });

  return {
    posts: parsedPosts,
    wallpapers: allWallpapers,
    page,
    perPage,
    totalPages,
    totalPosts,
  };
}

// Background cache pre-warm
async function prewarmCache() {
  try {
    const result = await fetchFromWordPress(1, 12, '');
    postsCache.set('posts:1:12:', { timestamp: Date.now(), data: result });
    console.log('[Cache] Pre-warmed initial wallpaper set successfully');
  } catch (e: any) {
    console.warn('[Cache] Initial pre-warm failed, fallback ready:', e.message);
  }
}

// Route: Get wallpaper posts
app.get('/api/posts', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const perPage = Math.min(parseInt(req.query.per_page as string) || 12, 50);
  const search = (req.query.search as string) || '';

  const cacheKey = `posts:${page}:${perPage}:${search}`;
  const cached = postsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  // Deduplicate concurrent requests
  let fetchPromise = inFlightRequests.get(cacheKey);
  if (!fetchPromise) {
    fetchPromise = fetchFromWordPress(page, perPage, search)
      .then((data) => {
        postsCache.set(cacheKey, { timestamp: Date.now(), data });
        inFlightRequests.delete(cacheKey);
        return data;
      })
      .catch((error: any) => {
        inFlightRequests.delete(cacheKey);
        console.warn(`[WordPress API] Notice for ${cacheKey}: ${error.message}. Serving cached/fallback.`);
        if (cached) return cached.data;
        const page1Cache = postsCache.get('posts:1:12:');
        if (page1Cache && page === 1 && !search) return page1Cache.data;
        return buildFallbackResult(page, perPage);
      });

    inFlightRequests.set(cacheKey, fetchPromise);
  }

  try {
    const data = await fetchPromise;
    return res.json(data);
  } catch {
    return res.json(buildFallbackResult(page, perPage));
  }
});


// Route: Image proxy to bypass CORS, provide long-term browser caching, and prevent hotlink blocking
app.get('/api/image-proxy', async (req: Request, res: Response) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).send('Missing url parameter');
  }

  try {
    const parsed = new URL(imageUrl);
    // Security check: only allow safe image CDNs and source domains
    const allowedHosts = ['cutepics.24x7.hk', 'photos18.com', 'img.photos18.com'];
    const isAllowed = allowedHosts.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    );

    if (!isAllowed) {
      return res.status(403).send('Forbidden host');
    }

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        Referer: 'https://cutepics.24x7.hk/',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) {
      return res.status(response.status).send(`Upstream image failed: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const contentLength = response.headers.get('content-length');

    // Caching headers: 30 days immutable client and edge caching
    res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Stream the image data to client
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return res.send(buffer);
  } catch (error: any) {
    console.warn('Image proxy warning:', error.message);
    return res.status(502).send('Error proxying image');
  }
});

// Ensure public APK exists
const APK_PUBLIC_PATH = path.resolve(__dirname, 'public', 'CutePics-Android-v1.0.apk');
generateCutePicsApk(APK_PUBLIC_PATH);

// Direct APK Download Endpoint
const handleApkDownload = (_req: Request, res: Response) => {
  if (!fs.existsSync(APK_PUBLIC_PATH)) {
    generateCutePicsApk(APK_PUBLIC_PATH);
  }
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="CutePics-Android-v1.0.apk"');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.sendFile(APK_PUBLIC_PATH);
};

app.get('/api/download-apk', handleApkDownload);
app.get('/CutePics-Android-v1.0.apk', handleApkDownload);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const server = http.createServer(app);

  if (!isProd) {
    // Development mode with Vite dev middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`CutePics Wallpaper Studio server running on port ${PORT}`);
    // Pre-warm cache after server starts listening
    prewarmCache().catch(() => {});
    setInterval(() => prewarmCache().catch(() => {}), 10 * 60 * 1000);
  });
}


startServer();
