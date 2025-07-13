# Zero Waste School System 🌱

ระบบติดตามและจัดการขยะในโรงเรียน เพื่อสิ่งแวดล้อมที่ดีกว่า

## ✨ Features

- 🔐 **Authentication System** - ระบบล็อกอินสำหรับนักเรียน ครู และผู้ดูแล
- 📊 **Waste Tracking** - บันทึกและติดตามข้อมูลขยะแต่ละประเภท
- 🏆 **Leaderboard** - การแข่งขันระหว่างนักเรียนและห้องเรียน
- 🎖️ **Badge System** - ระบบเหรียญรางวัลเมื่อบรรลุเป้าหมาย
- 📈 **Analytics** - สถิติและกราฟแสดงผลข้อมูล
- 📱 **Responsive Design** - รองรับมือถือและแท็บเล็ต
- 🎨 **Modern UI** - ธีมสีเขียวสดใส รักษ์โลก
- 🔤 **Kanit Font** - ฟอนต์ไทยที่สวยงาม

## 🚀 Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL + Prisma ORM
- **Deployment**: Vercel
- **Database Hosting**: Neon PostgreSQL
- **Font**: Kanit Google Font

## 🌍 Live Demo

🔗 **Production**: [https://zero-waste-school-nextjs.vercel.app](https://zero-waste-school-nextjs.vercel.app)

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
git clone https://github.com/PRSTDUIO-DEV/zero-waste-school-nextjs.git
cd zero-waste-school-nextjs/app-src
npm install
```

### 2. ตั้งค่าฐานข้อมูล

#### Option A: Neon (แนะนำ)
1. สมัครที่ [neon.tech](https://neon.tech)
2. สร้าง database ใหม่
3. คัดลอก connection string

#### Option B: Supabase
1. สมัครที่ [supabase.com](https://supabase.com)
2. สร้าง project ใหม่
3. คัดลอก connection string

### 3. ตั้งค่า Environment Variables

#### Windows (PowerShell):
```powershell
./setup-env.ps1
```

#### Manual Setup:
สร้างไฟล์ `.env` ในโฟลเดอร์ `app-src/`:

```env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. ตั้งค่า Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed ข้อมูลทดสอบ
npx prisma db seed
```

### 5. รันระบบ

```bash
# Development
npm run dev

# Production Build
npm run build
npm start
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

### บัญชีทดสอบ:
- **Admin**: admin@school.ac.th / 123456
- **Teacher**: teacher@school.ac.th / 123456  
- **Student**: student1@school.ac.th / 123456

## 🚀 Deploy บน Vercel

### 1. Push โค้ดขึ้น GitHub

```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### 2. Deploy ผ่าน Vercel Dashboard

1. ไปที่ [vercel.com](https://vercel.com)
2. เชื่อมต่อ GitHub repository
3. ตั้งค่า Environment Variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

### 3. หรือใช้ Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

## 🎨 Design System

### Colors
- **Primary**: Bright Green (#16a34a)
- **Secondary**: Sky Blue (#0ea5e9)
- **Accent**: Amber (#f59e0b)
- **Success**: Emerald (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Font**: Kanit (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Animations
- Blob effects
- Float animations
- Pulse effects
- Hover transitions

## 🔧 Troubleshooting

### Database Connection Error
- ตรวจสอบ `DATABASE_URL` ใน `.env`
- ลอง `npx prisma db push` ใหม่

### Authentication ไม่ทำงาน  
- ตรวจสอบ `NEXTAUTH_SECRET` ใน `.env`
- ลบ cookie browser และลองใหม่

### Vercel Deployment ล้มเหลว
- ตรวจสอบ Environment Variables ใน Vercel Dashboard
- ดู Build Logs เพื่อหาข้อผิดพลาด

## 📱 Features ที่พร้อมใช้

✅ Authentication System  
✅ Role-based Access (Student/Teacher/Admin)  
✅ Database Schema (Users, WasteTypes, Records, Badges)  
✅ Waste Recording System  
✅ Statistics Dashboard  
✅ Leaderboard System  
✅ Badge System  
✅ Admin Panel  
✅ Responsive Design  
✅ Modern Eco-friendly UI  
✅ Kanit Font Support  
✅ Dark Mode Support  

## 🔜 Next Steps (ต่อยอด)

- [ ] Social Login (Google, GitHub)
- [ ] Push Notifications
- [ ] Mobile App (React Native)
- [ ] Advanced Analytics
- [ ] Export Reports
- [ ] Multi-language Support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: PRSTDUIO-DEV
- **Design**: Eco-friendly Green Theme
- **Font**: Kanit Google Font

---

🎉 **Zero Waste School System พร้อมใช้แล้ว!** 

🌱 **รักษ์โลก เริ่มต้นที่โรงเรียน** 🌍
