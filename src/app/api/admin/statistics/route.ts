import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get current date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Optimize: Execute all queries in parallel
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalWasteRecords,
      totalWeightResult,
      totalPointsResult,
      activeUsers,
      newUsersThisMonth,
      recordsThisMonth
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.wasteRecord.count(),
      prisma.wasteRecord.aggregate({
        _sum: { weightG: true }
      }),
      prisma.wasteRecord.aggregate({
        _sum: { points: true }
      }),
      prisma.user.count({
        where: {
          wasteRecords: {
            some: {}
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),
      prisma.wasteRecord.count({
        where: {
          recordDt: {
            gte: startOfMonth
          }
        }
      })
    ])

    return NextResponse.json({
      totalUsers,
      totalStudents,
      totalTeachers,
      totalWasteRecords,
      totalWasteWeight: totalWeightResult._sum.weightG || 0,
      totalPointsAwarded: totalPointsResult._sum.points || 0,
      activeUsers,
      newUsersThisMonth,
      recordsThisMonth
    })

  } catch (error) {
    console.error('Admin statistics API error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' },
      { status: 500 }
    )
  }
} 