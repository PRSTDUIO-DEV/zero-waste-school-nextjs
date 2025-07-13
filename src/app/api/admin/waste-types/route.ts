import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    // Get all waste types
    const wasteTypes = await prisma.wasteType.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        pointFactor: true
      },
      orderBy: {
        id: 'asc'
      }
    })

    // Get record counts for each waste type
    const wasteTypesWithStats = await Promise.all(
      wasteTypes.map(async (type) => {
        const recordCount = await prisma.wasteRecord.count({
          where: { typeId: type.id }
        })

        return {
          id: type.id,
          name: type.name,
          description: type.description,
          pointsPerG: Number(type.pointFactor),
          category: type.name.includes('รีไซเคิล') || type.name.includes('Recycle') ? 'รีไซเคิล' :
                    type.name.includes('อินทรีย์') || type.name.includes('Organic') ? 'อินทรีย์' :
                    type.name.includes('อันตราย') || type.name.includes('Hazard') ? 'อันตราย' : 'ทั่วไป',
          isActive: true,
          totalRecords: recordCount
        }
      })
    )

    return NextResponse.json(wasteTypesWithStats)

  } catch (error) {
    console.error('Admin waste types API error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทขยะ' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { name, description, pointsPerG } = await request.json()

    // Validate required fields
    if (!name || pointsPerG === undefined || pointsPerG < 0) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง' },
        { status: 400 }
      )
    }

    // Check if waste type already exists
    const existingWasteType = await prisma.wasteType.findFirst({
      where: { name }
    })

    if (existingWasteType) {
      return NextResponse.json(
        { error: 'ประเภทขยะนี้มีอยู่แล้ว' },
        { status: 400 }
      )
    }

    const wasteType = await prisma.wasteType.create({
      data: {
        name,
        description: description || null,
        pointFactor: pointsPerG
      },
      select: {
        id: true,
        name: true,
        description: true,
        pointFactor: true
      }
    })

    return NextResponse.json({
      message: 'เพิ่มประเภทขยะสำเร็จ',
      wasteType
    })

  } catch (error) {
    console.error('Admin create waste type error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเพิ่มประเภทขยะ' },
      { status: 500 }
    )
  }
} 