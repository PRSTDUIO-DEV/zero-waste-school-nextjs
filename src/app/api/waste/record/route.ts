import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)
    const { records } = await request.json()

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: 'No records provided' },
        { status: 400 }
      )
    }

    // Fetch waste types to calculate points
    const wasteTypes = await prisma.wasteType.findMany({
      where: {
        id: {
          in: records.map((r: any) => r.typeId)
        }
      }
    })

    // Create waste records with calculated points
    const wasteRecords = records.map((record: any) => {
      const wasteType = wasteTypes.find(t => t.id === record.typeId)
      if (!wasteType) {
        throw new Error(`Invalid waste type: ${record.typeId}`)
      }

      const points = Math.round(record.weightG * Number(wasteType.pointFactor))
      
      return {
        userId,
        typeId: record.typeId,
        weightG: record.weightG,
        points
      }
    })

    // Create all records in a transaction
    const createdRecords = await prisma.$transaction(
      wasteRecords.map(record => 
        prisma.wasteRecord.create({ data: record })
      )
    )

    const totalPoints = createdRecords.reduce((sum, record) => sum + record.points, 0)

    // Check for new badges
    const userTotalPoints = await prisma.wasteRecord.aggregate({
      where: { userId },
      _sum: { points: true }
    })

    const currentPoints = userTotalPoints._sum.points || 0

    // Get badges user doesn't have yet
    const existingBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true }
    })

    const existingBadgeIds = existingBadges.map(b => b.badgeId)

    const newBadges = await prisma.badge.findMany({
      where: {
        thresholdPts: {
          lte: currentPoints
        },
        id: {
          notIn: existingBadgeIds
        }
      }
    })

    // Award new badges
    if (newBadges.length > 0) {
      await prisma.userBadge.createMany({
        data: newBadges.map(badge => ({
          userId,
          badgeId: badge.id
        }))
      })
    }

    return NextResponse.json({
      success: true,
      totalPoints,
      currentPoints,
      newBadges
    })

  } catch (error) {
    console.error('Error recording waste:', error)
    return NextResponse.json(
      { error: 'Failed to record waste' },
      { status: 500 }
    )
  }
} 