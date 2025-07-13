import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Cache waste types for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
let wasteTypesCache: { data: any[], timestamp: number } | null = null

export async function GET() {
  try {
    // Check if we have valid cached data
    if (wasteTypesCache && (Date.now() - wasteTypesCache.timestamp) < CACHE_DURATION) {
      return NextResponse.json(wasteTypesCache.data, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
          'X-Cache': 'HIT'
        }
      })
    }

    // Fetch from database with optimized query
    const wasteTypes = await prisma.wasteType.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        pointFactor: true
      },
      orderBy: {
        id: 'asc'
      }
    })

    // Update cache
    wasteTypesCache = {
      data: wasteTypes,
      timestamp: Date.now()
    }

    return NextResponse.json(wasteTypes, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'X-Cache': 'MISS'
      }
    })
  } catch (error) {
    console.error('Error fetching waste types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waste types' },
      { status: 500 }
    )
  }
} 