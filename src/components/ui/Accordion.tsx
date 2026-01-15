'use client'

import { useState, ReactNode } from 'react'

interface AccordionItem {
  id: string
  title: string
  content: ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  allowMultiple?: boolean
  className?: string
}

export function Accordion({ items, allowMultiple = false, className = '' }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev)
      
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        if (!allowMultiple) {
          newSet.clear()
        }
        newSet.add(id)
      }
      
      return newSet
    })
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <AccordionPanel
          key={item.id}
          item={item}
          isOpen={openItems.has(item.id)}
          onToggle={() => toggleItem(item.id)}
        />
      ))}
    </div>
  )
}

interface AccordionPanelProps {
  item: AccordionItem
  isOpen: boolean
  onToggle: () => void
}

function AccordionPanel({ item, isOpen, onToggle }: AccordionPanelProps) {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${item.id}`}
      >
        <span className="font-medium text-white pr-4">{item.title}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div
        id={`accordion-content-${item.id}`}
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="px-5 pb-4 text-gray-400">
          {item.content}
        </div>
      </div>
    </div>
  )
}
