import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    // Get personal statistics
    const personalRecords = await prisma.wasteRecord.findMany({
      where: {
        userId: user.id,
        recordDt: {
          gte: startDate
        }
      },
      select: {
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

    const personalStats = {
      totalRecords: personalRecords.length,
      totalWeight: personalRecords.reduce((sum, record) => sum + record.weightG, 0),
      totalPoints: personalRecords.reduce((sum, record) => sum + record.points, 0),
      recycleWeight: personalRecords.filter(r => r.wasteType.name.includes('รีไซเคิล') || r.wasteType.name.includes('Recycle')).reduce((sum, record) => sum + record.weightG, 0),
      generalWeight: personalRecords.filter(r => !r.wasteType.name.includes('รีไซเคิล') && !r.wasteType.name.includes('Recycle')).reduce((sum, record) => sum + record.weightG, 0),
      averagePerDay: personalRecords.length > 0 ? 
        personalRecords.reduce((sum, record) => sum + record.weightG, 0) / Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))) : 0,
      rank: 1,
      percentile: 10
    }

    // Get user rank - simplified approach
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        wasteRecords: {
          where: {
            recordDt: {
              gte: startDate
            }
          },
          select: {
            points: true,
            weightG: true
          }
        }
      }
    })

    const userRanking = allUsers
      .map(u => ({
        id: u.id,
        name: u.name,
        points: u.wasteRecords.reduce((sum, record) => sum + record.points, 0),
        weight: u.wasteRecords.reduce((sum, record) => sum + record.weightG, 0)
      }))
      .sort((a, b) => b.points - a.points)

    const userRankIndex = userRanking.findIndex(u => u.id === user.id)
    personalStats.rank = userRankIndex >= 0 ? userRankIndex + 1 : 1
    personalStats.percentile = userRanking.length > 0 ? Math.round((userRankIndex / userRanking.length) * 100) : 0

    // Get school statistics
    const schoolRecords = await prisma.wasteRecord.findMany({
      where: {
        recordDt: {
          gte: startDate
        }
      },
      select: {
        weightG: true,
        points: true,
        user: {
          select: {
            name: true
          }
        }
      }
    })

    const totalUsers = await prisma.user.count()

    const schoolStats = {
      totalUsers,
      totalRecords: schoolRecords.length,
      totalWeight: schoolRecords.reduce((sum, record) => sum + record.weightG, 0),
      totalPoints: schoolRecords.reduce((sum, record) => sum + record.points, 0),
      topPerformers: userRanking.slice(0, 5)
    }

         // Generate monthly data for the last 6 months
     const monthlyData = []
     for (let i = 5; i >= 0; i--) {
       const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
       const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
       
       const monthRecords = await prisma.wasteRecord.findMany({
         where: {
           userId: user.id,
           recordDt: {
             gte: monthStart,
             lte: monthEnd
           }
         },
         select: {
           weightG: true,
           points: true,
           wasteType: {
             select: {
               name: true
             }
           }
         }
       })

       monthlyData.push({
         month: monthStart.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }),
         recycleWeight: monthRecords.filter(r => r.wasteType.name.includes('รีไซเคิล') || r.wasteType.name.includes('Recycle')).reduce((sum, record) => sum + record.weightG, 0),
         generalWeight: monthRecords.filter(r => !r.wasteType.name.includes('รีไซเคิล') && !r.wasteType.name.includes('Recycle')).reduce((sum, record) => sum + record.weightG, 0),
         points: monthRecords.reduce((sum, record) => sum + record.points, 0)
       })
     }

     // Generate weekly data for the last 7 days
     const weeklyData = []
     for (let i = 6; i >= 0; i--) {
       const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
       dayStart.setHours(0, 0, 0, 0)
       const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
       
       const dayRecords = await prisma.wasteRecord.findMany({
         where: {
           userId: user.id,
           recordDt: {
             gte: dayStart,
             lt: dayEnd
           }
         },
         select: {
           weightG: true,
           points: true
         }
       })

       weeklyData.push({
         day: dayStart.toLocaleDateString('th-TH', { weekday: 'short' }),
         weight: dayRecords.reduce((sum, record) => sum + record.weightG, 0),
         points: dayRecords.reduce((sum, record) => sum + record.points, 0)
       })
     }

    // Category breakdown
    const categoryBreakdown = [
      {
        category: 'ขยะรีไซเคิล',
        weight: personalStats.recycleWeight,
        percentage: personalStats.totalWeight > 0 ? (personalStats.recycleWeight / personalStats.totalWeight) * 100 : 0
      },
      {
        category: 'ขยะทั่วไป',
        weight: personalStats.generalWeight,
        percentage: personalStats.totalWeight > 0 ? (personalStats.generalWeight / personalStats.totalWeight) * 100 : 0
      }
    ]

    return NextResponse.json({
      personalStats,
      schoolStats,
      monthlyData,
      weeklyData,
      categoryBreakdown
    })

  } catch (error) {
    console.error('Statistics API error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' },
      { status: 500 }
    )
  }
} 