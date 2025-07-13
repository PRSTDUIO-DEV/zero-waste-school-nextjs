import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)

    // Optimize: Get all data in parallel using Promise.all
    const [wasteByType, allUserPoints, recentActivities] = await Promise.all([
      // Get user's waste records with type info in one query
      prisma.wasteRecord.findMany({
        where: { userId },
        select: {
          weightG: true,
          points: true,
          wasteType: {
            select: {
              name: true
            }
          }
        }
      }),
      
      // Get all users' points for ranking
      prisma.wasteRecord.groupBy({
        by: ['userId'],
        _sum: {
          points: true
        },
        orderBy: {
          _sum: {
            points: 'desc'
          }
        }
      }),
      
      // Get recent activities with type info
      prisma.wasteRecord.findMany({
        where: { userId },
        orderBy: { recordDt: 'desc' },
        take: 5,
        select: {
          id: true,
          weightG: true,
          points: true,
          recordDt: true,
          wasteType: {
            select: {
              name: true
            }
          }
        }
      })
    ])

    // Calculate stats efficiently
    let recycleWeight = 0
    let generalWeight = 0
    let totalPoints = 0

    wasteByType.forEach(record => {
      const typeName = record.wasteType.name
      const weight = record.weightG || 0
      const points = record.points || 0

      totalPoints += points

      // Categorize waste efficiently
      if (typeName.includes('พลาสติก') || typeName.includes('กระดาษ') || 
          typeName.includes('แก้ว') || typeName.includes('โลหะ') || 
          typeName.includes('รีไซเคิล')) {
        recycleWeight += weight
      } else {
        generalWeight += weight
      }
    })

    // Calculate user rank
    const userRank = allUserPoints.findIndex(u => u.userId === userId) + 1

    // Format recent activities
    const formattedActivities = recentActivities.map(activity => ({
      id: activity.id,
      type: activity.wasteType.name.includes('พลาสติก') || 
            activity.wasteType.name.includes('กระดาษ') || 
            activity.wasteType.name.includes('แก้ว') || 
            activity.wasteType.name.includes('โลหะ') ||
            activity.wasteType.name.includes('รีไซเคิล') ? 'RECYCLABLE' : 'GENERAL',
      weight: activity.weightG || 0,
      points: activity.points || 0,
      createdAt: activity.recordDt.toISOString()
    }))

    // Return data in the format expected by dashboard component
    return NextResponse.json({
      recycleWeight: recycleWeight || 0,
      generalWeight: generalWeight || 0,
      totalPoints: totalPoints || 0,
      rank: userRank || 0,
      userRank: userRank || 0,
      recentActivities: formattedActivities
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({
      recycleWeight: 0,
      generalWeight: 0,
      totalPoints: 0,
      rank: 0,
      userRank: 0,
      recentActivities: []
    })
  }
} 