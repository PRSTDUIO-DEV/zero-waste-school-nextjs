import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface RecordInput {
  typeId: number;
  weightG: number;
  description?: string;
}

interface BadgeInfo {
  name: string;
  description: string | null;
}

interface WasteTypeInfo {
  id: number;
  name: string;
  pointFactor: unknown;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนใช้งาน" },
        { status: 401 },
      );
    }

    const userId = parseInt(session.user.id);

    // Validate user ID
    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "ข้อมูลผู้ใช้ไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    let requestData;
    try {
      requestData = await request.json();
    } catch {
      return NextResponse.json(
        { error: "ข้อมูลที่ส่งมาไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const { records } = requestData;

    // Validate records array
    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "กรุณาระบุข้อมูลการบันทึกขยะ" },
        { status: 400 },
      );
    }

    // Validate each record
    for (const record of records) {
      if (
        !record.typeId ||
        typeof record.typeId !== "number" ||
        record.typeId <= 0
      ) {
        return NextResponse.json(
          { error: "กรุณาเลือกประเภทขยะที่ถูกต้อง" },
          { status: 400 },
        );
      }

      if (
        !record.weightG ||
        typeof record.weightG !== "number" ||
        record.weightG <= 0
      ) {
        return NextResponse.json(
          { error: "กรุณาระบุน้ำหนักที่ถูกต้อง (มากกว่า 0)" },
          { status: 400 },
        );
      }

      if (record.weightG > 100000) {
        // 100kg limit
        return NextResponse.json(
          { error: "น้ำหนักต้องไม่เกิน 100,000 กรัม" },
          { status: 400 },
        );
      }
    }

    // Check daily limit (optional)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRecords = await prisma.wasteRecord.count({
      where: {
        userId,
        recordDt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (todayRecords >= 50) {
      // Daily limit
      return NextResponse.json(
        { error: "คุณได้บันทึกขยะครบจำนวนที่กำหนดแล้วในวันนี้" },
        { status: 400 },
      );
    }

    // Fetch waste types to calculate points
    const wasteTypeIds = records.map((r: RecordInput) => r.typeId);

    const wasteTypes = await prisma.wasteType.findMany({
      where: {
        id: {
          in: wasteTypeIds,
        },
      },
      select: {
        id: true,
        name: true,
        pointFactor: true,
      },
    });

    // Validate all waste types exist
    const foundIds = wasteTypes.map((t: WasteTypeInfo) => t.id);
    const missingIds = wasteTypeIds.filter((id) => !foundIds.includes(id));

    if (missingIds.length > 0) {
      return NextResponse.json(
        { error: `ไม่พบประเภทขยะที่ระบุ: ${missingIds.join(", ")}` },
        { status: 400 },
      );
    }

    // Create waste records with calculated points
    const wasteRecords = records.map((record: RecordInput) => {
      const wasteType = wasteTypes.find(
        (t: WasteTypeInfo) => t.id === record.typeId,
      )!;
      const points = Math.round(record.weightG * Number(wasteType.pointFactor));

      return {
        userId,
        typeId: record.typeId,
        weightG: record.weightG,
        points,
        description: record.description || null,
      };
    });

    // Create all records in a transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      const createdRecords = await Promise.all(
        wasteRecords.map((record) =>
          tx.wasteRecord.create({
            data: record,
            select: {
              id: true,
              points: true,
              wasteType: {
                select: {
                  name: true,
                },
              },
            },
          }),
        ),
      );

      return createdRecords;
    });

    const totalPoints = result.reduce(
      (sum: number, record: { points: number }) => sum + record.points,
      0,
    );

    // Check for new badges (optional - if badge system exists)
    let newBadges: BadgeInfo[] = [];
    let currentPoints = 0;

    try {
      const userTotalPoints = await prisma.wasteRecord.aggregate({
        where: { userId },
        _sum: { points: true },
      });

      currentPoints = userTotalPoints._sum.points || 0;

      // Check if badge tables exist by trying to query them
      try {
        // Get badges user doesn't have yet
        const existingBadges = await prisma.userBadge.findMany({
          where: { userId },
          select: { badgeId: true },
        });

        const existingBadgeIds = existingBadges.map(
          (b: { badgeId: number }) => b.badgeId,
        );

        const availableBadges = await prisma.badge.findMany({
          where: {
            thresholdPts: {
              lte: currentPoints,
            },
            id: {
              notIn: existingBadgeIds,
            },
          },
          select: {
            id: true,
            name: true,
            description: true,
          },
        });

        // Award new badges
        if (availableBadges.length > 0) {
          await prisma.userBadge.createMany({
            data: availableBadges.map((badge: { id: number }) => ({
              userId,
              badgeId: badge.id,
            })),
          });

          newBadges = availableBadges.map(
            (badge: { name: string; description: string | null }) => ({
              name: badge.name,
              description: badge.description,
            }),
          );
        }
      } catch (badgeError) {
        // Badge system not implemented yet - skip badge logic
        console.log("Badge system not available:", badgeError);
      }
    } catch (pointsError) {
      console.error("Error calculating points:", pointsError);
    }

    return NextResponse.json({
      success: true,
      message: "บันทึกขยะสำเร็จ",
      totalPoints,
      currentPoints,
      recordsCreated: result.length,
      newBadges,
    });
  } catch (error) {
    console.error(
      "Error recording waste:",
      error instanceof Error ? error.message : error,
    );

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { error: "ข้อมูลที่ส่งมาไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" },
          { status: 400 },
        );
      }

      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "ข้อมูลซ้ำ กรุณาตรวจสอบอีกครั้ง" },
          { status: 400 },
        );
      }

      if (error.message.includes("Connection")) {
        return NextResponse.json(
          { error: "ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง" },
          { status: 503 },
        );
      }
    }

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง" },
      { status: 500 },
    );
  }
}

// Edit a waste record (within 24 hours)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { recordId, weightG, description } = await request.json();

    if (!recordId || typeof recordId !== "number") {
      return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
    }

    // Fetch the record
    const record = await prisma.wasteRecord.findUnique({
      where: { id: recordId },
      include: { wasteType: { select: { pointFactor: true } } },
    });

    if (!record) {
      return NextResponse.json({ error: "ไม่พบบันทึกนี้" }, { status: 404 });
    }

    if (record.userId !== userId) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไข" }, { status: 403 });
    }

    // Check 24-hour limit
    const hoursSinceCreation =
      (Date.now() - new Date(record.recordDt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return NextResponse.json(
        { error: "ไม่สามารถแก้ไขได้ เกิน 24 ชั่วโมงแล้ว" },
        { status: 400 },
      );
    }

    // Validate new weight
    const newWeight = weightG ?? record.weightG;
    if (newWeight <= 0 || newWeight > 100000) {
      return NextResponse.json(
        { error: "น้ำหนักต้องอยู่ระหว่าง 1-100,000 กรัม" },
        { status: 400 },
      );
    }

    const newPoints = Math.round(
      newWeight * Number(record.wasteType.pointFactor),
    );

    const updated = await prisma.wasteRecord.update({
      where: { id: recordId },
      data: {
        weightG: newWeight,
        points: newPoints,
        description: description ?? record.description,
      },
      select: {
        id: true,
        weightG: true,
        points: true,
        description: true,
        wasteType: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "แก้ไขบันทึกสำเร็จ",
      record: updated,
    });
  } catch {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการแก้ไข" },
      { status: 500 },
    );
  }
}

// Delete a waste record (within 24 hours)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { searchParams } = new URL(request.url);
    const recordId = Number(searchParams.get("id"));

    if (!recordId) {
      return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
    }

    const record = await prisma.wasteRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      return NextResponse.json({ error: "ไม่พบบันทึกนี้" }, { status: 404 });
    }

    if (record.userId !== userId) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ลบ" }, { status: 403 });
    }

    // Check 24-hour limit
    const hoursSinceCreation =
      (Date.now() - new Date(record.recordDt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return NextResponse.json(
        { error: "ไม่สามารถลบได้ เกิน 24 ชั่วโมงแล้ว" },
        { status: 400 },
      );
    }

    await prisma.wasteRecord.delete({ where: { id: recordId } });

    return NextResponse.json({
      success: true,
      message: "ลบบันทึกสำเร็จ",
    });
  } catch {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบ" },
      { status: 500 },
    );
  }
}
