'use client'

import { useState, useEffect } from 'react'

interface ScrollToTopButtonProps {
  /** Threshold in pixels before showing the button */
  threshold?: number
  /** Smooth or instant scroll behavior */
  behavior?: ScrollBehavior
  /** Custom class name */
  className?: string
}

/**
 * Floating button to scroll back to top of page
 * Shows only after scrolling past threshold
 */
export function ScrollToTopButton({
  threshold = 400,
  behavior = 'smooth',
  className = '',
}: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [threshold])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`
        fixed bottom-6 right-6 z-50
        w-12 h-12 rounded-full
        bg-blue-600 hover:bg-blue-700
        text-white shadow-lg
        flex items-center justify-center
        transition-all duration-300
        hover:scale-110
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
        animate-fade-in
        ${className}
      `}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  )
}
