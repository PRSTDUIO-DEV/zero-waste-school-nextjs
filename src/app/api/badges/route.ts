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

    // Get all badges
    const allBadges = await prisma.badge.findMany({
      orderBy: { thresholdPts: "asc" },
    });

    // Get user's earned badges
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true, awardedDt: true },
    });

    const earnedMap = new Map(
      userBadges.map((ub: { badgeId: number; awardedDt: Date }) => [
        ub.badgeId,
        ub.awardedDt,
      ]),
    );

    // Get current points
    const stats = await prisma.wasteRecord.aggregate({
      where: { userId },
      _sum: { points: true },
    });

    const currentPoints = stats._sum.points || 0;

    const badges = allBadges.map(
      (badge: {
        id: number;
        name: string;
        description: string | null;
        thresholdPts: number;
      }) => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        thresholdPts: badge.thresholdPts,
        earned: earnedMap.has(badge.id),
        awardedDt: earnedMap.get(badge.id) || null,
      }),
    );

    return NextResponse.json({ badges, currentPoints });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
