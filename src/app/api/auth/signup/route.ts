import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, grade, classSection } =
      await request.json();

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "รูปแบบอีเมลไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
        { status: 400 },
      );
    }

    // Validate role — ADMIN self-registration is not allowed
    if (!["STUDENT", "TEACHER"].includes(role)) {
      return NextResponse.json(
        { error: "ประเภทผู้ใช้ไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    // Validate grade for students
    if (role === "STUDENT" && !grade) {
      return NextResponse.json(
        { error: "กรุณาเลือกชั้นเรียน" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "อีเมลนี้ถูกใช้งานแล้ว" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userData: {
      email: string;
      pwdHash: string;
      name: string;
      role: string;
      grade?: number;
      classSection?: string;
    } = {
      email,
      pwdHash: hashedPassword,
      name,
      role,
    };

    // Add grade and classSection for students
    if (role === "STUDENT") {
      userData.grade = parseInt(grade);
      if (classSection) {
        userData.classSection = classSection;
      }
    }

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        grade: true,
        classSection: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "สมัครสมาชิกสำเร็จ",
      user,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 },
    );
  }
}
