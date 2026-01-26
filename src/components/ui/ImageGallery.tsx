'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  thumbnail?: string;
  width?: number;
  height?: number;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: number;
  gap?: number;
  className?: string;
}

/**
 * Masonry-style image gallery
 */
export function ImageGallery({
  images,
  columns = 3,
  gap = 4,
  className,
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openLightbox = useCallback((image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const goToPrevious = useCallback(() => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : images.length - 1;
    setSelectedIndex(newIndex);
    setSelectedImage(images[newIndex]);
  }, [selectedIndex, images]);

  const goToNext = useCallback(() => {
    const newIndex = selectedIndex < images.length - 1 ? selectedIndex + 1 : 0;
    setSelectedIndex(newIndex);
    setSelectedImage(images[newIndex]);
  }, [selectedIndex, images]);

  return (
    <>
      <div
        className={cn('grid', className)}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap * 4}px`,
        }}
      >
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => openLightbox(image, index)}
            className="relative aspect-square overflow-hidden rounded-lg group focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <img
              src={image.thumbnail ?? image.src}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
          </button>
        ))}
      </div>

      {selectedImage && (
        <Lightbox
          image={selectedImage}
          onClose={closeLightbox}
          onPrevious={goToPrevious}
          onNext={goToNext}
          currentIndex={selectedIndex}
          totalCount={images.length}
        />
      )}
    </>
  );
}

interface LightboxProps {
  image: GalleryImage;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  currentIndex: number;
  totalCount: number;
}

/**
 * Lightbox component for viewing images
 */
export function Lightbox({
  image,
  onClose,
  onPrevious,
  onNext,
  currentIndex,
  totalCount,
}: LightboxProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrevious();
          break;
        case 'ArrowRight':
          onNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrevious, onNext]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/90"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
        aria-label="Close"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous button */}
      <button
        onClick={onPrevious}
        className="absolute left-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
        aria-label="Previous image"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next button */}
      <button
        onClick={onNext}
        className="absolute right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
        aria-label="Next image"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
        {currentIndex + 1} / {totalCount}
      </div>

      {/* Image */}
      <img
        src={image.src}
        alt={image.alt}
        className="relative max-h-[90vh] max-w-[90vw] object-contain"
      />
    </div>
  );
}

interface ImageGridProps {
  images: GalleryImage[];
  layout?: 'grid' | 'masonry';
  columns?: number;
  className?: string;
}

/**
 * Flexible image grid with different layouts
 */
export function ImageGrid({
  images,
  layout = 'grid',
  columns = 4,
  className,
}: ImageGridProps) {
  if (layout === 'masonry') {
    // Create columns for masonry layout
    const columnArrays: GalleryImage[][] = Array.from({ length: columns }, () => []);
    
    images.forEach((image, index) => {
      columnArrays[index % columns].push(image);
    });

    return (
      <div className={cn('flex gap-4', className)}>
        {columnArrays.map((column, colIndex) => (
          <div key={colIndex} className="flex-1 flex flex-col gap-4">
            {column.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-lg">
                <img
                  src={image.thumbnail ?? image.src}
                  alt={image.alt}
                  className="w-full h-auto"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn('grid gap-4', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {images.map((image) => (
        <div key={image.id} className="aspect-square overflow-hidden rounded-lg">
          <img
            src={image.thumbnail ?? image.src}
            alt={image.alt}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export default ImageGallery;
