'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface DashboardStats {
  recycleWeight: number
  generalWeight: number
  totalPoints: number
  rank: number | string
  userRank: number
  recentActivities: {
    id: number
    type: 'RECYCLABLE' | 'GENERAL'
    weight: number
    points: number
    createdAt: string
  }[]
}


export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    recycleWeight: 0,
    generalWeight: 0,
    totalPoints: 0,
    rank: '-',
    userRank: 0,
    recentActivities: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status, router])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      const data = await res.json()
      
      if (res.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) return null

  const { user } = session

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900 dark:to-emerald-900">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-xl border-b-4 border-green-400 dark:border-green-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-eco rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-green">
                <span className="text-2xl">🌱</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient-eco">
                  Zero Waste Dashboard
                </h1>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  รักษ์โลก เริ่มต้นที่โรงเรียน
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800 dark:text-white">
                  สวัสดี, {user.name}
                </p>
                {user.role === 'STUDENT' && user.grade && (
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    ชั้นมัธยมศึกษาปีที่ {user.grade}{user.classSection && ` ห้อง ${user.classSection}`}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-primary text-white shadow-lg">
                  {user.role === 'STUDENT' ? '🎓 นักเรียน' : 
                   user.role === 'TEACHER' ? '👨‍🏫 ครู' : '👨‍💼 ผู้ดูแลระบบ'}
                </span>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Message */}
          <div className="text-center py-8">
            <h2 className="text-4xl font-bold text-gradient-eco mb-4">
              ยินดีต้อนรับสู่ระบบ Zero Waste
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              ร่วมกันสร้างโรงเรียนที่ปลอดขยะ เพื่อโลกที่ยั่งยืน
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="stat-card hover:border-green-400 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label text-green-600 dark:text-green-400">ขยะรีไซเคิล</p>
                  <p className="stat-number text-green-600 dark:text-green-400">
                    {(stats.recycleWeight / 1000).toFixed(2)}
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">กิโลกรัม</p>
                </div>
                <div className="text-5xl group-hover:scale-110 transition-transform">♻️</div>
              </div>
            </div>

            <div className="stat-card hover:border-orange-400 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label text-orange-600 dark:text-orange-400">ขยะทั่วไป</p>
                  <p className="stat-number text-orange-600 dark:text-orange-400">
                    {(stats.generalWeight / 1000).toFixed(2)}
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">กิโลกรัม</p>
                </div>
                <div className="text-5xl group-hover:scale-110 transition-transform">🗑️</div>
              </div>
            </div>

            <div className="stat-card hover:border-blue-400 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label text-blue-600 dark:text-blue-400">คะแนนรวม</p>
                  <p className="stat-number text-blue-600 dark:text-blue-400">
                    {stats.totalPoints.toLocaleString()}
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">คะแนน</p>
                </div>
                <div className="text-5xl group-hover:scale-110 transition-transform">⭐</div>
              </div>
            </div>

            <div className="stat-card hover:border-purple-400 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label text-purple-600 dark:text-purple-400">อันดับ</p>
                  <p className="stat-number text-purple-600 dark:text-purple-400">
                    #{stats.userRank}
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">ของโรงเรียน</p>
                </div>
                <div className="text-5xl group-hover:scale-110 transition-transform">🏆</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link 
              href="/waste/record" 
              className="card-eco hover:scale-105 transition-all duration-300 p-8 text-center group"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📝</div>
              <h3 className="text-2xl font-bold mb-2">บันทึกขยะ</h3>
              <p className="text-green-100 font-medium">เพิ่มข้อมูลขยะใหม่</p>
              <div className="mt-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">คลิกที่นี่</span>
              </div>
            </Link>

            <Link 
              href="/statistics" 
              className="bg-gradient-secondary text-white rounded-xl p-8 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 text-center group"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-2xl font-bold mb-2">สถิติ</h3>
              <p className="text-blue-100 font-medium">ดูข้อมูลและกราฟ</p>
              <div className="mt-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">คลิกที่นี่</span>
              </div>
            </Link>

            <Link 
              href="/leaderboard" 
              className="bg-gradient-accent text-white rounded-xl p-8 shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 text-center group"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🏆</div>
              <h3 className="text-2xl font-bold mb-2">อันดับ</h3>
              <p className="text-yellow-100 font-medium">ดูอันดับและแข่งขัน</p>
              <div className="mt-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">คลิกที่นี่</span>
              </div>
            </Link>

            {user.role === 'ADMIN' && (
              <Link 
                href="/admin" 
                className="bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-xl p-8 shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 text-center group"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">⚙️</div>
                <h3 className="text-2xl font-bold mb-2">จัดการ</h3>
                <p className="text-red-100 font-medium">Admin Panel</p>
                <div className="mt-4 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">คลิกที่นี่</span>
                </div>
              </Link>
            )}
          </div>

          {/* Recent Activities */}
          <div className="card border-4 border-green-200 dark:border-green-700">
            <div className="bg-gradient-primary text-white px-8 py-6 rounded-t-lg">
              <h3 className="text-2xl font-bold flex items-center">
                <span className="mr-3">📋</span>
                กิจกรรมล่าสุด
              </h3>
            </div>
            <div className="p-8">
              {stats.recentActivities.length > 0 ? (
                <div className="space-y-6">
                  {stats.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-700 hover:border-green-400 dark:hover:border-green-500 transition-all duration-300 hover:shadow-lg">
                      <div className="text-4xl animate-float">
                        {activity.type === 'RECYCLABLE' ? '♻️' : '🗑️'}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          บันทึกขยะ{activity.type === 'RECYCLABLE' ? 'รีไซเคิล' : 'ทั่วไป'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {new Date(activity.createdAt).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          +{activity.points} คะแนน
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {(activity.weight / 1000).toFixed(2)} กิโลกรัม
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-8xl mb-6 animate-float">📝</div>
                  <h4 className="text-2xl font-bold text-gray-500 dark:text-gray-400 mb-4">
                    ยังไม่มีกิจกรรม
                  </h4>
                  <p className="text-lg text-gray-400 dark:text-gray-500 mb-8">
                    เริ่มต้นด้วยการบันทึกขยะของคุณ
                  </p>
                  <Link 
                    href="/waste/record"
                    className="btn btn-primary px-8 py-4 text-lg"
                  >
                    <span className="mr-2">🚀</span>
                    เริ่มบันทึกขยะ
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Motivational Footer */}
          <div className="text-center py-8 bg-gradient-eco text-white rounded-2xl shadow-2xl">
            <h3 className="text-3xl font-bold mb-4">🌍 ร่วมกันรักษ์โลก 🌱</h3>
            <p className="text-xl font-medium">
              ทุกการกระทำเล็กๆ ของคุณ มีส่วนช่วยสร้างโลกที่ยั่งยืน
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 