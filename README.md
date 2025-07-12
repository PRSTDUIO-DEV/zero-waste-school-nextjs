# Zero Waste School System 🌱

ระบบติดตามและจัดการขยะในโรงเรียน เพื่อสิ่งแวดล้อมที่ดีกว่า

## ✨ Features

- 🔐 **Authentication System** - ระบบล็อกอินสำหรับนักเรียน ครู และผู้ดูแล
- 📊 **Waste Tracking** - บันทึกและติดตามข้อมูลขยะแต่ละประเภท
- 🏆 **Leaderboard** - การแข่งขันระหว่างนักเรียนและห้องเรียน
- 🎖️ **Badge System** - ระบบเหรียญรางวัลเมื่อบรรลุเป้าหมาย
- 📈 **Analytics** - สถิติและกราฟแสดงผลข้อมูล
- 📱 **Responsive Design** - รองรับมือถือและแท็บเล็ต

## 🚀 Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL + Prisma ORM
- **Deployment**: Vercel
- **Database Hosting**: Neon (ฟรี 10GB) หรือ Supabase (ฟรี 2GB)

## 📋 Requirements

ตาม RPD Document:
- User authentication และ role-based access
- Waste recording system (1g = 1 point default)
- Leaderboards และ ranking system
- Badge และ milestone system
- Admin panel สำหรับจัดการระบบ
- Audit logging สำหรับ admin actions

## 🛠️ Installation

### 1. Clone และติดตั้ง dependencies

```bash
cd app-src
npm install
```

### 2. ตั้งค่าฐานข้อมูล

#### Option A: Neon (แนะนำ)
1. สมัครที่ [neon.tech](https://neon.tech)
2. สร้าง database ใหม่
3. คัดลอก connection string

#### Option B: Supabase
1. สมัครที่ [supabase.com](https://supabase.com)
2. สร้างโปรเจคใหม่
3. ไปที่ Settings > Database
4. คัดลอก connection string

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` และเพิ่ม:

```env
# Database (แทนที่ด้วย URL จริงของคุณ)
DATABASE_URL="postgresql://username:password@hostname:5432/dbname?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-change-this"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Setup Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Optional: Seed data
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

## 🗃️ Database Schema

```prisma
model User {
  id           Int      @id @default(autoincrement())
  name         String
  email        String   @unique
  pwdHash      String
  role         Role     @default(STUDENT)
  grade        Int?     // 1-6 for students
  classSection String?  // e.g. "2"
  
  wasteRecords WasteRecord[]
  userBadges   UserBadge[]
  auditLogs    AuditLog[]
}

model WasteType {
  id          Int     @id @default(autoincrement())
  name        String
  pointFactor Decimal @default(1.00)
  
  wasteRecords WasteRecord[]
}

model WasteRecord {
  id       Int      @id @default(autoincrement())
  userId   Int
  typeId   Int
  weightG  Int      // weight in grams
  points   Int      // calculated points
  recordDt DateTime @default(now())
  
  user      User      @relation(fields: [userId], references: [id])
  wasteType WasteType @relation(fields: [typeId], references: [id])
}
```

## 🚢 Deployment

### Deploy บน Vercel

1. Push code ขึ้น GitHub
2. Connect repository กับ Vercel
3. เพิ่ม Environment Variables ใน Vercel Dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (URL ของ production)

### Database Migration บน Production

```bash
npx prisma migrate deploy
```

## 🔑 Default Users

หลังจาก seed data:

```
Admin: admin@school.ac.th / admin123
Teacher: teacher@school.ac.th / teacher123
Student: student@school.ac.th / student123
```

## 📱 API Routes

- `POST /api/auth/[...nextauth]` - Authentication
- `GET/POST /api/waste-records` - Waste record management
- `GET /api/leaderboard` - Ranking data
- `GET /api/stats` - User statistics
- `GET/POST /api/admin/*` - Admin operations

## 🤝 Contributing

1. Fork repository
2. สร้าง feature branch
3. Commit changes
4. Push และสร้าง Pull Request

## 📄 License

MIT License - ดูไฟล์ LICENSE สำหรับรายละเอียด

## 🆘 Support

หากพบปัญหา:
1. ตรวจสอบ environment variables
2. ตรวจสอบ database connection
3. ดู console logs
4. สร้าง issue ใน GitHub

---

**Zero Waste School System** - สร้างโดย ❤️ เพื่อสิ่งแวดล้อมที่ดีกว่า 🌍
