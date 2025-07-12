import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const wasteTypes = await prisma.wasteType.findMany({
      orderBy: {
        id: 'asc'
      }
    })

    return NextResponse.json(wasteTypes)
  } catch (error) {
    console.error('Error fetching waste types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waste types' },
      { status: 500 }
    )
  }
} 