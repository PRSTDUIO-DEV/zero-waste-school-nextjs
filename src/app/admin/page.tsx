'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface SystemStats {
  totalUsers: number
  totalStudents: number
  totalTeachers: number
  totalWasteRecords: number
  totalWeight: number
  totalPoints: number
  todayRecords: number
  todayWeight: number
}

interface WasteTypeData {
  id: number
  name: string
  description: string | null
  pointFactor: number
  totalRecords: number
  totalWeight: number
}

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [wasteTypes, setWasteTypes] = useState<WasteTypeData[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'wasteTypes' | 'users'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      if (session.user.role !== 'ADMIN') {
        router.push('/dashboard')
      } else {
        fetchAdminData()
      }
    }
  }, [status, router, session])

  const fetchAdminData = async () => {
    try {
      const [statsRes, wasteTypesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/waste-types')
      ])

      if (statsRes.ok && wasteTypesRes.ok) {
        const [statsData, wasteTypesData] = await Promise.all([
          statsRes.json(),
          wasteTypesRes.json()
        ])
        
        setStats(statsData)
        setWasteTypes(wasteTypesData)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session || session.user.role !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">🛠️ Admin Panel</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← กลับสู่หน้าหลัก
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tabs */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ภาพรวมระบบ
                </button>
                <button
                  onClick={() => setActiveTab('wasteTypes')}
                  className={`py-2 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'wasteTypes'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  จัดการประเภทขยะ
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-2 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  จัดการผู้ใช้
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* System Stats */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="text-2xl">👥</div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            ผู้ใช้ทั้งหมด
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {stats.totalUsers} คน
                          </dd>
                          <dd className="text-xs text-gray-500">
                            นักเรียน: {stats.totalStudents} | ครู: {stats.totalTeachers}
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
                        <div className="text-2xl">📝</div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            บันทึกทั้งหมด
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {stats.totalWasteRecords.toLocaleString()} รายการ
                          </dd>
                          <dd className="text-xs text-gray-500">
                            วันนี้: {stats.todayRecords} รายการ
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
                        <div className="text-2xl">⚖️</div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            น้ำหนักรวม
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {(stats.totalWeight / 1000).toFixed(2)} กก.
                          </dd>
                          <dd className="text-xs text-gray-500">
                            วันนี้: {(stats.todayWeight / 1000).toFixed(2)} กก.
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
                            คะแนนรวม
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {stats.totalPoints.toLocaleString()}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">การดำเนินการด่วน</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <button 
                    onClick={() => router.push('/admin/users')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                  >
                    👥 จัดการผู้ใช้
                  </button>
                  <button 
                    onClick={() => router.push('/admin/reports')}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
                  >
                    📊 ดูรายงาน
                  </button>
                  <button 
                    onClick={() => router.push('/admin/export')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-200"
                  >
                    📤 Export ข้อมูล
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wasteTypes' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">ประเภทขยะในระบบ</h3>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 text-sm">
                    + เพิ่มประเภทใหม่
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ชื่อประเภท
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          รายละเอียด
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ตัวคูณคะแนน
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          จำนวนบันทึก
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          น้ำหนักรวม
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          การดำเนินการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {wasteTypes.map((type) => (
                        <tr key={type.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {type.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {type.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            x{type.pointFactor}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {type.totalRecords.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(type.totalWeight / 1000).toFixed(2)} กก.
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-2">
                              แก้ไข
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              ลบ
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">จัดการผู้ใช้</h3>
              <p className="text-gray-500">ฟีเจอร์นี้อยู่ระหว่างการพัฒนา...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 