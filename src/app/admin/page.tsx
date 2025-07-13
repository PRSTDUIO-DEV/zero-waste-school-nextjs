'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: number
  name: string
  email: string
  role: string
  grade?: number
  classSection?: string
  createdAt: string
  totalPoints: number
  totalRecords: number
  isActive: boolean
}

interface WasteType {
  id: number
  name: string
  description?: string
  pointsPerG: number
  category: string
  isActive: boolean
}

interface AdminStats {
  totalUsers: number
  totalStudents: number
  totalTeachers: number
  totalWasteRecords: number
  totalWasteWeight: number
  totalPointsAwarded: number
  activeUsers: number
  newUsersThisMonth: number
  recordsThisMonth: number
}

interface SystemSettings {
  schoolName: string
  maxDailyRecords: number
  pointsMultiplier: number
  maintenanceMode: boolean
  registrationEnabled: boolean
}

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'waste-types' | 'statistics' | 'settings'>('overview')

  // Data states
  const [users, setUsers] = useState<User[]>([])
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([])
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [, setSystemSettings] = useState<SystemSettings | null>(null)

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false)
  const [showWasteTypeModal, setShowWasteTypeModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editingWasteType, setEditingWasteType] = useState<WasteType | null>(null)

  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'STUDENT',
    grade: '',
    classSection: '',
    password: ''
  })

  const [wasteTypeForm, setWasteTypeForm] = useState({
    name: '',
    description: '',
    pointsPerG: 0,
    category: 'ทั่วไป'
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      redirect('/auth/signin')
    }
    if (session.user.role !== 'ADMIN') {
      redirect('/dashboard')
    }

    fetchData()
  }, [session, status])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchUsers(),
        fetchWasteTypes(),
        fetchAdminStats(),
        fetchSystemSettings()
      ])
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  const fetchWasteTypes = async () => {
    try {
      const response = await fetch('/api/admin/waste-types')
      if (response.ok) {
        const data = await response.json()
        setWasteTypes(data)
      }
    } catch (err) {
      console.error('Error fetching waste types:', err)
    }
  }

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/statistics')
      if (response.ok) {
        const data = await response.json()
        setAdminStats(data)
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err)
    }
  }

  const fetchSystemSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSystemSettings(data)
      }
    } catch (err) {
      console.error('Error fetching system settings:', err)
    }
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users'
      const method = editingUser ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      })

      if (response.ok) {
        setSuccess(editingUser ? 'อัปเดตผู้ใช้สำเร็จ' : 'เพิ่มผู้ใช้สำเร็จ')
        setShowUserModal(false)
        setEditingUser(null)
        setUserForm({ name: '', email: '', role: 'STUDENT', grade: '', classSection: '', password: '' })
        fetchUsers()
      } else {
        const data = await response.json()
        setError(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการบันทึก')
    }
  }

  const handleWasteTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const url = editingWasteType ? `/api/admin/waste-types/${editingWasteType.id}` : '/api/admin/waste-types'
      const method = editingWasteType ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wasteTypeForm)
      })

      if (response.ok) {
        setSuccess(editingWasteType ? 'อัปเดตประเภทขยะสำเร็จ' : 'เพิ่มประเภทขยะสำเร็จ')
        setShowWasteTypeModal(false)
        setEditingWasteType(null)
        setWasteTypeForm({ name: '', description: '', pointsPerG: 0, category: 'ทั่วไป' })
        fetchWasteTypes()
      } else {
        const data = await response.json()
        setError(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการบันทึก')
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) return

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('ลบผู้ใช้สำเร็จ')
        fetchUsers()
      } else {
        setError('เกิดข้อผิดพลาดในการลบผู้ใช้')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการลบผู้ใช้')
    }
  }

  const handleDeleteWasteType = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบประเภทขยะนี้?')) return

    try {
      const response = await fetch(`/api/admin/waste-types/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('ลบประเภทขยะสำเร็จ')
        fetchWasteTypes()
      } else {
        setError('เกิดข้อผิดพลาดในการลบประเภทขยะ')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการลบประเภทขยะ')
    }
  }

  const openEditUser = (user: User) => {
    setEditingUser(user)
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      grade: user.grade?.toString() || '',
      classSection: user.classSection || '',
      password: ''
    })
    setShowUserModal(true)
  }

  const openEditWasteType = (wasteType: WasteType) => {
    setEditingWasteType(wasteType)
    setWasteTypeForm({
      name: wasteType.name,
      description: wasteType.description || '',
      pointsPerG: wasteType.pointsPerG,
      category: wasteType.category
    })
    setShowWasteTypeModal(true)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-900 bg-pattern flex items-center justify-center">
        <div className="glass-card p-12 text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-emerald-500 mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-gradient mb-4">กำลังโหลด Admin Panel...</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">กรุณารอสักครู่</p>
        </div>
      </div>
    )
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
                <span className="text-3xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gradient-luxury">
                  Admin Panel
                </h1>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide">
                  🔧 System Management
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="glass-button px-4 py-2 font-semibold">
                👨‍💼 {user?.name}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Tab Navigation */}
          <div className="glass-card p-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setActiveTab('overview')}
                className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-glass'} px-6 py-3`}
              >
                <span className="mr-2">📊</span>
                ภาพรวม
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-glass'} px-6 py-3`}
              >
                <span className="mr-2">👥</span>
                จัดการผู้ใช้
              </button>
              <button
                onClick={() => setActiveTab('waste-types')}
                className={`btn ${activeTab === 'waste-types' ? 'btn-primary' : 'btn-glass'} px-6 py-3`}
              >
                <span className="mr-2">🗑️</span>
                ประเภทขยะ
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className={`btn ${activeTab === 'statistics' ? 'btn-primary' : 'btn-glass'} px-6 py-3`}
              >
                <span className="mr-2">📈</span>
                สถิติ
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-glass'} px-6 py-3`}
              >
                <span className="mr-2">⚙️</span>
                ตั้งค่า
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="glass-card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 p-6">
              <div className="flex items-center">
                <span className="text-3xl mr-4">✅</span>
                <p className="text-green-600 dark:text-green-400 font-medium text-lg">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="glass-card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-6">
              <div className="flex items-center">
                <span className="text-3xl mr-4">❌</span>
                <p className="text-red-600 dark:text-red-400 font-medium text-lg">{error}</p>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && adminStats && (
            <div className="space-y-8">
              <div className="glass-card">
                <div className="bg-gradient-luxury text-white px-8 py-6 rounded-t-3xl">
                  <h2 className="text-3xl font-bold flex items-center">
                    <span className="mr-4 animate-float">📊</span>
                    ภาพรวมระบบ
                  </h2>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="stat-card">
                      <div className="text-center">
                        <div className="text-5xl mb-4 animate-float">👥</div>
                        <p className="stat-number text-blue-600 dark:text-blue-400">
                          {adminStats.totalUsers}
                        </p>
                        <p className="stat-label">ผู้ใช้ทั้งหมด</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="text-center">
                        <div className="text-5xl mb-4 animate-float animation-delay-1000">📝</div>
                        <p className="stat-number text-emerald-600 dark:text-emerald-400">
                          {adminStats.totalWasteRecords}
                        </p>
                        <p className="stat-label">บันทึกขยะ</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="text-center">
                        <div className="text-5xl mb-4 animate-float animation-delay-2000">⚖️</div>
                        <p className="stat-number text-purple-600 dark:text-purple-400">
                          {(adminStats.totalWasteWeight / 1000).toFixed(1)}
                        </p>
                        <p className="stat-label">กิโลกรัม</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="text-center">
                        <div className="text-5xl mb-4 animate-float animation-delay-3000">⭐</div>
                        <p className="stat-number text-orange-600 dark:text-orange-400">
                          {adminStats.totalPointsAwarded.toLocaleString()}
                        </p>
                        <p className="stat-label">คะแนนรวม</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card">
                  <div className="bg-gradient-primary text-white px-8 py-6 rounded-t-3xl">
                    <h3 className="text-2xl font-bold">📈 สถิติเดือนนี้</h3>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">ผู้ใช้ใหม่</span>
                      <span className="text-2xl font-bold text-gradient">{adminStats.newUsersThisMonth}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">บันทึกใหม่</span>
                      <span className="text-2xl font-bold text-gradient">{adminStats.recordsThisMonth}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">ผู้ใช้ที่ใช้งาน</span>
                      <span className="text-2xl font-bold text-gradient">{adminStats.activeUsers}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card">
                  <div className="bg-gradient-secondary text-white px-8 py-6 rounded-t-3xl">
                    <h3 className="text-2xl font-bold">👥 ประเภทผู้ใช้</h3>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">🎓 นักเรียน</span>
                      <span className="text-2xl font-bold text-gradient">{adminStats.totalStudents}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">👨‍🏫 ครู</span>
                      <span className="text-2xl font-bold text-gradient">{adminStats.totalTeachers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">👨‍💼 ผู้ดูแล</span>
                      <span className="text-2xl font-bold text-gradient">{adminStats.totalUsers - adminStats.totalStudents - adminStats.totalTeachers}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-8">
              <div className="glass-card">
                <div className="bg-gradient-luxury text-white px-8 py-6 rounded-t-3xl flex justify-between items-center">
                  <h2 className="text-3xl font-bold flex items-center">
                    <span className="mr-4 animate-float">👥</span>
                    จัดการผู้ใช้
                  </h2>
                  <button
                    onClick={() => {
                      setEditingUser(null)
                      setUserForm({ name: '', email: '', role: 'STUDENT', grade: '', classSection: '', password: '' })
                      setShowUserModal(true)
                    }}
                    className="btn btn-glass px-6 py-3"
                  >
                    <span className="mr-2">➕</span>
                    เพิ่มผู้ใช้
                  </button>
                </div>
                <div className="p-8">
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="glass-card p-6 hover:scale-102 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <div className="text-4xl">
                              {user.role === 'STUDENT' ? '🎓' : user.role === 'TEACHER' ? '👨‍🏫' : '👨‍💼'}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gradient">{user.name}</h3>
                              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="glass-button px-3 py-1 text-sm">
                                  {user.role === 'STUDENT' ? 'นักเรียน' : user.role === 'TEACHER' ? 'ครู' : 'ผู้ดูแล'}
                                </span>
                                {user.grade && (
                                  <span className="glass-button px-3 py-1 text-sm">
                                    ม.{user.grade}{user.classSection && `/${user.classSection}`}
                                  </span>
                                )}
                                <span className={`glass-button px-3 py-1 text-sm ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {user.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-lg font-bold text-gradient">{user.totalPoints.toLocaleString()}</p>
                              <p className="text-sm text-gray-500">คะแนน</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gradient">{user.totalRecords}</p>
                              <p className="text-sm text-gray-500">บันทึก</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditUser(user)}
                                className="btn btn-secondary px-4 py-2"
                              >
                                ✏️ แก้ไข
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="btn btn-glass px-4 py-2 text-red-600"
                              >
                                🗑️ ลบ
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Waste Types Tab */}
          {activeTab === 'waste-types' && (
            <div className="space-y-8">
              <div className="glass-card">
                <div className="bg-gradient-luxury text-white px-8 py-6 rounded-t-3xl flex justify-between items-center">
                  <h2 className="text-3xl font-bold flex items-center">
                    <span className="mr-4 animate-float">🗑️</span>
                    ประเภทขยะ
                  </h2>
                  <button
                    onClick={() => {
                      setEditingWasteType(null)
                      setWasteTypeForm({ name: '', description: '', pointsPerG: 0, category: 'ทั่วไป' })
                      setShowWasteTypeModal(true)
                    }}
                    className="btn btn-glass px-6 py-3"
                  >
                    <span className="mr-2">➕</span>
                    เพิ่มประเภท
                  </button>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wasteTypes.map((type) => (
                      <div key={type.id} className="glass-card p-6 hover:scale-102 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-4xl">
                              {type.category === 'รีไซเคิล' ? '♻️' : 
                               type.category === 'อินทรีย์' ? '🌱' : 
                               type.category === 'อันตราย' ? '☢️' : '🗑️'}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gradient">{type.name}</h3>
                              <p className="text-gray-600 dark:text-gray-300">{type.description}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="glass-button px-3 py-1 text-sm">
                                  {type.category}
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  {type.pointsPerG} คะแนน/กรัม
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditWasteType(type)}
                              className="btn btn-secondary px-4 py-2"
                            >
                              ✏️ แก้ไข
                            </button>
                            <button
                              onClick={() => handleDeleteWasteType(type.id)}
                              className="btn btn-glass px-4 py-2 text-red-600"
                            >
                              🗑️ ลบ
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && adminStats && (
            <div className="space-y-8">
              <div className="glass-card">
                <div className="bg-gradient-luxury text-white px-8 py-6 rounded-t-3xl">
                  <h2 className="text-3xl font-bold flex items-center">
                    <span className="mr-4 animate-float">📈</span>
                    สถิติระบบ
                  </h2>
                </div>
                <div className="p-8">
                  <div className="text-center py-20">
                    <div className="text-9xl mb-8 animate-float">📊</div>
                    <h3 className="text-3xl font-bold text-gradient mb-6">
                      สถิติรายละเอียด
                    </h3>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                      กำลังพัฒนาระบบสถิติขั้นสูง
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="glass-card p-6">
                        <h4 className="text-xl font-bold text-gradient mb-4">การใช้งานรายวัน</h4>
                        <p className="text-3xl font-bold text-gradient">{adminStats.recordsThisMonth}</p>
                        <p className="text-sm text-gray-500">บันทึกเดือนนี้</p>
                      </div>
                      <div className="glass-card p-6">
                        <h4 className="text-xl font-bold text-gradient mb-4">ผู้ใช้ที่ใช้งาน</h4>
                        <p className="text-3xl font-bold text-gradient">{adminStats.activeUsers}</p>
                        <p className="text-sm text-gray-500">จาก {adminStats.totalUsers} คน</p>
                      </div>
                      <div className="glass-card p-6">
                        <h4 className="text-xl font-bold text-gradient mb-4">อัตราการเติบโต</h4>
                        <p className="text-3xl font-bold text-gradient">{adminStats.newUsersThisMonth}</p>
                        <p className="text-sm text-gray-500">ผู้ใช้ใหม่เดือนนี้</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div className="glass-card">
                <div className="bg-gradient-luxury text-white px-8 py-6 rounded-t-3xl">
                  <h2 className="text-3xl font-bold flex items-center">
                    <span className="mr-4 animate-float">⚙️</span>
                    ตั้งค่าระบบ
                  </h2>
                </div>
                <div className="p-8">
                  <div className="text-center py-20">
                    <div className="text-9xl mb-8 animate-float">🔧</div>
                    <h3 className="text-3xl font-bold text-gradient mb-6">
                      การตั้งค่าระบบ
                    </h3>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                      กำลังพัฒนาระบบการตั้งค่า
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="glass-card p-6">
                        <h4 className="text-xl font-bold text-gradient mb-4">การตั้งค่าทั่วไป</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>ชื่อโรงเรียน</span>
                            <span className="font-bold">Zero Waste School</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>โหมดบำรุงรักษา</span>
                            <span className="text-green-600">ปิด</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>การสมัครสมาชิก</span>
                            <span className="text-green-600">เปิด</span>
                          </div>
                        </div>
                      </div>
                      <div className="glass-card p-6">
                        <h4 className="text-xl font-bold text-gradient mb-4">การตั้งค่าคะแนน</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>ตัวคูณคะแนน</span>
                            <span className="font-bold">1.0x</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>บันทึกสูงสุด/วัน</span>
                            <span className="font-bold">10</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>รีเซ็ตคะแนน</span>
                            <span className="text-red-600">ไม่เคย</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-card max-w-md w-full mx-4">
            <div className="bg-gradient-luxury text-white px-6 py-4 rounded-t-3xl">
              <h3 className="text-2xl font-bold">
                {editingUser ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="form-label">ชื่อ-นามสกุล</label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">อีเมล</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                    className="form-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">ประเภทผู้ใช้</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                    className="form-input w-full"
                  >
                    <option value="STUDENT">นักเรียน</option>
                    <option value="TEACHER">ครู</option>
                    <option value="ADMIN">ผู้ดูแลระบบ</option>
                  </select>
                </div>
                {userForm.role === 'STUDENT' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">ชั้น</label>
                      <select
                        value={userForm.grade}
                        onChange={(e) => setUserForm(prev => ({ ...prev, grade: e.target.value }))}
                        className="form-input w-full"
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
                      <label className="form-label">ห้อง</label>
                      <input
                        type="text"
                        value={userForm.classSection}
                        onChange={(e) => setUserForm(prev => ({ ...prev, classSection: e.target.value }))}
                        className="form-input w-full"
                        placeholder="เช่น 1, 2, 3"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="form-label">
                    รหัสผ่าน {editingUser && '(เว้นว่างหากไม่ต้องการเปลี่ยน)'}
                  </label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                    className="form-input w-full"
                    required={!editingUser}
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    {editingUser ? 'อัปเดต' : 'เพิ่ม'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserModal(false)
                      setEditingUser(null)
                    }}
                    className="btn btn-glass flex-1"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Waste Type Modal */}
      {showWasteTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-card max-w-md w-full mx-4">
            <div className="bg-gradient-luxury text-white px-6 py-4 rounded-t-3xl">
              <h3 className="text-2xl font-bold">
                {editingWasteType ? 'แก้ไขประเภทขยะ' : 'เพิ่มประเภทขยะใหม่'}
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleWasteTypeSubmit} className="space-y-4">
                <div>
                  <label className="form-label">ชื่อประเภท</label>
                  <input
                    type="text"
                    value={wasteTypeForm.name}
                    onChange={(e) => setWasteTypeForm(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">คำอธิบาย</label>
                  <textarea
                    value={wasteTypeForm.description}
                    onChange={(e) => setWasteTypeForm(prev => ({ ...prev, description: e.target.value }))}
                    className="form-input w-full h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="form-label">หมวดหมู่</label>
                  <select
                    value={wasteTypeForm.category}
                    onChange={(e) => setWasteTypeForm(prev => ({ ...prev, category: e.target.value }))}
                    className="form-input w-full"
                  >
                    <option value="ทั่วไป">ทั่วไป</option>
                    <option value="รีไซเคิล">รีไซเคิล</option>
                    <option value="อินทรีย์">อินทรีย์</option>
                    <option value="อันตราย">อันตราย</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">คะแนนต่อกรัม</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={wasteTypeForm.pointsPerG}
                    onChange={(e) => setWasteTypeForm(prev => ({ ...prev, pointsPerG: parseFloat(e.target.value) || 0 }))}
                    className="form-input w-full"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    {editingWasteType ? 'อัปเดต' : 'เพิ่ม'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWasteTypeModal(false)
                      setEditingWasteType(null)
                    }}
                    className="btn btn-glass flex-1"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 