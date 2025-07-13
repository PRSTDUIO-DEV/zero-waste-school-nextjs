import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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
    const userId = parseInt(params.id)
    const { name, email, role, grade, classSection, password } = await request.json()

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้นี้' },
        { status: 404 }
      )
    }

    // Check if email is already taken by another user
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData = {
      name,
      email,
      role: role as any,
      grade: role === 'STUDENT' && grade ? parseInt(grade) : null,
      classSection: role === 'STUDENT' && classSection ? classSection : null,
      ...(password && { pwdHash: await bcrypt.hash(password, 12) })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        grade: true,
        classSection: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      message: 'อัปเดตผู้ใช้สำเร็จ',
      user: updatedUser
    })

  } catch (error) {
    console.error('Admin update user error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้' },
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
      select: { role: true, id: true }
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const params = await context.params
    const userId = parseInt(params.id)

    // Prevent admin from deleting themselves
    if (currentUser.id === userId) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบบัญชีของตัวเองได้' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้นี้' },
        { status: 404 }
      )
    }

    // Delete user and related records
    await prisma.$transaction(async (tx) => {
      // Delete waste records first
      await tx.wasteRecord.deleteMany({
        where: { userId }
      })

      // Delete user badges
      await tx.userBadge.deleteMany({
        where: { userId }
      })

      // Delete user
      await tx.user.delete({
        where: { id: userId }
      })
    })

    return NextResponse.json({
      message: 'ลบผู้ใช้สำเร็จ'
    })

  } catch (error) {
    console.error('Admin delete user error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบผู้ใช้' },
      { status: 500 }
    )
  }
} 