import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Zero Waste School System
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              ระบบติดตามและจัดการขยะในโรงเรียน เพื่อสิ่งแวดล้อมที่ดีกว่า
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">ติดตามสถิติ</h3>
              <p className="text-gray-600">
                ดูสถิติการทิ้งขยะและคะแนนของคุณแบบเรียลไทม์
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold mb-2">การแข่งขัน</h3>
              <p className="text-gray-600">
                แข่งขันกับเพื่อนและห้องเรียนอื่นๆ ในการลดขยะ
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🎖️</div>
              <h3 className="text-lg font-semibold mb-2">ระบบเหรียญรางวัล</h3>
              <p className="text-gray-600">
                รับเหรียญรางวัลเมื่อบรรลุเป้าหมายการลดขยะ
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-x-4">
            <Link
              href="/auth/signin"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/auth/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
