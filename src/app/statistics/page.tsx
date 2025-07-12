'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface WasteByType {
  name: string
  weight: number
  percentage: number
}

interface DailyData {
  date: string
  weight: number
  points: number
}

interface MonthlyData {
  month: string
  weight: number
  points: number
}

export default function Statistics() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [wasteByType, setWasteByType] = useState<WasteByType[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [totalWeight, setTotalWeight] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchStatistics()
    }
  }, [status, router])

  const fetchStatistics = async () => {
    try {
      const res = await fetch('/api/statistics')
      const data = await res.json()
      
      if (res.ok) {
        setWasteByType(data.wasteByType)
        setDailyData(data.dailyData)
        setMonthlyData(data.monthlyData)
        setTotalWeight(data.totalWeight)
        setTotalPoints(data.totalPoints)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) return null

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">สถิติการทิ้งขยะ</h1>
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-3xl">⚖️</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        น้ำหนักรวมทั้งหมด
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {(totalWeight / 1000).toFixed(2)} กก.
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
                    <div className="text-3xl">⭐</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        คะแนนรวมทั้งหมด
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {totalPoints.toLocaleString()} คะแนน
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-8">
            {/* Waste by Type Pie Chart */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">สัดส่วนขยะแต่ละประเภท</h3>
              {wasteByType.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={wasteByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="weight"
                    >
                      {wasteByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${(value / 1000).toFixed(2)} กก.`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">ยังไม่มีข้อมูล</div>
              )}
            </div>

            {/* Daily Trend Line Chart */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">แนวโน้มรายวัน (7 วันล่าสุด)</h3>
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="weight"
                      stroke="#10B981"
                      name="น้ำหนัก (กรัม)"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="points"
                      stroke="#3B82F6"
                      name="คะแนน"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">ยังไม่มีข้อมูล</div>
              )}
            </div>

            {/* Monthly Bar Chart */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">สรุปรายเดือน</h3>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="weight" fill="#10B981" name="น้ำหนัก (กรัม)" />
                    <Bar dataKey="points" fill="#3B82F6" name="คะแนน" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">ยังไม่มีข้อมูล</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 