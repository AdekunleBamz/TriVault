'use client'

import { useState, useEffect, useCallback } from 'react'

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
  isExpired: boolean
}

interface CountdownTimerProps {
  targetDate: Date | string | number
  onExpire?: () => void
  className?: string
  showDays?: boolean
  showLabels?: boolean
  separator?: string
}

/**
 * Hook for countdown logic
 */
export function useCountdown(targetDate: Date | string | number): TimeRemaining {
  const calculateTimeRemaining = useCallback((): TimeRemaining => {
    const target = new Date(targetDate).getTime()
    const now = Date.now()
    const difference = target - now

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isExpired: true,
      }
    }

    const totalSeconds = Math.floor(difference / 1000)
    const days = Math.floor(totalSeconds / (24 * 60 * 60))
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
    const seconds = totalSeconds % 60

    return { days, hours, minutes, seconds, totalSeconds, isExpired: false }
  }, [targetDate])

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(calculateTimeRemaining)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining())
    }, 1000)

    return () => clearInterval(timer)
  }, [calculateTimeRemaining])

  return timeRemaining
}

/**
 * Countdown timer display component
 */
export function CountdownTimer({
  targetDate,
  onExpire,
  className = '',
  showDays = true,
  showLabels = true,
  separator = ':',
}: CountdownTimerProps) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate)

  useEffect(() => {
    if (isExpired && onExpire) {
      onExpire()
    }
  }, [isExpired, onExpire])

  const pad = (num: number) => num.toString().padStart(2, '0')

  if (isExpired) {
    return (
      <div className={`text-red-500 font-mono text-xl ${className}`}>
        Expired
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1 font-mono text-xl ${className}`}>
      {showDays && days > 0 && (
        <>
          <TimeUnit value={days} label="days" showLabel={showLabels} />
          <span className="text-gray-500">{separator}</span>
        </>
      )}
      <TimeUnit value={hours} label="hrs" showLabel={showLabels} />
      <span className="text-gray-500">{separator}</span>
      <TimeUnit value={minutes} label="min" showLabel={showLabels} />
      <span className="text-gray-500">{separator}</span>
      <TimeUnit value={seconds} label="sec" showLabel={showLabels} />
    </div>
  )
}

function TimeUnit({ 
  value, 
  label, 
  showLabel 
}: { 
  value: number
  label: string
  showLabel: boolean
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-white tabular-nums">
        {value.toString().padStart(2, '0')}
      </span>
      {showLabel && (
        <span className="text-xs text-gray-500 uppercase">{label}</span>
      )}
    </div>
  )
}
