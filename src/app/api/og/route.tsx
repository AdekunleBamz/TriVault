import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const seals = parseInt(searchParams.get('seals') || '0', 10)
  const address = searchParams.get('address') || ''
  const isChampion = seals >= 3

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#030712',
          backgroundImage: 'linear-gradient(to bottom right, #1e3a8a, #581c87)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <span style={{ fontSize: '64px' }}>🔐</span>
          <span
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            TriVault
          </span>
        </div>

        {/* Seals */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginBottom: '24px',
          }}
        >
          {[1, 2, 3].map((seal) => (
            <div
              key={seal}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                background: seals >= seal
                  ? 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)'
                  : '#374151',
              }}
            >
              {seal === 1 ? '💵' : seal === 2 ? '💎' : '🌉'}
            </div>
          ))}
        </div>

        {/* Status */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            {isChampion ? '🏆 Champion!' : `${seals}/3 Seals Collected`}
          </span>
          {address && (
            <span
              style={{
                fontSize: '20px',
                color: '#9ca3af',
              }}
            >
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
