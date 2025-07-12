import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Get user's waste records grouped by type
    const wasteByType = await prisma.wasteRecord.groupBy({
      by: ['typeId'],
      where: { userId },
      _sum: {
        weightG: true,
        points: true
      }
    })

    // Get waste type details
    const wasteTypes = await prisma.wasteType.findMany()
    const wasteTypeMap = new Map(wasteTypes.map(t => [t.id, t.name]))

    // Calculate stats by category
    let recycleWeight = 0
    let generalWeight = 0
    let totalPoints = 0

    wasteByType.forEach(record => {
      const typeName = wasteTypeMap.get(record.typeId) || ''
      const weight = record._sum.weightG || 0
      const points = record._sum.points || 0

      totalPoints += points

      // Categorize waste (you can adjust this logic based on your waste types)
      if (typeName.includes('พลาสติก') || typeName.includes('กระดาษ') || 
          typeName.includes('แก้ว') || typeName.includes('โลหะ')) {
        recycleWeight += weight
      } else {
        generalWeight += weight
      }
    })

    // Get user's rank
    const allUserPoints = await prisma.wasteRecord.groupBy({
      by: ['userId'],
      _sum: {
        points: true
      },
      orderBy: {
        _sum: {
          points: 'desc'
        }
      }
    })

    const userRank = allUserPoints.findIndex(u => u.userId === userId) + 1

    // Get recent activities
    const recentActivities = await prisma.wasteRecord.findMany({
      where: { userId },
      orderBy: { recordDt: 'desc' },
      take: 5,
      include: {
        wasteType: true
      }
    })

    // Get user's badges
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true
      }
    })

    return NextResponse.json({
      stats: {
        recycleWeight,
        generalWeight,
        totalPoints,
        rank: userRank || '-'
      },
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        typeName: activity.wasteType.name,
        weightG: activity.weightG,
        points: activity.points,
        recordDt: activity.recordDt
      })),
      badges: userBadges.map(ub => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        awardedDt: ub.awardedDt
      }))
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
} 