'use client'

/**
 * SkipLink component for keyboard navigation accessibility
 * Allows users to skip directly to main content
 */
export function SkipLink({ href = '#main-content', children = 'Skip to main content' }: {
  href?: string
  children?: React.ReactNode
}) {
  return (
    <a
      href={href}
      className="
        sr-only focus:not-sr-only
        fixed top-4 left-4 z-[100]
        bg-blue-600 text-white
        px-4 py-2 rounded-lg
        font-semibold text-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
        transition-all duration-200
      "
    >
      {children}
    </a>
  )
}
