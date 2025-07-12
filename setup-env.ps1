# สร้างไฟล์ .env
@"
DATABASE_URL="postgresql://neondb_owner:npg_5x1jGaSWXUqy@ep-hidden-poetry-a1x9tq8o-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
"@ | Out-File -FilePath .env -Encoding UTF8

Write-Host "✅ Created .env file successfully!" -ForegroundColor Green 