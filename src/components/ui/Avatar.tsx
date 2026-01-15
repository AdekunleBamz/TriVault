'use client';

import React from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

const sizeStyles = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

export function Avatar({
  src,
  alt = 'Avatar',
  size = 'md',
  fallback,
  className = '',
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  const initials = React.useMemo(() => {
    if (fallback) return fallback.slice(0, 2).toUpperCase();
    if (alt) {
      const words = alt.split(' ');
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return alt.slice(0, 2).toUpperCase();
    }
    return '??';
  }, [fallback, alt]);

  const shouldShowImage = src && !hasError;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 ${sizeStyles[size]} ${className}`}
    >
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full rounded-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="font-medium text-white">{initials}</span>
      )}
    </div>
  );
}

interface AvatarGroupProps {
  avatars: Array<{ src?: string; alt?: string }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const overlapStyles = {
  xs: '-ml-2',
  sm: '-ml-2',
  md: '-ml-3',
  lg: '-ml-4',
  xl: '-ml-5',
};

export function AvatarGroup({
  avatars,
  max = 5,
  size = 'md',
  className = '',
}: AvatarGroupProps) {
  const displayed = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={`flex items-center ${className}`}>
      {displayed.map((avatar, index) => (
        <div
          key={index}
          className={`${index > 0 ? overlapStyles[size] : ''} ring-2 ring-gray-900 rounded-full`}
        >
          <Avatar src={avatar.src} alt={avatar.alt} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`${overlapStyles[size]} ring-2 ring-gray-900 rounded-full`}
        >
          <div
            className={`flex items-center justify-center rounded-full bg-gray-700 text-gray-300 font-medium ${sizeStyles[size]}`}
          >
            +{remaining}
          </div>
        </div>
      )}
    </div>
  );
}

interface AddressAvatarProps {
  address: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AddressAvatar({ address, size = 'md', className = '' }: AddressAvatarProps) {
  // Generate a simple color from address
  const color = React.useMemo(() => {
    if (!address || address.length < 6) return '#a855f7';
    const hash = address.slice(2, 8);
    return `#${hash}`;
  }, [address]);

  const initials = React.useMemo(() => {
    if (!address) return '??';
    return address.slice(2, 4).toUpperCase();
  }, [address]);

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full ${sizeStyles[size]} ${className}`}
      style={{ backgroundColor: color }}
    >
      <span className="font-medium text-white">{initials}</span>
    </div>
  );
}
