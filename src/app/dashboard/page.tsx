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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <span className="text-xl">🌱</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Zero Waste Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                สวัสดี, <span className="font-semibold text-gray-900 dark:text-white">{user.name}</span>
                {user.role === 'STUDENT' && user.grade && (
                  <span className="ml-1 text-gray-500 dark:text-gray-400">
                    (ม.{user.grade}{user.classSection && `/${user.classSection}`})
                  </span>
                )}
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                {user.role === 'STUDENT' ? 'นักเรียน' : 
                 user.role === 'TEACHER' ? 'ครู' : 'ผู้ดูแลระบบ'}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-3xl">♻️</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        ขยะรีไซเคิล (กิโลกรัม)
                      </dt>
                      <dd className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {(stats.recycleWeight / 1000).toFixed(2)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-3xl">🗑️</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        ขยะทั่วไป (กิโลกรัม)
                      </dt>
                      <dd className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {(stats.generalWeight / 1000).toFixed(2)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-3xl">⭐</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        คะแนนรวม
                      </dt>
                      <dd className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.totalPoints.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-3xl">🏆</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        อันดับ
                      </dt>
                      <dd className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        #{stats.userRank}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Link 
              href="/waste/record" 
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 group"
            >
              <div className="flex items-center">
                <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">📝</div>
                <div>
                  <h3 className="text-lg font-semibold">บันทึกขยะ</h3>
                  <p className="text-sm text-emerald-100">เพิ่มข้อมูลขยะใหม่</p>
                </div>
              </div>
            </Link>

            <Link 
              href="/statistics" 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 group"
            >
              <div className="flex items-center">
                <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">📊</div>
                <div>
                  <h3 className="text-lg font-semibold">สถิติ</h3>
                  <p className="text-sm text-blue-100">ดูข้อมูลและกราฟ</p>
                </div>
              </div>
            </Link>

            <Link 
              href="/leaderboard" 
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 group"
            >
              <div className="flex items-center">
                <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">🏆</div>
                <div>
                  <h3 className="text-lg font-semibold">อันดับ</h3>
                  <p className="text-sm text-purple-100">ดูอันดับและแข่งขัน</p>
                </div>
              </div>
            </Link>

            {user.role === 'ADMIN' && (
              <Link 
                href="/admin" 
                className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 group"
              >
                <div className="flex items-center">
                  <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">⚙️</div>
                  <div>
                    <h3 className="text-lg font-semibold">จัดการ</h3>
                    <p className="text-sm text-red-100">Admin Panel</p>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">กิจกรรมล่าสุด</h3>
            </div>
            <div className="p-6">
              {stats.recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl">
                        {activity.type === 'RECYCLABLE' ? '♻️' : '🗑️'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          บันทึกขยะ{activity.type === 'RECYCLABLE' ? 'รีไซเคิล' : 'ทั่วไป'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(activity.createdAt).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          +{activity.points} คะแนน
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(activity.weight / 1000).toFixed(2)} กก.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-500 dark:text-gray-400">ยังไม่มีกิจกรรม</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    เริ่มต้นด้วยการบันทึกขยะของคุณ
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 