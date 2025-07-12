'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Leaf, Users, Recycle, Award, Globe, Github } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    grade: '',
    classSection: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          grade: formData.role === 'STUDENT' ? parseInt(formData.grade) : null,
          classSection: formData.role === 'STUDENT' ? formData.classSection : null
        })
      })

      const data = await res.json()

      if (res.ok) {
        // Auto login after successful registration
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.ok) {
          router.push('/dashboard')
        }
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    signIn(provider, { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center px-4 py-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Globe className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            เข้าร่วมกับเรา
          </h1>
          <p className="text-gray-600 text-lg">
            Zero Waste School System
          </p>
          <p className="text-sm text-gray-500 mt-2">
            ร่วมกันสร้างโลกที่ยั่งยืน เริ่มต้นจากโรงเรียน
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Recycle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-xs text-gray-600">บันทึกขยะ</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600">แข่งขันกัน</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600">รับเหรียญ</p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-2xl py-3 px-4 hover:border-gray-300 hover:shadow-md transition duration-200 group"
            >
              <div className="w-5 h-5 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-full"></div>
              <span className="font-medium text-gray-700 group-hover:text-gray-900">ดำเนินการต่อด้วย Google</span>
            </button>
            
            <button
              onClick={() => handleSocialLogin('github')}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 rounded-2xl py-3 px-4 hover:bg-gray-800 transition duration-200 group"
            >
              <Github className="w-5 h-5 text-white" />
              <span className="font-medium text-white">ดำเนินการต่อด้วย GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">หรือสมัครด้วยอีเมล</span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อ-นามสกุล
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                placeholder="example@school.ac.th"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                ประเภทผู้ใช้
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              >
                <option value="STUDENT">นักเรียน</option>
                <option value="TEACHER">ครู</option>
              </select>
            </div>

            {formData.role === 'STUDENT' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                    ชั้น
                  </label>
                  <select
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">เลือกชั้น</option>
                    <option value="1">ม.1</option>
                    <option value="2">ม.2</option>
                    <option value="3">ม.3</option>
                    <option value="4">ม.4</option>
                    <option value="5">ม.5</option>
                    <option value="6">ม.6</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="classSection" className="block text-sm font-medium text-gray-700 mb-2">
                    ห้อง
                  </label>
                  <input
                    id="classSection"
                    type="text"
                    value={formData.classSection}
                    onChange={(e) => setFormData(prev => ({ ...prev, classSection: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    placeholder="เช่น 1, 2, 3"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่าน
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                ยืนยันรหัสผ่าน
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
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
                  กำลังสมัครสมาชิก...
                </div>
              ) : (
                'สมัครสมาชิก'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              มีบัญชีอยู่แล้ว?{' '}
              <Link href="/auth/signin" className="text-green-600 hover:text-green-700 font-semibold">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">
              ← กลับไปหน้าแรก
            </Link>
          </div>
        </div>

        {/* Bottom Message */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            การสมัครสมาชิกแสดงว่าคุณยอมรับ{' '}
            <a href="#" className="text-green-600 hover:text-green-700">เงื่อนไขการใช้งาน</a>
            {' '}และ{' '}
            <a href="#" className="text-green-600 hover:text-green-700">นโยบายความเป็นส่วนตัว</a>
          </p>
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