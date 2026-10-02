import React from 'react';

interface AdBannerProps {
  className?: string;
  isDarkTheme?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({ className = '', isDarkTheme = true }) => {
  const adHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <base target="_blank">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: transparent;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : 'ca5363f0d28d1b0f8c63b5f7225ce6e7',
      'format' : 'iframe',
      'height' : 60,
      'width' : 468,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://penguinsincequalify.com/ca5363f0d28d1b0f8c63b5f7225ce6e7/invoke.js"></script>
</body>
</html>`;

  return (
    <div
      className={`w-full flex flex-col items-center justify-center my-3 sm:my-4 overflow-hidden select-none ${className}`}
    >
      <div
        className={`w-full max-w-[468px] min-h-[60px] rounded-xl border flex items-center justify-center p-0.5 overflow-hidden transition-colors ${
          isDarkTheme ? 'bg-slate-900/60 border-slate-800/80 shadow-sm' : 'bg-slate-50 border-slate-200 shadow-sm'
        }`}
      >
        <iframe
          title="Sponsored Advertisement"
          srcDoc={adHtml}
          width={468}
          height={60}
          className="max-w-full border-0 block overflow-hidden"
          scrolling="no"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-medium mt-1">
        Advertisement
      </span>
    </div>
  );
};
