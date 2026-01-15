'use client'

import { ReactNode, useState } from 'react'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
  badge?: string | number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline'
  className?: string
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  className = '',
}: TabsProps) {
  const baseClasses = 'flex items-center gap-2 px-4 py-2 font-medium transition-all duration-200'
  
  const variantClasses = {
    default: {
      container: 'bg-gray-800 rounded-lg p-1',
      tab: 'rounded-md text-gray-400 hover:text-white',
      active: 'bg-gray-700 text-white',
    },
    pills: {
      container: 'flex gap-2',
      tab: 'rounded-full text-gray-400 hover:text-white hover:bg-gray-800',
      active: 'bg-blue-600 text-white',
    },
    underline: {
      container: 'border-b border-gray-800 flex gap-4',
      tab: 'border-b-2 border-transparent text-gray-400 hover:text-white pb-3 -mb-[1px]',
      active: 'border-blue-500 text-white',
    },
  }

  const styles = variantClasses[variant]

  return (
    <div className={`${styles.container} ${className}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            ${baseClasses}
            ${styles.tab}
            ${activeTab === tab.id ? styles.active : ''}
          `}
        >
          {tab.icon && <span className="text-lg">{tab.icon}</span>}
          {tab.label}
          {tab.badge !== undefined && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-700">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

interface TabPanelProps {
  id: string
  activeTab: string
  children: ReactNode
  className?: string
}

export function TabPanel({ id, activeTab, children, className = '' }: TabPanelProps) {
  if (id !== activeTab) return null

  return (
    <div role="tabpanel" aria-labelledby={id} className={className}>
      {children}
    </div>
  )
}

// Hook for easy tab management
export function useTabs(defaultTab: string) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  return { activeTab, setActiveTab }
}
