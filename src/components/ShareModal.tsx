'use client'

import { useState } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { useToast } from './ui/ToastProvider'
import { useClipboard } from '@/hooks'
import { generateShareURL, generateTwitterShareURL, generateWarpcastShareURL } from '@/lib/utils'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  sealsCollected: number
  address?: string
}

export function ShareModal({ isOpen, onClose, sealsCollected, address }: ShareModalProps) {
  const { success } = useToast()
  const { copy } = useClipboard()

  const shareUrl = generateShareURL('/')
  
  const getShareText = () => {
    if (sealsCollected === 3) {
      return `🏆 I just became a TriVault Champion! Collected all 3 seals on Base.\n\nCan you beat my time? 👀`
    }
    return `🔐 I just collected ${sealsCollected}/3 seals on TriVault!\n\nJoin me and start collecting on Base ⛓️`
  }

  const handleCopyLink = async () => {
    await copy(shareUrl)
    success('Link copied!', 'Share it with your friends')
  }

  const handleShareTwitter = () => {
    const url = generateTwitterShareURL(getShareText(), shareUrl)
    window.open(url, '_blank', 'width=550,height=420')
  }

  const handleShareWarpcast = () => {
    const url = generateWarpcastShareURL(`${getShareText()}\n\n${shareUrl}`)
    window.open(url, '_blank', 'width=550,height=420')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Your Progress" size="sm">
      <div className="space-y-6">
        {/* Preview */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">🔐</span>
            <div>
              <p className="font-bold text-white">TriVault</p>
              <p className="text-sm text-gray-400">Seal Collection</p>
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            {[1, 2, 3].map((seal) => (
              <div
                key={seal}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                  sealsCollected >= seal
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                    : 'bg-gray-700'
                }`}
              >
                {seal === 1 ? '💵' : seal === 2 ? '💎' : '🌉'}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-300">
            {sealsCollected === 3
              ? '🏆 Champion - All seals collected!'
              : `${sealsCollected}/3 seals collected`}
          </p>
        </div>

        {/* Share Options */}
        <div className="space-y-3">
          <Button
            onClick={handleShareWarpcast}
            fullWidth
            className="bg-purple-600 hover:bg-purple-700"
            leftIcon={<span>📡</span>}
          >
            Share on Farcaster
          </Button>
          
          <Button
            onClick={handleShareTwitter}
            fullWidth
            className="bg-black hover:bg-gray-900"
            leftIcon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            }
          >
            Share on X (Twitter)
          </Button>
          
          <Button
            onClick={handleCopyLink}
            variant="outline"
            fullWidth
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
          >
            Copy Link
          </Button>
        </div>
      </div>
    </Modal>
  )
}
