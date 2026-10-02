import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Download, Copy, Check, Smartphone, ExternalLink } from 'lucide-react';

interface ApkQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadApk: () => void;
  isDarkTheme?: boolean;
}

export const ApkQrModal: React.FC<ApkQrModalProps> = ({
  isOpen,
  onClose,
  onDownloadApk,
  isDarkTheme = true,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const apkUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/CutePics-Android-v1.0.apk`
      : '/CutePics-Android-v1.0.apk';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(apkUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.warn('QR code generation failed:', err));
    }
  }, [isOpen, apkUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(apkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border transition-all ${
          isDarkTheme
            ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-emerald-500/5'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Scan to Download APK</h3>
              <p className="text-xs text-slate-400">Android Direct Installation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="my-6 flex flex-col items-center">
          <div className="p-4 bg-white rounded-3xl shadow-xl border border-slate-200/80 flex items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code to Download Android APK"
                className="w-52 h-52 sm:w-56 sm:h-56 block rounded-xl"
              />
            ) : (
              <div className="w-52 h-52 sm:w-56 sm:h-56 flex items-center justify-center text-slate-400 text-xs animate-pulse">
                Generating QR code...
              </div>
            )}
          </div>

          {/* Device Instructions */}
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-medium text-center">
            <Smartphone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Point your Android phone camera at the QR code to install</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onDownloadApk}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download APK</span>
          </button>

          <button
            onClick={handleCopyLink}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold transition active:scale-95 cursor-pointer ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : isDarkTheme
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* Direct APK Link preview */}
        <div className="mt-4 text-center">
          <a
            href={apkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-emerald-500 hover:underline truncate max-w-full"
          >
            <span className="truncate">{apkUrl}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
};
