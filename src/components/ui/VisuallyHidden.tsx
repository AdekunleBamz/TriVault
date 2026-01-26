import { ReactNode } from 'react'

interface VisuallyHiddenProps {
  children: ReactNode
  /** When true, the element is focusable via Tab */
  isFocusable?: boolean
}

/**
 * Hide content visually while keeping it accessible to screen readers
 * Useful for skip links, form labels, and accessible icons
 */
export function VisuallyHidden({ children, isFocusable = false }: VisuallyHiddenProps) {
  return (
    <span
      className={`
        absolute
        w-px h-px
        p-0 m-[-1px]
        overflow-hidden
        whitespace-nowrap
        border-0
        ${isFocusable ? 'focus:relative focus:w-auto focus:h-auto focus:m-0 focus:overflow-visible focus:whitespace-normal' : ''}
      `}
      style={{
        clip: 'rect(0, 0, 0, 0)',
      }}
    >
      {children}
    </span>
  )
}

/**
 * Announce content to screen readers without showing it
 */
export function LiveRegion({ 
  children, 
  politeness = 'polite',
  atomic = true 
}: { 
  children: ReactNode
  politeness?: 'polite' | 'assertive' | 'off'
  atomic?: boolean
}) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className="absolute w-px h-px p-0 m-[-1px] overflow-hidden whitespace-nowrap border-0"
      style={{ clip: 'rect(0, 0, 0, 0)' }}
    >
      {children}
    </div>
  )
}
