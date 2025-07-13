import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const params = await context.params
    const wasteTypeId = parseInt(params.id)
    const { name, description, pointsPerG } = await request.json()

    // Validate required fields
    if (!name || pointsPerG === undefined || pointsPerG < 0) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง' },
        { status: 400 }
      )
    }

    // Check if waste type exists
    const existingWasteType = await prisma.wasteType.findUnique({
      where: { id: wasteTypeId }
    })

    if (!existingWasteType) {
      return NextResponse.json(
        { error: 'ไม่พบประเภทขยะนี้' },
        { status: 404 }
      )
    }

    // Check if name is already taken by another waste type
    if (name !== existingWasteType.name) {
      const nameExists = await prisma.wasteType.findFirst({
        where: { 
          name,
          id: { not: wasteTypeId }
        }
      })

      if (nameExists) {
        return NextResponse.json(
          { error: 'ชื่อประเภทขยะนี้ถูกใช้งานแล้ว' },
          { status: 400 }
        )
      }
    }

    const updatedWasteType = await prisma.wasteType.update({
      where: { id: wasteTypeId },
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
      message: 'อัปเดตประเภทขยะสำเร็จ',
      wasteType: updatedWasteType
    })

  } catch (error) {
    console.error('Admin update waste type error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตประเภทขยะ' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const params = await context.params
    const wasteTypeId = parseInt(params.id)

    // Check if waste type exists
    const existingWasteType = await prisma.wasteType.findUnique({
      where: { id: wasteTypeId }
    })

    if (!existingWasteType) {
      return NextResponse.json(
        { error: 'ไม่พบประเภทขยะนี้' },
        { status: 404 }
      )
    }

    // Check if waste type is being used in records
    const recordCount = await prisma.wasteRecord.count({
      where: { typeId: wasteTypeId }
    })

    if (recordCount > 0) {
      return NextResponse.json(
        { error: `ไม่สามารถลบประเภทขยะนี้ได้ เนื่องจากมีการใช้งานอยู่ ${recordCount} รายการ` },
        { status: 400 }
      )
    }

    await prisma.wasteType.delete({
      where: { id: wasteTypeId }
    })

    return NextResponse.json({
      message: 'ลบประเภทขยะสำเร็จ'
    })

  } catch (error) {
    console.error('Admin delete waste type error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบประเภทขยะ' },
      { status: 500 }
    )
  }
} 