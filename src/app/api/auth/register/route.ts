import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { name, email, password, role, grade, classSection } = await request.json()

    // Validate required fields
    if (!name || !email || !password || !role) {
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

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' },
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

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        pwdHash: hashedPassword,
        role: role as 'STUDENT' | 'TEACHER' | 'ADMIN',
        grade: role === 'STUDENT' ? grade : null,
        classSection: role === 'STUDENT' ? classSection : null,
      }
    })

    // Remove password hash from response
    const { pwdHash, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'สมัครสมาชิกสำเร็จ',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' },
      { status: 500 }
    )
  }
} 