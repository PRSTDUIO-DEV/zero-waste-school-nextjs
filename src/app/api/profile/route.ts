import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        grade: true,
        classSection: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    // Get aggregated stats
    const stats = await prisma.wasteRecord.aggregate({
      where: { userId },
      _sum: { points: true, weightG: true },
      _count: { id: true },
    });

    // Get earned badges
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: { select: { name: true, description: true } } },
      orderBy: { awardedDt: "desc" },
    });

    return NextResponse.json({
      ...user,
      totalPoints: stats._sum.points || 0,
      totalRecords: stats._count.id || 0,
      totalWeight: stats._sum.weightG || 0,
      badges: userBadges.map(
        (ub: {
          badge: { name: string; description: string | null };
          awardedDt: Date;
        }) => ({
          name: ub.badge.name,
          description: ub.badge.description,
          awardedDt: ub.awardedDt,
        }),
      ),
    });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร" },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() },
    });

    return NextResponse.json({ success: true, message: "อัปเดตชื่อสำเร็จ" });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
