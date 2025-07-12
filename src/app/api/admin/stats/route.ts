import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user counts
    const [totalUsers, totalStudents, totalTeachers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } })
    ])

    // Get waste records stats
    const totalWasteRecords = await prisma.wasteRecord.count()
    
    const wasteStats = await prisma.wasteRecord.aggregate({
      _sum: {
        weightG: true,
        points: true
      }
    })

    // Get today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayRecords = await prisma.wasteRecord.count({
      where: {
        recordDt: {
          gte: today
        }
      }
    })

    const todayStats = await prisma.wasteRecord.aggregate({
      where: {
        recordDt: {
          gte: today
        }
      },
      _sum: {
        weightG: true
      }
    })

    return NextResponse.json({
      totalUsers,
      totalStudents,
      totalTeachers,
      totalWasteRecords,
      totalWeight: wasteStats._sum.weightG || 0,
      totalPoints: wasteStats._sum.points || 0,
      todayRecords,
      todayWeight: todayStats._sum.weightG || 0
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
} 