'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type AspectRatioPreset = 'square' | 'video' | 'portrait' | 'wide' | 'ultrawide';

interface AspectRatioProps {
  ratio?: number | AspectRatioPreset;
  children: React.ReactNode;
  className?: string;
}

const presetRatios: Record<AspectRatioPreset, number> = {
  square: 1,
  video: 16 / 9,
  portrait: 3 / 4,
  wide: 21 / 9,
  ultrawide: 32 / 9,
};

export function AspectRatio({
  ratio = 'video',
  children,
  className,
}: AspectRatioProps) {
  const numericRatio = typeof ratio === 'string' ? presetRatios[ratio] : ratio;
  const paddingTop = `${(1 / numericRatio) * 100}%`;

  return (
    <div className={cn('relative w-full', className)}>
      <div style={{ paddingTop }} />
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

interface ResponsiveImageProps {
  src: string;
  alt: string;
  ratio?: number | AspectRatioPreset;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  className?: string;
  imageClassName?: string;
}

export function ResponsiveImage({
  src,
  alt,
  ratio = 'video',
  objectFit = 'cover',
  className,
  imageClassName,
}: ResponsiveImageProps) {
  return (
    <AspectRatio ratio={ratio} className={cn('overflow-hidden', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          imageClassName
        )}
      />
    </AspectRatio>
  );
}

interface ResponsiveVideoProps {
  src?: string;
  poster?: string;
  ratio?: number | AspectRatioPreset;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  className?: string;
  children?: React.ReactNode; // For iframe embeds
}

export function ResponsiveVideo({
  src,
  poster,
  ratio = 'video',
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  className,
  children,
}: ResponsiveVideoProps) {
  return (
    <AspectRatio ratio={ratio} className={cn('overflow-hidden bg-black', className)}>
      {children ? (
        children
      ) : (
        <video
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
          className="w-full h-full object-cover"
        />
      )}
    </AspectRatio>
  );
}

interface YouTubeEmbedProps {
  videoId: string;
  ratio?: number | AspectRatioPreset;
  autoPlay?: boolean;
  className?: string;
}

export function YouTubeEmbed({
  videoId,
  ratio = 'video',
  autoPlay = false,
  className,
}: YouTubeEmbedProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}${autoPlay ? '?autoplay=1' : ''}`;

  return (
    <AspectRatio ratio={ratio} className={cn('overflow-hidden bg-black', className)}>
      <iframe
        src={embedUrl}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </AspectRatio>
  );
}

export default AspectRatio;
