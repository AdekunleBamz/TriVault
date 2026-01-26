'use client'

import { useState, useRef, useEffect } from 'react'

interface TruncateTextProps {
  text: string
  maxLength?: number
  expandable?: boolean
  className?: string
}

export function TruncateText({
  text,
  maxLength = 100,
  expandable = true,
  className = '',
}: TruncateTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (text.length <= maxLength) {
    return <span className={className}>{text}</span>
  }

  const truncated = text.slice(0, maxLength).trim() + '...'

  return (
    <span className={className}>
      {isExpanded ? text : truncated}
      {expandable && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-1 text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </span>
  )
}

interface EllipsisTextProps {
  children: string
  lines?: number
  className?: string
}

export function EllipsisText({ children, lines = 2, className = '' }: EllipsisTextProps) {
  return (
    <p
      className={`overflow-hidden ${className}`}
      style={{
        display: '-webkit-box',
        WebkitLineClamp: lines,
        WebkitBoxOrient: 'vertical',
      }}
    >
      {children}
    </p>
  )
}

interface ExpandableTextProps {
  children: string
  previewLength?: number
  className?: string
}

export function ExpandableText({
  children,
  previewLength = 150,
  className = '',
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    setShowButton(children.length > previewLength)
  }, [children, previewLength])

  return (
    <div className={className}>
      <div
        ref={contentRef}
        className={`transition-all duration-300 ${!isExpanded ? 'line-clamp-3' : ''}`}
      >
        {children}
      </div>
      {showButton && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  )
}
