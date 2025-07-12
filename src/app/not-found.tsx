import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          ไม่พบหน้าที่คุณกำลังมองหา
        </h2>
        <p className="text-gray-600 mb-8">
          หน้าที่คุณพยายามเข้าถึงอาจถูกย้าย ลบ หรือไม่มีอยู่
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition duration-200"
          >
            กลับสู่หน้าหลัก
          </Link>
          <div className="text-center">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ไปยัง Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 