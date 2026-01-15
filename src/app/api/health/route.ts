import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime ? process.uptime() : 'N/A',
  }

  return NextResponse.json(healthCheck)
}
