import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Record<string, unknown> = {};
    if (startDate && endDate) {
      where.recordDt = {
        gte: new Date(startDate),
        lte: new Date(endDate + "T23:59:59"),
      };
    }

    const records = await prisma.wasteRecord.findMany({
      where,
      include: {
        user: { select: { name: true, grade: true, classSection: true } },
        wasteType: { select: { name: true } },
      },
      orderBy: { recordDt: "desc" },
      take: 10000,
    });

    // Build CSV
    const headers = [
      "ลำดับ",
      "วันที่",
      "ชื่อ",
      "ชั้น",
      "ห้อง",
      "ประเภทขยะ",
      "น้ำหนัก(กรัม)",
      "คะแนน",
    ];

    const rows = records.map(
      (
        r: {
          recordDt: Date;
          user: {
            name: string;
            grade: number | null;
            classSection: string | null;
          };
          wasteType: { name: string };
          weightG: number;
          points: number;
        },
        i: number,
      ) => [
        i + 1,
        new Date(r.recordDt).toLocaleDateString("th-TH"),
        r.user.name,
        r.user.grade || "-",
        r.user.classSection || "-",
        r.wasteType.name,
        r.weightG,
        r.points,
      ],
    );

    const BOM = "\uFEFF";
    const csv =
      BOM +
      headers.join(",") +
      "\n" +
      rows.map((row: (string | number)[]) => row.join(",")).join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="waste-records-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
