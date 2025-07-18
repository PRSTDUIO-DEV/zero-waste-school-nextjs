'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  role: 'STUDENT' | 'TEACHER'
  grade?: string
  classSection?: string
}

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'STUDENT'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      return false
    }

    if (formData.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return false
    }

    if (formData.role === 'STUDENT' && !formData.grade) {
      setError('กรุณาเลือกชั้นเรียน')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('สมัครสมาชิกสำเร็จ! กำลังเปลี่ยนหน้า...')
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-900 bg-pattern flex items-center justify-center p-4">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-float animation-delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Premium Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-luxury rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-luxury mb-6">
            <span className="text-4xl">🌱</span>
          </div>
          <h1 className="text-4xl font-bold text-gradient-luxury mb-4">
            สมัครสมาชิก
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
            เข้าร่วมระบบ EcoHero School
          </p>
        </div>

        {/* Premium Glass Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="form-label">
                ชื่อ-นามสกุล
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="form-label">
                อีเมล
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="กรอกอีเมล"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="form-label">
                ประเภทผู้ใช้
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-input w-full"
              >
                <option value="STUDENT">🎓 นักเรียน</option>
                <option value="TEACHER">👨‍🏫 ครู</option>
              </select>
            </div>

            {/* Grade Selection for Students */}
            {formData.role === 'STUDENT' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="grade" className="form-label">
                    ชั้นเรียน
                  </label>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade || ''}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    required
                  >
                    <option value="">เลือกชั้น</option>
                    <option value="1">มัธยมศึกษาปีที่ 1</option>
                    <option value="2">มัธยมศึกษาปีที่ 2</option>
                    <option value="3">มัธยมศึกษาปีที่ 3</option>
                    <option value="4">มัธยมศึกษาปีที่ 4</option>
                    <option value="5">มัธยมศึกษาปีที่ 5</option>
                    <option value="6">มัธยมศึกษาปีที่ 6</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="classSection" className="form-label">
                    ห้อง
                  </label>
                  <input
                    id="classSection"
                    name="classSection"
                    type="text"
                    value={formData.classSection || ''}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    placeholder="เช่น 1, 2, 3"
                  />
                </div>
              </div>
            )}

            {/* Password Fields */}
            <div>
              <label htmlFor="password" className="form-label">
                รหัสผ่าน
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                ยืนยันรหัสผ่าน
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="glass-card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">❌</span>
                  <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="glass-card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">✅</span>
                  <p className="text-green-600 dark:text-green-400 font-medium">{success}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  กำลังสมัครสมาชิก...
                </div>
              ) : (
                <>
                  <span className="mr-3">🚀</span>
                  สมัครสมาชิก
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                  หรือ
                </span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                มีบัญชีแล้ว?{' '}
                <Link 
                  href="/auth/signin" 
                  className="text-gradient font-bold hover:underline transition-all duration-300"
                >
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Premium Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            การสมัครสมาชิกแสดงว่าคุณยอมรับ
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            <span className="text-gradient">เงื่อนไขการใช้งาน</span> และ <span className="text-gradient">นโยบายความเป็นส่วนตัว</span>
          </p>
        </div>
      </div>
    </div>
  )
} 