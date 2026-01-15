import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

interface LeaderboardEntry {
  rank: number;
  address: string;
  sealCount: number;
  lastActive: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  try {
    // Mock data - in production would query blockchain/database
    const mockLeaderboard: LeaderboardEntry[] = Array.from({ length: limit }, (_, i) => ({
      rank: offset + i + 1,
      address: `0x${(Math.random().toString(16) + '000000000000000000000000000000000000000000').slice(2, 42)}`,
      sealCount: Math.max(1, Math.floor(Math.random() * 100) - offset - i),
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    return NextResponse.json({
      entries: mockLeaderboard,
      total: 523,
      limit,
      offset,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
