'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      } else {
        const session = await getSession()
        if (session) {
          router.push('/dashboard')
        }
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900 dark:to-emerald-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-96 h-96 bg-gradient-to-br from-teal-400 to-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-green-500 rounded-full animate-float"></div>
        <div className="absolute bottom-20 left-20 w-6 h-6 bg-emerald-500 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-teal-500 rounded-full animate-float animation-delay-2000"></div>
      </div>

      <div className="relative max-w-md w-full z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-float">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-eco rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-green">
              <span className="text-3xl">🌱</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gradient-eco mb-3">
            เข้าสู่ระบบ
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
            Zero Waste School System
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            รักษ์โลก เริ่มต้นที่โรงเรียน
          </p>
        </div>

        {/* Main Card */}
        <div className="card bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-8 shadow-2xl border-2 border-green-200 dark:border-green-700">
          {/* Social Login Buttons */}
          <div className="space-y-4 mb-8">
            <button
              type="button"
              className="w-full flex items-center justify-center px-6 py-4 border-3 border-green-300 dark:border-green-600 rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
            >
              <svg className="w-6 h-6 mr-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              เข้าสู่ระบบด้วย Google
            </button>
            
            <button
              type="button"
              className="w-full flex items-center justify-center px-6 py-4 border-3 border-green-300 dark:border-green-600 rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
            >
              <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              เข้าสู่ระบบด้วย GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-green-300 dark:border-green-600"></div>
            </div>
            <div className="relative flex justify-center text-base">
              <span className="px-6 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 font-bold">หรือ</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="form-label text-green-800 dark:text-green-200">
                อีเมล
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input w-full border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400 bg-green-50 dark:bg-green-900/20"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="form-label text-green-800 dark:text-green-200">
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input w-full border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400 bg-green-50 dark:bg-green-900/20"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-4 text-xl font-bold shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-3 border-white mr-3"></div>
                  กำลังเข้าสู่ระบบ...
                </div>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  เข้าสู่ระบบ
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 px-6 py-4 rounded-xl text-base font-semibold">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-base">
              ยังไม่มีบัญชี?{' '}
              <Link href="/auth/signup" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-bold hover:underline transition-colors">
                สมัครสมาชิก
              </Link>
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-green-600 dark:text-green-400">
              <span>🌍</span>
              <span>ร่วมกันรักษ์โลก</span>
              <span>🌱</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 