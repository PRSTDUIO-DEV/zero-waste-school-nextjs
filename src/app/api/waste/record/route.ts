import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RecordInput {
  typeId: number
  weightG: number
  description?: string
}

export async function POST(request: Request) {
  try {
    console.log('=== Waste Record API Called ===')
    
    const session = await getServerSession(authOptions)
    console.log('Session:', session ? 'Found' : 'Not found')
    
    if (!session || !session.user) {
      console.log('No session or user found')
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)
    console.log('User ID:', userId)
    
    // Validate user ID
    if (isNaN(userId) || userId <= 0) {
      console.log('Invalid user ID:', userId)
      return NextResponse.json(
        { error: 'ข้อมูลผู้ใช้ไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    let requestData
    try {
      requestData = await request.json()
      console.log('Request data:', requestData)
    } catch (error) {
      console.log('Error parsing JSON:', error)
      return NextResponse.json(
        { error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const { records } = requestData
    console.log('Records:', records)

    // Validate records array
    if (!records || !Array.isArray(records) || records.length === 0) {
      console.log('Invalid records array')
      return NextResponse.json(
        { error: 'กรุณาระบุข้อมูลการบันทึกขยะ' },
        { status: 400 }
      )
    }

    // Validate each record
    for (const record of records) {
      if (!record.typeId || typeof record.typeId !== 'number' || record.typeId <= 0) {
        return NextResponse.json(
          { error: 'กรุณาเลือกประเภทขยะที่ถูกต้อง' },
          { status: 400 }
        )
      }
      
      if (!record.weightG || typeof record.weightG !== 'number' || record.weightG <= 0) {
        return NextResponse.json(
          { error: 'กรุณาระบุน้ำหนักที่ถูกต้อง (มากกว่า 0)' },
          { status: 400 }
        )
      }

      if (record.weightG > 100000) { // 100kg limit
        return NextResponse.json(
          { error: 'น้ำหนักต้องไม่เกิน 100 กิโลกรัม' },
          { status: 400 }
        )
      }
    }

    // Check daily limit (optional)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayRecords = await prisma.wasteRecord.count({
      where: {
        userId,
        recordDt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    if (todayRecords >= 50) { // Daily limit
      return NextResponse.json(
        { error: 'คุณได้บันทึกขยะครบจำนวนที่กำหนดแล้วในวันนี้' },
        { status: 400 }
      )
    }

    // Fetch waste types to calculate points
    const wasteTypeIds = records.map((r: RecordInput) => r.typeId)
    console.log('Waste type IDs:', wasteTypeIds)
    
    const wasteTypes = await prisma.wasteType.findMany({
      where: {
        id: {
          in: wasteTypeIds
        }
      },
      select: {
        id: true,
        name: true,
        pointFactor: true
      }
    })
    console.log('Found waste types:', wasteTypes)

    // Validate all waste types exist
    const foundIds = wasteTypes.map(t => t.id)
    const missingIds = wasteTypeIds.filter(id => !foundIds.includes(id))
    
    if (missingIds.length > 0) {
      console.log('Missing waste type IDs:', missingIds)
      return NextResponse.json(
        { error: `ไม่พบประเภทขยะที่ระบุ: ${missingIds.join(', ')}` },
        { status: 400 }
      )
    }

    // Create waste records with calculated points
    const wasteRecords = records.map((record: RecordInput) => {
      const wasteType = wasteTypes.find(t => t.id === record.typeId)!
      const points = Math.round(record.weightG * Number(wasteType.pointFactor))
      
      return {
        userId,
        typeId: record.typeId,
        weightG: record.weightG,
        points,
        description: record.description || null
      }
    })
    console.log('Prepared waste records:', wasteRecords)

    // Create all records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdRecords = await Promise.all(
        wasteRecords.map(record => 
          tx.wasteRecord.create({ 
            data: record,
            select: {
              id: true,
              points: true,
              wasteType: {
                select: {
                  name: true
                }
              }
            }
          })
        )
      )

      return createdRecords
    })

    const totalPoints = result.reduce((sum, record) => sum + record.points, 0)

    // Check for new badges (optional - if badge system exists)
    let newBadges: any[] = []
    let currentPoints = 0
    
    try {
      const userTotalPoints = await prisma.wasteRecord.aggregate({
        where: { userId },
        _sum: { points: true }
      })

      currentPoints = userTotalPoints._sum.points || 0

      // Check if badge tables exist by trying to query them
      try {
        // Get badges user doesn't have yet
        const existingBadges = await prisma.userBadge.findMany({
          where: { userId },
          select: { badgeId: true }
        })

        const existingBadgeIds = existingBadges.map(b => b.badgeId)

        const availableBadges = await prisma.badge.findMany({
          where: {
            thresholdPts: {
              lte: currentPoints
            },
            id: {
              notIn: existingBadgeIds
            }
          },
          select: {
            id: true,
            name: true,
            description: true
          }
        })

        // Award new badges
        if (availableBadges.length > 0) {
          await prisma.userBadge.createMany({
            data: availableBadges.map(badge => ({
              userId,
              badgeId: badge.id
            }))
          })
          
          newBadges = availableBadges.map(badge => ({
            name: badge.name,
            description: badge.description
          }))
        }
      } catch (badgeError) {
        // Badge system not implemented yet - skip badge logic
        console.log('Badge system not available:', badgeError)
      }
    } catch (pointsError) {
      console.error('Error calculating points:', pointsError)
    }

    return NextResponse.json({
      success: true,
      message: 'บันทึกขยะสำเร็จ',
      totalPoints,
      currentPoints,
      recordsCreated: result.length,
      newBadges
    })

  } catch (error) {
    console.error('Error recording waste:', error)
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'ข้อมูลซ้ำ กรุณาตรวจสอบอีกครั้ง' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    )
  }
} 