import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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

    // Optimize: Get users with aggregated waste record stats in one query
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        grade: true,
        classSection: true,
        createdAt: true,
        _count: {
          select: {
            wasteRecords: true
          }
        },
        wasteRecords: {
          select: {
            points: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate stats efficiently
    const usersWithStats = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      grade: user.grade,
      classSection: user.classSection,
      createdAt: user.createdAt.toISOString(),
      totalPoints: user.wasteRecords.reduce((sum, record) => sum + record.points, 0),
      totalRecords: user._count.wasteRecords,
      isActive: user._count.wasteRecords > 0
    }))

    return NextResponse.json(usersWithStats)

  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' },
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

    const { name, email, role, grade, classSection, password } = await request.json()

    // Validate required fields
    if (!name || !email || !role || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'รูปแบบอีเมลไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user data
    const userData = {
      name,
      email,
      pwdHash: hashedPassword,
      role: role as any,
      grade: role === 'STUDENT' && grade ? parseInt(grade) : null,
      classSection: role === 'STUDENT' && classSection ? classSection : null,
    }

    const user = await prisma.user.create({
      data: userData,
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
      message: 'เพิ่มผู้ใช้สำเร็จ',
      user
    })

  } catch (error) {
    console.error('Admin create user error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้' },
      { status: 500 }
    )
  }
} 