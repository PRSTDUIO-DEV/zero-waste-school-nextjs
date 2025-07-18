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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900 dark:to-emerald-900 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-teal-400 to-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-green-500 rounded-full animate-float"></div>
        <div className="absolute bottom-20 left-20 w-6 h-6 bg-emerald-500 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-teal-500 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute bottom-1/3 left-1/3 w-5 h-5 bg-green-400 rounded-full animate-float animation-delay-3000"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center">
          {/* Header */}
          <div className="mb-16 animate-float">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-eco rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-green">
                <span className="text-4xl">🌱</span>
              </div>
            </div>
            <h1 className="text-6xl font-bold text-gradient-eco mb-6">
              EcoHero School System
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
              ระบบติดตามและจัดการขยะในโรงเรียน เพื่อสิ่งแวดล้อมที่ดีกว่า
            </p>
            <p className="text-lg text-green-600 dark:text-green-400 mt-4 font-semibold">
              🌍 รักษ์โลก เริ่มต้นที่โรงเรียน 🌱
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="card p-8 text-center hover:border-green-400 group">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                ติดตามข้อมูล
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                บันทึกและติดตามข้อมูลขยะแต่ละประเภทอย่างละเอียด
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-8 text-center hover:border-blue-400 group">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🏆</div>
              <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4">
                แข่งขันกันสนุก
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                ระบบคะแนนและอันดับเพื่อสร้างแรงจูงใจในการรักษ์สิ่งแวดล้อม
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-8 text-center hover:border-yellow-400 group">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🎖️</div>
              <h3 className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mb-4">
                รางวัลและเหรียญ
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                ระบบเหรียญรางวัลเมื่อบรรลุเป้าหมายการรักษ์สิ่งแวดล้อม
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card p-8 text-center hover:border-purple-400 group">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">📱</div>
              <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-4">
                ใช้งานง่าย
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                ออกแบบให้ใช้งานง่าย รองรับมือถือและแท็บเล็ต
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="card p-8 text-center hover:border-red-400 group">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">📈</div>
              <h3 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-4">
                วิเคราะห์ข้อมูล
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                สถิติและกราฟแสดงผลข้อมูลอย่างชัดเจน
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="card p-8 text-center hover:border-teal-400 group">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🔒</div>
              <h3 className="text-2xl font-bold text-teal-700 dark:text-teal-300 mb-4">
                ปลอดภัย
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                ระบบการยืนยันตัวตนและการจัดการสิทธิ์อย่างปลอดภัย
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-eco text-white rounded-3xl p-12 shadow-2xl mb-16">
            <h2 className="text-4xl font-bold mb-6">
              🚀 เริ่มต้นใช้งานวันนี้!
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              ร่วมเป็นส่วนหนึ่งในการสร้างโรงเรียนที่ปลอดขยะ เพื่อโลกที่ยั่งยืน
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/auth/signin"
                className="btn btn-secondary px-8 py-4 text-xl font-bold shadow-2xl hover:shadow-blue-500/25"
            >
                <span className="mr-2">🔑</span>
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/auth/signup"
                className="btn btn-accent px-8 py-4 text-xl font-bold shadow-2xl hover:shadow-yellow-500/25"
            >
                <span className="mr-2">📝</span>
              สมัครสมาชิก
            </Link>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
                100%
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                เป้าหมายขยะศูนย์
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                24/7
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                ใช้งานได้ตลอดเวลา
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                ∞
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                ผลกระทบต่อสิ่งแวดล้อม
              </p>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              พัฒนาโดยทีมงาน EcoHero School
            </p>
            <div className="flex justify-center space-x-4 text-2xl">
              <span>🌍</span>
              <span>♻️</span>
              <span>🌱</span>
              <span>💚</span>
              <span>🌿</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
