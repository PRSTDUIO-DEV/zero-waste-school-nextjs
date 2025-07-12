'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

export const dynamic = 'force-dynamic'

interface DashboardStats {
  recycleWeight: number
  generalWeight: number
  totalPoints: number
  rank: number | string
}

interface RecentActivity {
  id: number
  typeName: string
  weightG: number
  points: number
  recordDt: string
}



export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    recycleWeight: 0,
    generalWeight: 0,
    totalPoints: 0,
    rank: '-'
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
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
        setStats(data.stats)
        setRecentActivities(data.recentActivities)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Zero Waste Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                สวัสดี, {user.name}
                {user.role === 'STUDENT' && user.grade && (
                  <span className="ml-1">
                    (ม.{user.grade}{user.classSection && `/${user.classSection}`})
                  </span>
                )}
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {user.role === 'STUDENT' ? 'นักเรียน' : 
                 user.role === 'TEACHER' ? 'ครู' : 'ผู้ดูแลระบบ'}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">♻️</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        ขยะรีไซเคิล (กิโลกรัม)
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {(stats.recycleWeight / 1000).toFixed(2)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🗑️</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        ขยะทั่วไป (กิโลกรัม)
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {(stats.generalWeight / 1000).toFixed(2)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">⭐</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        คะแนนทั้งหมด
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalPoints.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🏆</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        อันดับ
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.rank}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  การดำเนินการด่วน
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <button 
                    onClick={() => router.push('/waste/record')}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200">
                    📝 บันทึกขยะ
                  </button>
                  <button 
                    onClick={() => router.push('/statistics')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200">
                    📊 ดูสถิติ
                  </button>
                  <button 
                    onClick={() => router.push('/leaderboard')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-200">
                    🏆 อันดับ
                  </button>
                  {user.role === 'ADMIN' && (
                    <button 
                      onClick={() => router.push('/admin')}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200">
                      🛠️ Admin Panel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  กิจกรรมล่าสุด
                </h3>
                {recentActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    ยังไม่มีข้อมูลกิจกรรม
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex justify-between items-center py-3 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.typeName}</p>
                          <p className="text-sm text-gray-500">
                            {(activity.weightG / 1000).toFixed(2)} กก. • {activity.points} คะแนน
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(activity.recordDt).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 