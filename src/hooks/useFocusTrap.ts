'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook to trap focus within a container element
 * Useful for modals, dialogs, and dropdown menus
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  isActive: boolean = true
) {
  const containerRef = useRef<T>(null)

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    )
  }, [])

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Focus the first focusable element when trap is activated
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive, getFocusableElements])

  return containerRef
}

/**
 * Hook to manage focus restoration when a component unmounts
 */
export function useFocusReturn(shouldRestore: boolean = true) {
  const previousElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (shouldRestore) {
      previousElement.current = document.activeElement as HTMLElement
    }

    return () => {
      if (shouldRestore && previousElement.current) {
        previousElement.current.focus()
      }
    }
  }, [shouldRestore])

  return previousElement
}
