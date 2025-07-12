'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Github } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSocialLogin = (provider: string) => {
    signIn(provider, { callbackUrl: '/dashboard' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
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
        // ตรวจสอบ session และ redirect
        const session = await getSession()
        if (session) {
          router.push('/dashboard')
        }
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🌱</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            เข้าสู่ระบบ
          </h1>
          <p className="text-gray-600 text-lg">
            Zero Waste School System
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-2xl py-3 px-4 hover:border-gray-300 hover:shadow-md transition duration-200 group"
            >
              <div className="w-5 h-5 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-full"></div>
              <span className="font-medium text-gray-700 group-hover:text-gray-900">เข้าสู่ระบบด้วย Google</span>
            </button>
            
            <button
              onClick={() => handleSocialLogin('github')}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 rounded-2xl py-3 px-4 hover:bg-gray-800 transition duration-200 group"
            >
              <Github className="w-5 h-5 text-white" />
              <span className="font-medium text-white">เข้าสู่ระบบด้วย GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">หรือเข้าสู่ระบบด้วยอีเมล</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                placeholder="student@school.ac.th"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่าน
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-2xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  กำลังเข้าสู่ระบบ...
                </div>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ยังไม่มีบัญชี?{' '}
              <Link href="/auth/signup" className="text-green-600 hover:text-green-700 font-semibold">
                สมัครสมาชิก
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">
              ← กลับไปหน้าแรก
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
} 