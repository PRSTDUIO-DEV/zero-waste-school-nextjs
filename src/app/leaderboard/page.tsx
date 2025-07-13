'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface LeaderboardUser {
  id: number
  name: string
  role: string
  grade?: number
  classSection?: string
  totalPoints: number
  totalWeight: number
  recordCount: number
  rank: number
  badge?: string
  isCurrentUser?: boolean
}

interface LeaderboardData {
  users: LeaderboardUser[]
  currentUser: LeaderboardUser | null
  totalParticipants: number
  topClass?: {
    grade: number
    classSection: string
    averagePoints: number
  }
  categories: {
    overall: LeaderboardUser[]
    students: LeaderboardUser[]
    teachers: LeaderboardUser[]
    byGrade: { [key: string]: LeaderboardUser[] }
  }
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession()
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'overall' | 'students' | 'teachers' | 'grade'>('overall')
  const [selectedGrade, setSelectedGrade] = useState<string>('1')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      redirect('/auth/signin')
    }

    fetchLeaderboard()
  }, [session, status])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/leaderboard')
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data)
      } else {
        setError('ไม่สามารถโหลดข้อมูลอันดับได้')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-900 bg-pattern flex items-center justify-center">
        <div className="glass-card p-12 text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-emerald-500 mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-gradient mb-4">กำลังโหลดอันดับ...</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">กรุณารอสักครู่</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-900 bg-pattern flex items-center justify-center">
        <div className="glass-card p-12 text-center">
          <div className="text-8xl mb-6">❌</div>
          <h2 className="text-3xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary px-8 py-4 text-lg"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    )
  }

  if (!leaderboard) return null

  const getCurrentRankingList = () => {
    switch (selectedCategory) {
      case 'students':
        return leaderboard.categories.students
      case 'teachers':
        return leaderboard.categories.teachers
      case 'grade':
        return leaderboard.categories.byGrade[selectedGrade] || []
      default:
        return leaderboard.categories.overall
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return '🏅'
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500'
      case 2: return 'text-gray-400'
      case 3: return 'text-amber-600'
      default: return 'text-gray-500'
    }
  }

  const user = session?.user

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-900 bg-pattern">
      {/* Premium Header */}
      <header className="glass-header sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="glass-button p-3 hover:scale-110 transition-transform">
                <span className="text-2xl">←</span>
              </Link>
              <div className="w-16 h-16 bg-gradient-luxury rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-luxury">
                <span className="text-3xl">🏆</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gradient-luxury">
                  อันดับคะแนน
                </h1>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide">
                  🎯 Competition Leaderboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="glass-button px-4 py-2 font-semibold">
                👥 {leaderboard.totalParticipants} คน
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Current User Position */}
          {leaderboard.currentUser && (
            <div className="glass-card">
              <div className="bg-gradient-luxury text-white px-8 py-6 rounded-t-3xl">
                <h2 className="text-3xl font-bold flex items-center">
                  <span className="mr-4 animate-float">🎯</span>
                  ตำแหน่งของคุณ
                </h2>
              </div>
              <div className="p-8">
                <div className="flex items-center space-x-8 p-6 glass-card">
                  <div className="text-6xl animate-pulse-luxury">
                    {getRankIcon(leaderboard.currentUser.rank)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gradient mb-2">
                      {leaderboard.currentUser.name}
                    </h3>
                    <div className="flex items-center space-x-6 text-lg">
                      <span className="glass-button px-3 py-1 text-sm">
                        {leaderboard.currentUser.role === 'STUDENT' ? '🎓 นักเรียน' : '👨‍🏫 ครู'}
                      </span>
                      {leaderboard.currentUser.grade && (
                        <span className="glass-button px-3 py-1 text-sm">
                          ม.{leaderboard.currentUser.grade}
                          {leaderboard.currentUser.classSection && `/${leaderboard.currentUser.classSection}`}
                        </span>
                      )}
                      {leaderboard.currentUser.badge && (
                        <span className="glass-button px-3 py-1 text-sm bg-gradient-accent text-white">
                          {leaderboard.currentUser.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-gradient mb-2">
                      #{leaderboard.currentUser.rank}
                    </p>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                      {leaderboard.currentUser.totalPoints.toLocaleString()} คะแนน
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(leaderboard.currentUser.totalWeight / 1000).toFixed(2)} กก.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category Selector */}
          <div className="glass-card p-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setSelectedCategory('overall')}
                className={`btn ${selectedCategory === 'overall' ? 'btn-primary' : 'btn-glass'} px-6 py-3`}
              >
                <span className="mr-2">🏆</span>
                อันดับรวม
              </button>
              <button
                onClick={() => setSelectedCategory('students')}
                className={`btn ${selectedCategory === 'students' ? 'btn-primary' : 'btn-glass'} px-6 py-3`}
              >
                <span className="mr-2">🎓</span>
                นักเรียน
              </button>
              <button
                onClick={() => setSelectedCategory('teachers')}
                className={`btn ${selectedCategory === 'teachers' ? 'btn-primary' : 'btn-glass'} px-6 py-3`}
              >
                <span className="mr-2">👨‍🏫</span>
                ครู
              </button>
              <button
                onClick={() => setSelectedCategory('grade')}
                className={`btn ${selectedCategory === 'grade' ? 'btn-primary' : 'btn-glass'} px-6 py-3`}
              >
                <span className="mr-2">📚</span>
                ตามชั้น
              </button>
            </div>

            {selectedCategory === 'grade' && (
              <div className="mt-6 flex justify-center">
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="glass-button px-4 py-2 font-semibold"
                >
                  <option value="1">มัธยมศึกษาปีที่ 1</option>
                  <option value="2">มัธยมศึกษาปีที่ 2</option>
                  <option value="3">มัธยมศึกษาปีที่ 3</option>
                  <option value="4">มัธยมศึกษาปีที่ 4</option>
                  <option value="5">มัธยมศึกษาปีที่ 5</option>
                  <option value="6">มัธยมศึกษาปีที่ 6</option>
                </select>
              </div>
            )}
          </div>

          {/* Top 3 Podium */}
          <div className="glass-card">
            <div className="bg-gradient-accent text-white px-8 py-6 rounded-t-3xl">
              <h2 className="text-3xl font-bold flex items-center">
                <span className="mr-4 animate-float">🏆</span>
                Top 3 Champions
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {getCurrentRankingList().slice(0, 3).map((user, index) => (
                  <div key={user.id} className={`glass-card p-6 text-center ${user.isCurrentUser ? 'ring-4 ring-emerald-500' : ''}`}>
                    <div className="text-8xl mb-4 animate-pulse-luxury">
                      {getRankIcon(user.rank)}
                    </div>
                    <h3 className="text-2xl font-bold text-gradient mb-2">
                      {user.name}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <span className="glass-button px-3 py-1 text-sm">
                        {user.role === 'STUDENT' ? '🎓 นักเรียน' : '👨‍🏫 ครู'}
                      </span>
                      {user.grade && (
                        <div className="glass-button px-3 py-1 text-sm">
                          ม.{user.grade}{user.classSection && `/${user.classSection}`}
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gradient mb-2">
                        {user.totalPoints.toLocaleString()}
                      </p>
                      <p className="text-lg text-gray-600 dark:text-gray-300">คะแนน</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(user.totalWeight / 1000).toFixed(2)} กก. | {user.recordCount} ครั้ง
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full Leaderboard */}
          <div className="glass-card">
            <div className="bg-gradient-primary text-white px-8 py-6 rounded-t-3xl">
              <h2 className="text-3xl font-bold flex items-center">
                <span className="mr-4 animate-float">📊</span>
                อันดับทั้งหมด
              </h2>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {getCurrentRankingList().map((user, index) => (
                  <div 
                    key={user.id} 
                    className={`glass-card p-6 hover:scale-102 transition-all duration-300 ${
                      user.isCurrentUser ? 'ring-4 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-6">
                      <div className="text-center min-w-[80px]">
                        <div className="text-4xl mb-2">
                          {getRankIcon(user.rank)}
                        </div>
                        <div className={`text-2xl font-bold ${getRankColor(user.rank)}`}>
                          #{user.rank}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gradient mb-2">
                          {user.name}
                          {user.isCurrentUser && (
                            <span className="ml-2 text-sm bg-gradient-luxury text-white px-2 py-1 rounded-full">
                              คุณ
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="glass-button px-3 py-1">
                            {user.role === 'STUDENT' ? '🎓 นักเรียน' : '👨‍🏫 ครู'}
                          </span>
                          {user.grade && (
                            <span className="glass-button px-3 py-1">
                              ม.{user.grade}{user.classSection && `/${user.classSection}`}
                            </span>
                          )}
                          {user.badge && (
                            <span className="glass-button px-3 py-1 bg-gradient-accent text-white">
                              {user.badge}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gradient mb-1">
                          {user.totalPoints.toLocaleString()}
                        </p>
                        <p className="text-lg text-gray-600 dark:text-gray-300">คะแนน</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(user.totalWeight / 1000).toFixed(2)} กก.
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {user.recordCount} ครั้ง
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {getCurrentRankingList().length === 0 && (
                <div className="text-center py-20">
                  <div className="text-9xl mb-8 animate-float">🏆</div>
                  <h3 className="text-3xl font-bold text-gradient mb-6">
                    ยังไม่มีข้อมูลอันดับ
                  </h3>
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
                    เริ่มต้นด้วยการบันทึกขยะเพื่อแข่งขันกัน
                  </p>
                  <Link 
                    href="/waste/record"
                    className="btn btn-primary px-10 py-4 text-xl"
                  >
                    <span className="mr-3">🚀</span>
                    เริ่มแข่งขัน
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Motivation Section */}
          <div className="text-center glass-card p-12">
            <h3 className="text-4xl font-bold text-gradient-luxury mb-6">
              <span className="animate-float">🌟</span> เป้าหมายของเรา <span className="animate-float animation-delay-1000">🎯</span>
            </h3>
            <p className="text-2xl font-medium text-gray-600 dark:text-gray-300 mb-8">
              ร่วมกันสร้างโรงเรียนที่ปลอดขยะ เพื่อโลกที่ยั่งยืน
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/dashboard" className="btn btn-secondary px-8 py-4 text-lg">
                <span className="mr-3">🏠</span>
                กลับหน้าหลัก
              </Link>
              <Link href="/waste/record" className="btn btn-primary px-8 py-4 text-lg">
                <span className="mr-3">📝</span>
                บันทึกขยะใหม่
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 