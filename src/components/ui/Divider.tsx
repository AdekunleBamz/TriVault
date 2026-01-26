import { ReactNode } from 'react'

interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Divider({ orientation = 'horizontal', className = '' }: DividerProps) {
  if (orientation === 'vertical') {
    return <div className={`w-px h-full bg-gray-700 ${className}`} role="separator" aria-orientation="vertical" />
  }

  return <hr className={`border-0 h-px bg-gray-700 my-4 ${className}`} role="separator" aria-orientation="horizontal" />
}

interface DividerWithTextProps {
  children: ReactNode
  className?: string
}

export function DividerWithText({ children, className = '' }: DividerWithTextProps) {
  return (
    <div className={`flex items-center gap-4 my-6 ${className}`} role="separator">
      <div className="flex-1 h-px bg-gray-700" />
      <span className="text-gray-500 text-sm font-medium">{children}</span>
      <div className="flex-1 h-px bg-gray-700" />
    </div>
  )
}

interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const spacerSizes = {
  xs: 'h-2',
  sm: 'h-4',
  md: 'h-8',
  lg: 'h-12',
  xl: 'h-16',
}

export function Spacer({ size = 'md', className = '' }: SpacerProps) {
  return <div className={`${spacerSizes[size]} ${className}`} aria-hidden="true" />
}
