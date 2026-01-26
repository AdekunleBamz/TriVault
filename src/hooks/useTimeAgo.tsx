'use client'

import { useState, useEffect } from 'react'

type TimeUnit = {
  max: number
  divisor: number
  past: string
  future: string
}

const TIME_UNITS: TimeUnit[] = [
  { max: 60, divisor: 1, past: 'just now', future: 'just now' },
  { max: 3600, divisor: 60, past: '%d minute(s) ago', future: 'in %d minute(s)' },
  { max: 86400, divisor: 3600, past: '%d hour(s) ago', future: 'in %d hour(s)' },
  { max: 604800, divisor: 86400, past: '%d day(s) ago', future: 'in %d day(s)' },
  { max: 2592000, divisor: 604800, past: '%d week(s) ago', future: 'in %d week(s)' },
  { max: 31536000, divisor: 2592000, past: '%d month(s) ago', future: 'in %d month(s)' },
  { max: Infinity, divisor: 31536000, past: '%d year(s) ago', future: 'in %d year(s)' },
]

function formatTimeAgo(timestamp: number | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp * 1000)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  const isPast = diffInSeconds >= 0
  const absDiff = Math.abs(diffInSeconds)

  for (const unit of TIME_UNITS) {
    if (absDiff < unit.max) {
      const value = Math.floor(absDiff / unit.divisor)
      const template = isPast ? unit.past : unit.future
      return template.replace('%d', value.toString()).replace('(s)', value === 1 ? '' : 's')
    }
  }

  return 'a long time ago'
}

export function useTimeAgo(timestamp: number | Date, updateInterval: number = 60000): string {
  const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(timestamp))

  useEffect(() => {
    setTimeAgo(formatTimeAgo(timestamp))

    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(timestamp))
    }, updateInterval)

    return () => clearInterval(interval)
  }, [timestamp, updateInterval])

  return timeAgo
}

interface TimeAgoProps {
  timestamp: number | Date
  updateInterval?: number
  className?: string
}

export function TimeAgo({ timestamp, updateInterval = 60000, className = '' }: TimeAgoProps) {
  const timeAgo = useTimeAgo(timestamp, updateInterval)
  
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp * 1000)
  
  return (
    <time 
      dateTime={date.toISOString()} 
      title={date.toLocaleString()}
      className={className}
    >
      {timeAgo}
    </time>
  )
}
