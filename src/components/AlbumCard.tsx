import React, { useState } from 'react';
import { PostItem } from '../types';
import { getProxyImageUrl } from '../services/cacheManager';
import { Images, HardDriveDownload, Check } from 'lucide-react';

interface AlbumCardProps {
  post: PostItem;
  onOpenAlbum: (post: PostItem) => void;
  onCacheWholeAlbum: (post: PostItem) => void;
  isAlbumCached: boolean;
  isDarkTheme?: boolean;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({
  post,
  onOpenAlbum,
  onCacheWholeAlbum,
  isAlbumCached,
  isDarkTheme = true,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const coverUrl = getProxyImageUrl(post.featuredImage || post.images[0] || '');

  return (
    <div
      onClick={() => onOpenAlbum(post)}
      className={`group relative rounded-2xl overflow-hidden border shadow-lg transition-all duration-300 flex flex-col cursor-pointer ${
        isDarkTheme
          ? 'bg-slate-900 border-slate-800 hover:border-pink-500/40 text-slate-100'
          : 'bg-white border-slate-200 hover:border-pink-400 text-slate-800'
      }`}
    >
      {/* Cover Image */}
      <div
        className={`relative w-full aspect-[4/3] overflow-hidden ${
          isDarkTheme ? 'bg-slate-950' : 'bg-slate-100'
        }`}
      >
        {!imageLoaded && (
          <div
            className={`absolute inset-0 animate-pulse ${
              isDarkTheme ? 'bg-slate-800' : 'bg-slate-200'
            }`}
          />
        )}
        <img
          src={coverUrl}
          alt={post.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-white/20 text-white text-xs font-semibold backdrop-blur-md">
          <Images className="w-3.5 h-3.5 text-pink-400" />
          <span>{post.imagesCount} Photos</span>
        </div>

        {isAlbumCached && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold backdrop-blur-md">
            <Check className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cached</span>
          </div>
        )}
      </div>

      {/* Album Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-sm sm:text-base group-hover:text-pink-500 transition line-clamp-2">
            {post.title}
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            {new Date(post.date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>

        <div
          className={`mt-4 pt-3 border-t flex items-center justify-between ${
            isDarkTheme ? 'border-slate-800' : 'border-slate-100'
          }`}
        >
          <span className="text-xs text-pink-500 font-semibold group-hover:underline flex items-center gap-1">
            Browse Album &rarr;
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onCacheWholeAlbum(post);
            }}
            title="Cache all photos from this album"
            className={`p-1.5 rounded-lg transition ${
              isDarkTheme ? 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800' : 'text-slate-500 hover:text-cyan-600 hover:bg-slate-100'
            }`}
          >
            <HardDriveDownload className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
