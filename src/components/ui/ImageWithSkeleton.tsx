'use client'

import { useState, ImgHTMLAttributes } from 'react'

interface ImageWithSkeletonProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
  skeletonClassName?: string
}

/**
 * Image component with loading skeleton and error fallback
 */
export function ImageWithSkeleton({
  src,
  alt,
  fallbackSrc = '/placeholder.png',
  className = '',
  skeletonClassName = '',
  ...props
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  return (
    <div className="relative">
      {isLoading && (
        <div
          className={`
            absolute inset-0
            bg-gray-800 
            animate-pulse
            ${skeletonClassName}
          `}
        />
      )}
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          transition-opacity duration-300
          ${className}
        `}
        {...props}
      />
    </div>
  )
}

/**
 * Avatar with loading state and initials fallback
 */
export function AvatarWithFallback({
  src,
  alt,
  name,
  size = 'md',
  className = '',
}: {
  src?: string
  alt: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(!!src)

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const showFallback = !src || hasError

  return (
    <div
      className={`
        relative rounded-full overflow-hidden
        bg-gradient-to-br from-blue-500 to-purple-600
        flex items-center justify-center
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {isLoading && src && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
      
      {showFallback ? (
        <span className="font-semibold text-white">
          {name ? getInitials(name) : '?'}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  )
}
