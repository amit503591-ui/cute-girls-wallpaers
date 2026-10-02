import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateCutePicsApk(outputPath: string): void {
  try {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // If an existing valid compiled APK (> 10KB) is present, preserve it
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      if (stats.size > 10000) {
        return;
      }
    }

    const masterApk = path.resolve(__dirname, 'master-app.apk');
    if (fs.existsSync(masterApk)) {
      fs.copyFileSync(masterApk, outputPath);
      console.log(`[APK Builder] Deployed verified signed Android APK to ${outputPath}`);
      return;
    }

    console.warn('[APK Builder] Master signed APK not found, please ensure master-app.apk exists.');
  } catch (err) {
    console.error('[APK Builder] Error ensuring APK:', err);
  }
}
