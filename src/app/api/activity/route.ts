import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

interface ActivityItem {
  id: string;
  type: 'collect' | 'milestone' | 'achievement';
  address: string;
  vaultId?: number;
  timestamp: string;
  message: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

  try {
    const vaultNames = ['Ruby', 'Emerald', 'Sapphire'];
    
    // Mock data - in production would query blockchain events
    const mockActivity: ActivityItem[] = Array.from({ length: limit }, (_, i) => {
      const vaultId = Math.floor(Math.random() * 3);
      const type = Math.random() > 0.2 ? 'collect' : Math.random() > 0.5 ? 'milestone' : 'achievement';
      const address = `0x${(Math.random().toString(16) + '000000000000000000000000000000000000000000').slice(2, 42)}`;
      
      let message = '';
      if (type === 'collect') {
        message = `collected a seal from ${vaultNames[vaultId]} vault`;
      } else if (type === 'milestone') {
        message = `reached ${Math.floor(Math.random() * 50) * 10} total seals`;
      } else {
        message = `unlocked a new achievement`;
      }

      return {
        id: `activity-${Date.now()}-${i}`,
        type,
        address,
        vaultId: type === 'collect' ? vaultId : undefined,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        message,
      };
    });

    return NextResponse.json({
      activity: mockActivity,
      total: 1000,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15',
      },
    });
  } catch (error) {
    console.error('Failed to fetch activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
