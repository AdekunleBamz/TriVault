import { NextResponse } from 'next/server';

export const runtime = 'edge';

interface StatsResponse {
  totalSealsCollected: number;
  uniqueCollectors: number;
  vaultBreakdown: {
    ruby: number;
    emerald: number;
    sapphire: number;
  };
  recentActivity: number;
  lastUpdated: string;
}

export async function GET() {
  try {
    // In a real implementation, this would query the blockchain or a database
    const stats: StatsResponse = {
      totalSealsCollected: 1247,
      uniqueCollectors: 523,
      vaultBreakdown: {
        ruby: 412,
        emerald: 398,
        sapphire: 437,
      },
      recentActivity: 23,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
