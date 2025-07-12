import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all waste types with their stats
    const wasteTypes = await prisma.wasteType.findMany({
      include: {
        wasteRecords: {
          select: {
            weightG: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    })

    // Format the data
    const wasteTypesData = wasteTypes.map(type => {
      const totalRecords = type.wasteRecords.length
      const totalWeight = type.wasteRecords.reduce((sum, record) => sum + record.weightG, 0)

      return {
        id: type.id,
        name: type.name,
        description: type.description,
        pointFactor: Number(type.pointFactor),
        totalRecords,
        totalWeight
      }
    })

    return NextResponse.json(wasteTypesData)

  } catch (error) {
    console.error('Error fetching waste types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waste types' },
      { status: 500 }
    )
  }
} 