'use client';

import React from 'react';

interface CounterProps {
  value: number;
  label?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  animate?: boolean;
  className?: string;
}

export function Counter({
  value,
  label,
  prefix,
  suffix,
  decimals = 0,
  animate = true,
  className = '',
}: CounterProps) {
  const [displayValue, setDisplayValue] = React.useState(animate ? 0 : value);

  React.useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      return;
    }

    const duration = 1000;
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, animate]);

  const formattedValue = React.useMemo(() => {
    const rounded = decimals > 0 ? displayValue.toFixed(decimals) : Math.floor(displayValue);
    return new Intl.NumberFormat().format(Number(rounded));
  }, [displayValue, decimals]);

  return (
    <div className={className}>
      <div className="text-3xl font-bold text-white">
        {prefix}
        {formattedValue}
        {suffix}
      </div>
      {label && <div className="text-sm text-gray-400 mt-1">{label}</div>}
    </div>
  );
}

interface StatCounterProps {
  value: number;
  label: string;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCounter({
  value,
  label,
  change,
  icon,
  className = '',
}: StatCounterProps) {
  return (
    <div className={`bg-gray-800/50 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <Counter value={value} className="inline" />
        {change !== undefined && (
          <span
            className={`text-sm font-medium ${
              change >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
    </div>
  );
}

interface CountdownProps {
  targetDate: Date;
  onComplete?: () => void;
  className?: string;
}

export function Countdown({ targetDate, onComplete, className = '' }: CountdownProps) {
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        onComplete?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const units = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ];

  return (
    <div className={`flex gap-4 ${className}`}>
      {units.map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="bg-gray-800 rounded-lg px-4 py-2 min-w-[60px]">
            <span className="text-2xl font-bold text-white">
              {String(unit.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
