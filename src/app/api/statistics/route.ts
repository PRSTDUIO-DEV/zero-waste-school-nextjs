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

    // Get waste by type
    const wasteByTypeData = await prisma.wasteRecord.groupBy({
      by: ['typeId'],
      where: { userId },
      _sum: {
        weightG: true,
        points: true
      }
    })

    // Get waste type details
    const wasteTypes = await prisma.wasteType.findMany()
    const wasteTypeMap = new Map(wasteTypes.map(t => [t.id, t]))

    // Calculate total weight for percentage
    const totalWeight = wasteByTypeData.reduce((sum, record) => sum + (record._sum.weightG || 0), 0)
    const totalPoints = wasteByTypeData.reduce((sum, record) => sum + (record._sum.points || 0), 0)

    // Format waste by type data
    const wasteByType = wasteByTypeData.map(record => {
      const wasteType = wasteTypeMap.get(record.typeId)
      const weight = record._sum.weightG || 0
      return {
        name: wasteType?.name || 'Unknown',
        weight,
        percentage: totalWeight > 0 ? Math.round((weight / totalWeight) * 100) : 0
      }
    })

    // Get daily data for last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const dailyRecords = await prisma.wasteRecord.findMany({
      where: {
        userId,
        recordDt: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        recordDt: 'asc'
      }
    })

    // Group by date
    const dailyMap = new Map<string, { weight: number, points: number }>()
    
    // Initialize all days with 0
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo)
      date.setDate(date.getDate() + i)
      const dateStr = date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
      dailyMap.set(dateStr, { weight: 0, points: 0 })
    }

    // Fill with actual data
    dailyRecords.forEach(record => {
      const dateStr = new Date(record.recordDt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
      const existing = dailyMap.get(dateStr) || { weight: 0, points: 0 }
      dailyMap.set(dateStr, {
        weight: existing.weight + record.weightG,
        points: existing.points + record.points
      })
    })

    const dailyData = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      weight: data.weight,
      points: data.points
    }))

    // Get monthly data for last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const monthlyRecords = await prisma.wasteRecord.findMany({
      where: {
        userId,
        recordDt: {
          gte: sixMonthsAgo
        }
      }
    })

    // Group by month
    const monthlyMap = new Map<string, { weight: number, points: number }>()
    
    monthlyRecords.forEach(record => {
      const monthStr = new Date(record.recordDt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short' })
      const existing = monthlyMap.get(monthStr) || { weight: 0, points: 0 }
      monthlyMap.set(monthStr, {
        weight: existing.weight + record.weightG,
        points: existing.points + record.points
      })
    })

    const monthlyData = Array.from(monthlyMap.entries())
      .sort((a, b) => {
        const dateA = new Date(a[0])
        const dateB = new Date(b[0])
        return dateA.getTime() - dateB.getTime()
      })
      .map(([month, data]) => ({
        month,
        weight: data.weight,
        points: data.points
      }))

    return NextResponse.json({
      wasteByType,
      dailyData,
      monthlyData,
      totalWeight,
      totalPoints
    })

  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
} 