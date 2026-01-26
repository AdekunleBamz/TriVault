'use client'

import { useState, useCallback } from 'react'

interface CopyButtonProps {
  text: string
  onCopy?: () => void
  successDuration?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

/**
 * Button to copy text to clipboard with visual feedback
 */
export function CopyButton({
  text,
  onCopy,
  successDuration = 2000,
  className = '',
  size = 'md',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      onCopy?.()
      setTimeout(() => setCopied(false), successDuration)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [text, onCopy, successDuration])

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
      className={`
        inline-flex items-center justify-center
        p-2 rounded-lg
        text-gray-400 hover:text-white
        hover:bg-gray-800 
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${copied ? 'text-green-500 hover:text-green-400' : ''}
        ${className}
      `}
    >
      {copied ? (
        <svg className={sizeClasses[size]} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className={sizeClasses[size]} viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 2a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H8z" />
          <path d="M4 6a2 2 0 012-2h1v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
        </svg>
      )}
    </button>
  )
}

/**
 * Text with copy button inline
 */
export function CopyableText({ 
  text, 
  displayText, 
  className = '' 
}: { 
  text: string
  displayText?: string
  className?: string
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <code className="text-sm text-gray-300 bg-gray-800 px-2 py-1 rounded">
        {displayText || text}
      </code>
      <CopyButton text={text} size="sm" />
    </span>
  )
}
