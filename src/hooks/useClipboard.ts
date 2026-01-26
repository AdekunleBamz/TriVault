'use client'

import { useState, useCallback } from 'react'

interface UseClipboardOptions {
  successDuration?: number
}

interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>
  copied: boolean
  error: Error | null
  reset: () => void
}

/**
 * Hook for copying text to clipboard with feedback
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { successDuration = 2000 } = options
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!navigator?.clipboard) {
        setError(new Error('Clipboard API not available'))
        return false
      }

      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setError(null)

        // Reset copied state after duration
        setTimeout(() => {
          setCopied(false)
        }, successDuration)

        return true
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to copy'))
        setCopied(false)
        return false
      }
    },
    [successDuration]
  )

  const reset = useCallback(() => {
    setCopied(false)
    setError(null)
  }, [])

  return { copy, copied, error, reset }
}

/**
 * Hook to read from clipboard
 */
export function useClipboardRead() {
  const [text, setText] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isReading, setIsReading] = useState(false)

  const read = useCallback(async (): Promise<string | null> => {
    if (!navigator?.clipboard) {
      setError(new Error('Clipboard API not available'))
      return null
    }

    setIsReading(true)
    try {
      const clipboardText = await navigator.clipboard.readText()
      setText(clipboardText)
      setError(null)
      return clipboardText
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to read clipboard'))
      setText(null)
      return null
    } finally {
      setIsReading(false)
    }
  }, [])

  return { text, read, error, isReading }
}
