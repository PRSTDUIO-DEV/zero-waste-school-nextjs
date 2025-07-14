# 🚀 Quick Setup Guide

## ตั้งค่าฐานข้อมูลฟรี

### วิธี 1: Neon (แนะนำ - 10GB ฟรี)

1. ไปที่ [neon.tech](https://neon.tech) และสมัครสมาชิก
2. สร้าง Project ใหม่
3. เลือก Region: `US East` (เร็วที่สุด)
4. คัดลอก Connection String ที่ได้

### วิธี 2: Supabase (2GB ฟรี)

1. ไปที่ [supabase.com](https://supabase.com) และสมัครสมาชิก
2. สร้าง Project ใหม่
3. ไปที่ Settings > Database
4. คัดลอก Connection String (โหมด Session)

## เริ่มต้นใช้งาน

```bash
# 1. ตั้งค่า Environment Variables
cp .env.example .env
# แก้ไข .env ใส่ DATABASE_URL ของคุณ

# 2. Generate Prisma Client
npx prisma generate

# 3. สร้าง Database Schema
npx prisma db push

# 4. Seed ข้อมูลเริ่มต้น
npx prisma db seed

# 5. เริ่มรัน Development Server
npm run dev
```

## ✅ การทดสอบ

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

### บัญชีทดสอบ:
- **Admin**: admin@school.ac.th / 123456
- **Teacher**: teacher@school.ac.th / 123456  
- **Student**: student1@school.ac.th / 123456

## 🚀 Deploy บน Vercel

1. Push โค้ดขึ้น GitHub
2. เข้า [vercel.com](https://vercel.com) และ Import repository
3. ตั้งค่า Environment Variables:
   - `DATABASE_URL` = connection string ของคุณ
   - `NEXTAUTH_SECRET` = สุ่ม string ยาวๆ
   - `NEXTAUTH_URL` = URL ของ production (เช่น https://myapp.vercel.app)

4. Deploy เสร็จ!

## 🐛 แก้ปัญหา

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
✅ Basic Dashboard  
✅ Responsive Design  
✅ Seed Data พร้อมใช้  

## 🔜 Next Steps (ต่อยอด)

- [ ] หน้าบันทึกขยะ (Waste Recording)
- [ ] หน้าแสดงสถิติ (Statistics) 
- [ ] หน้า Leaderboard
- [ ] หน้า Admin Panel
- [ ] ระบบแจ้งเตือน
- [ ] Charts และ Data Visualization

---

🎉 **EcoHero School System พร้อมใช้แล้ว!** 