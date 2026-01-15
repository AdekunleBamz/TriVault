'use client'

import { Accordion } from './ui/Accordion'
import Link from 'next/link'

const faqItems = [
  {
    id: 'what-is-trivault',
    title: 'What is TriVault?',
    content: (
      <p>
        TriVault is a fun on-chain seal collection game built on Base blockchain. 
        You interact with 3 different smart contracts (vaults) to collect seals. 
        Complete all 3 to become a TriVault Champion!
      </p>
    ),
  },
  {
    id: 'how-much-cost',
    title: 'How much does it cost to collect a seal?',
    content: (
      <div className="space-y-2">
        <p>
          Each seal costs <strong className="text-white">0.00001 ETH</strong> (about $0.003 USD).
          This tiny fee goes to the contract creator to support development.
        </p>
        <p>
          Plus you&apos;ll need a small amount of ETH for gas fees on Base (usually less than $0.01).
        </p>
      </div>
    ),
  },
  {
    id: 'which-wallet',
    title: 'Which wallets are supported?',
    content: (
      <div className="space-y-2">
        <p>TriVault supports multiple wallet options:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>MetaMask and other injected wallets</li>
          <li>Coinbase Wallet</li>
          <li>WalletConnect compatible wallets</li>
          <li>Farcaster native wallet (when using as mini-app)</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'what-is-seal',
    title: 'What is a seal?',
    content: (
      <p>
        A seal is a proof of interaction with one of the three vaults. 
        When you collect a seal, it&apos;s recorded on-chain forever. 
        You can only collect each seal once per wallet address.
      </p>
    ),
  },
  {
    id: 'how-to-farcaster',
    title: 'How do I use TriVault in Farcaster?',
    content: (
      <div className="space-y-2">
        <p>
          TriVault is a Farcaster mini-app! When you open it within Warpcast or other 
          Farcaster clients, it will automatically connect to your Farcaster wallet.
        </p>
        <p>
          You can also share your progress directly to your Farcaster feed.
        </p>
      </div>
    ),
  },
  {
    id: 'what-is-champion',
    title: 'What does it mean to be a Champion?',
    content: (
      <p>
        When you collect all 3 seals (Stability, Diamond, and Bridge), you become a 
        TriVault Champion! Champions are displayed on the{' '}
        <Link href="/leaderboard" className="text-blue-400 hover:underline">
          leaderboard
        </Link>{' '}
        and earn bragging rights in the community.
      </p>
    ),
  },
  {
    id: 'can-i-sell',
    title: 'Can I sell or transfer my seals?',
    content: (
      <p>
        Seals are non-transferable and tied to your wallet address. 
        They represent your personal achievement and cannot be sold or transferred.
        This keeps the leaderboard fair and authentic.
      </p>
    ),
  },
  {
    id: 'what-blockchain',
    title: 'What blockchain is TriVault on?',
    content: (
      <div className="space-y-2">
        <p>
          TriVault is deployed on <strong className="text-white">Base</strong>, an Ethereum Layer 2 
          blockchain built by Coinbase. Base offers fast transactions and very low fees.
        </p>
        <p>
          To use TriVault, you&apos;ll need ETH on Base. You can bridge ETH from Ethereum 
          mainnet or purchase directly on Base.
        </p>
      </div>
    ),
  },
  {
    id: 'is-it-safe',
    title: 'Is TriVault safe to use?',
    content: (
      <div className="space-y-2">
        <p>
          Yes! The TriVault smart contract is simple and follows best practices:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>No approval required - you only send the exact fee amount</li>
          <li>Open source code - anyone can verify the contract</li>
          <li>No external dependencies that could be compromised</li>
          <li>Simple logic with minimal attack surface</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'what-if-tx-fails',
    title: 'What if my transaction fails?',
    content: (
      <div className="space-y-2">
        <p>
          If your transaction fails, your ETH will not be deducted (you only pay the gas fee).
          Common reasons for failure:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Insufficient ETH for the fee + gas</li>
          <li>You already collected that seal</li>
          <li>Network congestion (try again later)</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'where-contract',
    title: 'Where can I view the smart contract?',
    content: (
      <p>
        You can view the verified smart contract on BaseScan:{' '}
        <a
          href="https://basescan.org/address/0xC3319C80FF4fC435ca8827C35A013E64B762ff48"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline break-all"
        >
          0xC3319C80FF4fC435ca8827C35A013E64B762ff48
        </a>
      </p>
    ),
  },
  {
    id: 'future-plans',
    title: 'Are there plans for future features?',
    content: (
      <div className="space-y-2">
        <p>Yes! We&apos;re working on exciting features:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Achievement badges and NFTs for champions</li>
          <li>Referral system with rewards</li>
          <li>Seasonal challenges and events</li>
          <li>More vaults and seal types</li>
          <li>Community governance</li>
        </ul>
      </div>
    ),
  },
]

export function FAQ() {
  return (
    <Accordion items={faqItems} allowMultiple />
  )
}
