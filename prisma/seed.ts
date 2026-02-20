import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // สร้างประเภทขยะ
  const wasteTypes = await Promise.all([
    prisma.wasteType.upsert({
      where: { id: 1 },
      update: { pointFactor: 0.05 },
      create: {
        name: "ขยะรีไซเคิล",
        description: "กระดาษ พลาสติก แก้ว โลหะ",
        pointFactor: 0.05, // 1g = 0.05 คะแนน (ให้มากกว่าเพื่อส่งเสริม)
      },
    }),
    prisma.wasteType.upsert({
      where: { id: 2 },
      update: { pointFactor: 0.03 },
      create: {
        name: "ขยะทั่วไป",
        description: "ขยะที่ไม่สามารถรีไซเคิลได้",
        pointFactor: 0.03, // 1g = 0.03 คะแนน (พื้นฐาน)
      },
    }),
    prisma.wasteType.upsert({
      where: { id: 3 },
      update: { pointFactor: 0.04 },
      create: {
        name: "ขยะอินทรีย์",
        description: "เศษอาหาร ใบไม้",
        pointFactor: 0.04, // 1g = 0.04 คะแนน
      },
    }),
    prisma.wasteType.upsert({
      where: { id: 4 },
      update: { pointFactor: 0.09 },
      create: {
        name: "ขยะอันตราย",
        description: "แบตเตอรี่ หลอดไฟ อุปกรณ์อิเล็กทรอนิกส์",
        pointFactor: 0.09, // 1g = 0.09 คะแนน (สูงสุดเพื่อส่งเสริมการทิ้งถูกต้อง)
      },
    }),
  ]);

  // สร้าง Badges
  const badges = await Promise.all([
    prisma.badge.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "เริ่มต้น",
        description: "บันทึกขยะครั้งแรก",
        thresholdPts: 1,
      },
    }),
    prisma.badge.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: "นักสะสม",
        description: "ได้คะแนน 100 คะแนน",
        thresholdPts: 100,
      },
    }),
    prisma.badge.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: "เซียนรีไซเคิล",
        description: "ได้คะแนน 500 คะแนน",
        thresholdPts: 500,
      },
    }),
    prisma.badge.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: "ต้นแบบสิ่งแวดล้อม",
        description: "ได้คะแนน 1000 คะแนน",
        thresholdPts: 1000,
      },
    }),
  ]);

  // สร้างผู้ใช้ตัวอย่าง
  const hashedPassword = await bcrypt.hash("123456", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@school.ac.th" },
    update: {},
    create: {
      name: "ผู้ดูแลระบบ",
      email: "admin@school.ac.th",
      pwdHash: hashedPassword,
      role: "ADMIN",
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@school.ac.th" },
    update: {},
    create: {
      name: "ครูสมใจ ใจดี",
      email: "teacher@school.ac.th",
      pwdHash: hashedPassword,
      role: "TEACHER",
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: "student1@school.ac.th" },
    update: {},
    create: {
      name: "นักเรียนสมชาย ดีมาก",
      email: "student1@school.ac.th",
      pwdHash: hashedPassword,
      role: "STUDENT",
      grade: 3,
      classSection: "2",
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "student2@school.ac.th" },
    update: {},
    create: {
      name: "นักเรียนสมหญิง เก่งมาก",
      email: "student2@school.ac.th",
      pwdHash: hashedPassword,
      role: "STUDENT",
      grade: 3,
      classSection: "2",
    },
  });

  // สร้างข้อมูลขยะตัวอย่าง
  // ลบ records เก่าก่อน re-seed
  await prisma.wasteRecord.deleteMany({});

  const sampleRecords = await Promise.all([
    prisma.wasteRecord.create({
      data: {
        userId: student1.id,
        typeId: wasteTypes[0].id, // ขยะรีไซเคิล
        weightG: 5000, // 5 กก.
        points: Math.round(5000 * 0.05), // 250 คะแนน
      },
    }),
    prisma.wasteRecord.create({
      data: {
        userId: student1.id,
        typeId: wasteTypes[1].id, // ขยะทั่วไป
        weightG: 3000, // 3 กก.
        points: Math.round(3000 * 0.03), // 90 คะแนน
      },
    }),
    prisma.wasteRecord.create({
      data: {
        userId: student2.id,
        typeId: wasteTypes[0].id, // ขยะรีไซเคิล
        weightG: 2000, // 2 กก.
        points: Math.round(2000 * 0.05), // 100 คะแนน
      },
    }),
  ]);

  console.log("✅ Seeding completed!");
  console.log(`Created ${wasteTypes.length} waste types`);
  console.log(`Created ${badges.length} badges`);
  console.log(`Created 4 users (1 admin, 1 teacher, 2 students)`);
  console.log(`Created ${sampleRecords.length} sample waste records`);

  console.log("\n📋 Test credentials:");
  console.log("Admin: admin@school.ac.th / 123456");
  console.log("Teacher: teacher@school.ac.th / 123456");
  console.log("Student 1: student1@school.ac.th / 123456");
  console.log("Student 2: student2@school.ac.th / 123456");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
