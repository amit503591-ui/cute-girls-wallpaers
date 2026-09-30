import { MaterialYouPalette } from '../types';

export async function extractMaterialYouPalette(imageUrl: string): Promise<MaterialYouPalette> {
  return new Promise((resolve) => {
    const fallback: MaterialYouPalette = {
      primary: '#ec4899',
      secondary: '#a855f7',
      accent: '#6366f1',
      surface: 'rgba(30, 27, 75, 0.75)',
      text: '#ffffff',
      containerBg: 'rgba(236, 72, 153, 0.25)',
    };

    if (typeof window === 'undefined') return resolve(fallback);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(fallback);

        ctx.drawImage(img, 0, 0, 64, 64);
        const data = ctx.getImageData(0, 0, 64, 64).data;

        // Bucket colors by Hue (12 bins)
        const buckets: { r: number; g: number; b: number; count: number; sat: number }[] = Array.from({ length: 12 }, () => ({
          r: 0,
          g: 0,
          b: 0,
          count: 0,
          sat: 0,
        }));

        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const d = max - min;
          if (max < 30 || min > 235 || d < 20) continue; // skip near black, near white, low saturation

          let h = 0;
          if (max === r) h = ((g - b) / d) % 6;
          else if (max === g) h = (b - r) / d + 2;
          else h = (r - g) / d + 4;
          h = Math.round(h * 60);
          if (h < 0) h += 360;

          const bin = Math.min(11, Math.floor(h / 30));
          buckets[bin].r += r;
          buckets[bin].g += g;
          buckets[bin].b += b;
          buckets[bin].sat += d / max;
          buckets[bin].count++;
        }

        // Sort by count and saturation
        const sorted = buckets
          .filter((b) => b.count > 0)
          .sort((a, b) => b.count * (1 + b.sat / b.count) - a.count * (1 + a.sat / a.count));

        if (sorted.length === 0) return resolve(fallback);

        const top = sorted[0];
        const r1 = Math.round(top.r / top.count);
        const g1 = Math.round(top.g / top.count);
        const b1 = Math.round(top.b / top.count);

        const sec = sorted.length > 1 ? sorted[1] : sorted[0];
        const r2 = Math.round(sec.r / sec.count);
        const g2 = Math.round(sec.g / sec.count);
        const b2 = Math.round(sec.b / sec.count);

        const primaryHex = `#${((1 << 24) + (r1 << 16) + (g1 << 8) + b1).toString(16).slice(1)}`;
        const secondaryHex = `#${((1 << 24) + (r2 << 16) + (g2 << 8) + b2).toString(16).slice(1)}`;
        const accentHex = sorted.length > 2
          ? `#${((1 << 24) + (Math.round(sorted[2].r / sorted[2].count) << 16) + (Math.round(sorted[2].g / sorted[2].count) << 8) + Math.round(sorted[2].b / sorted[2].count)).toString(16).slice(1)}`
          : primaryHex;

        resolve({
          primary: primaryHex,
          secondary: secondaryHex,
          accent: accentHex,
          surface: `rgba(${Math.round(r1 * 0.2)}, ${Math.round(g1 * 0.2)}, ${Math.round(b1 * 0.2)}, 0.65)`,
          text: '#ffffff',
          containerBg: `rgba(${r1}, ${g1}, ${b1}, 0.25)`,
        });
      } catch {
        resolve(fallback);
      }
    };
    img.onerror = () => resolve(fallback);
    img.src = imageUrl;
  });
}
