'use client'

import { useState, useCallback } from 'react'

interface AddressDisplayProps {
  address: string
  startChars?: number
  endChars?: number
  showCopy?: boolean
  linkToExplorer?: boolean
  explorerUrl?: string
  className?: string
}

export function AddressDisplay({
  address,
  startChars = 6,
  endChars = 4,
  showCopy = true,
  linkToExplorer = true,
  explorerUrl = 'https://basescan.org/address/',
  className = '',
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false)

  const truncated = address.length > startChars + endChars
    ? `${address.slice(0, startChars)}...${address.slice(-endChars)}`
    : address

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [address])

  const content = (
    <span className="font-mono text-sm" title={address}>
      {truncated}
    </span>
  )

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {linkToExplorer ? (
        <a
          href={`${explorerUrl}${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 hover:underline"
        >
          {content}
        </a>
      ) : (
        content
      )}
      
      {showCopy && (
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-white transition-colors p-1"
          title={copied ? 'Copied!' : 'Copy address'}
        >
          {copied ? (
            <svg className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 2a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H8z" />
              <path d="M4 6a2 2 0 012-2h1v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
            </svg>
          )}
        </button>
      )}
    </span>
  )
}

interface TransactionHashProps {
  hash: string
  showCopy?: boolean
  explorerUrl?: string
  className?: string
}

export function TransactionHash({
  hash,
  showCopy = true,
  explorerUrl = 'https://basescan.org/tx/',
  className = '',
}: TransactionHashProps) {
  return (
    <AddressDisplay
      address={hash}
      startChars={10}
      endChars={8}
      showCopy={showCopy}
      linkToExplorer={true}
      explorerUrl={explorerUrl}
      className={className}
    />
  )
}
