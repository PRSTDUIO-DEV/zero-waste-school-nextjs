'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface LeaderboardEntry {
  rank: number
  userId: number
  name: string
  role: string
  grade?: number | null
  classSection?: string | null
  totalPoints: number
  totalWeight: number
  badgeCount: number
}

export default function Leaderboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null)
  const [filter, setFilter] = useState<'all' | 'students' | 'myGrade'>('all')
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/leaderboard?filter=${filter}`)
      const data = await res.json()
      
      if (res.ok) {
        setLeaderboard(data.leaderboard)
        setUserRank(data.userRank)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchLeaderboard()
    }
  }, [status, router, filter, fetchLeaderboard])

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) return null

  const { user } = session

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return rank.toString()
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'STUDENT': return 'นักเรียน'
      case 'TEACHER': return 'ครู'
      case 'ADMIN': return 'ผู้ดูแลระบบ'
      default: return role
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">🏆 อันดับคะแนน</h1>
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
          {/* Filter Tabs */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setFilter('all')}
                  className={`py-2 px-4 border-b-2 font-medium text-sm ${
                    filter === 'all'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setFilter('students')}
                  className={`py-2 px-4 border-b-2 font-medium text-sm ${
                    filter === 'students'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  นักเรียนเท่านั้น
                </button>
                {user.role === 'STUDENT' && (
                  <button
                    onClick={() => setFilter('myGrade')}
                    className={`py-2 px-4 border-b-2 font-medium text-sm ${
                      filter === 'myGrade'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    ชั้น ม.{user.grade} เท่านั้น
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* User's Rank Card */}
          {userRank && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 shadow rounded-lg mb-6 text-white">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-2">อันดับของคุณ</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-bold">{getRankIcon(userRank.rank)}</div>
                    <div>
                      <p className="text-2xl font-bold">{userRank.totalPoints.toLocaleString()} คะแนน</p>
                      <p className="text-sm opacity-90">
                        น้ำหนักรวม: {(userRank.totalWeight / 1000).toFixed(2)} กก. • 
                        เหรียญ: {userRank.badgeCount} เหรียญ
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">อันดับที่ {userRank.rank}</p>
                    <p className="text-sm opacity-90">จากทั้งหมด {leaderboard.length} คน</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    อันดับ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    คะแนน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    น้ำหนัก (กก.)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    เหรียญ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((entry) => (
                  <tr 
                    key={entry.userId}
                    className={entry.userId === parseInt(user.id) ? 'bg-green-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-medium text-gray-900">
                        {getRankIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.name}
                        {entry.userId === parseInt(user.id) && (
                          <span className="ml-2 text-green-600">(คุณ)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {getRoleLabel(entry.role)}
                        {entry.role === 'STUDENT' && entry.grade && (
                          <span className="ml-1">
                            ม.{entry.grade}{entry.classSection && `/${entry.classSection}`}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.totalPoints.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {(entry.totalWeight / 1000).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">{entry.badgeCount}</span>
                        {entry.badgeCount > 0 && (
                          <span className="ml-1">🏅</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
} 