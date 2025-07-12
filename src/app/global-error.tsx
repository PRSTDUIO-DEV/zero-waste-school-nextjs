'use client'

export const dynamic = 'force-dynamic'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-red-600 mb-4">Error</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              เกิดข้อผิดพลาดในระบบ
            </h2>
            <p className="text-gray-600 mb-8">
              {error.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด'}
            </p>
            <button
              onClick={reset}
              className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition duration-200"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </body>
    </html>
  )
} 