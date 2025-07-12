'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface WasteType {
  id: number
  name: string
  description: string | null
  pointFactor: number
}

export default function RecordWaste() {
  const { status } = useSession()
  const router = useRouter()
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([])
  const [formData, setFormData] = useState<{ [key: number]: string }>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    fetchWasteTypes()
  }, [])

  const fetchWasteTypes = async () => {
    try {
      const res = await fetch('/api/waste/types')
      const data = await res.json()
      setWasteTypes(data)
      // Initialize form data
      const initialData: { [key: number]: string } = {}
      data.forEach((type: WasteType) => {
        initialData[type.id] = ''
      })
      setFormData(initialData)
    } catch {
      console.error('Error fetching waste types')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Filter out empty values and convert to records
    const records = Object.entries(formData)
      .filter(([, weight]) => weight && parseFloat(weight) > 0)
      .map(([typeId, weight]) => ({
        typeId: parseInt(typeId),
        weightG: Math.round(parseFloat(weight) * 1000) // Convert kg to grams
      }))

    if (records.length === 0) {
      setMessage({ type: 'error', text: 'กรุณากรอกน้ำหนักอย่างน้อย 1 ประเภท' })
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/waste/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: `บันทึกสำเร็จ! ได้รับ ${data.totalPoints} คะแนน` })
        // Reset form
        const resetData: { [key: number]: string } = {}
        wasteTypes.forEach((type) => {
          resetData[type.id] = ''
        })
        setFormData(resetData)
        
        // Check for new badges
        if (data.newBadges && data.newBadges.length > 0) {
          setTimeout(() => {
            alert(`🎉 ยินดีด้วย! คุณได้รับเหรียญใหม่: ${data.newBadges.map((b: { name: string }) => b.name).join(', ')}`)
          }, 500)
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'เกิดข้อผิดพลาด' })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึก' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (typeId: number, value: string) => {
    setFormData(prev => ({ ...prev, [typeId]: value }))
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">บันทึกขยะ</h1>
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
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  กรอกน้ำหนักขยะแต่ละประเภท (หน่วย: กิโลกรัม)
                </h2>
                
                {message && (
                  <div className={`mb-4 p-4 rounded-md ${
                    message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {message.text}
                  </div>
                )}

                <div className="space-y-4">
                  {wasteTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <label htmlFor={`waste-${type.id}`} className="block text-sm font-medium text-gray-700">
                          {type.name}
                          {type.description && (
                            <span className="text-gray-500 font-normal ml-2">({type.description})</span>
                          )}
                          <span className="text-green-600 font-normal ml-2">
                            x{type.pointFactor} คะแนน/กก.
                          </span>
                        </label>
                        <input
                          type="number"
                          id={`waste-${type.id}`}
                          value={formData[type.id] || ''}
                          onChange={(e) => handleInputChange(type.id, e.target.value)}
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                      </div>
                      {formData[type.id] && parseFloat(formData[type.id]) > 0 && (
                        <div className="text-sm text-gray-500">
                          = {Math.round(parseFloat(formData[type.id]) * type.pointFactor * 1000)} คะแนน
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-lg font-medium">
                  คะแนนรวม: {
                    Object.entries(formData)
                      .filter(([, weight]) => weight && parseFloat(weight) > 0)
                      .reduce((total, [typeId, weight]) => {
                        const type = wasteTypes.find(t => t.id === parseInt(typeId))
                        return total + (type ? parseFloat(weight) * type.pointFactor * 1000 : 0)
                      }, 0)
                  } คะแนน
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-200 disabled:opacity-50"
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">วิธีการบันทึก</h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>ชั่งน้ำหนักขยะแต่ละประเภทเป็นกิโลกรัม</li>
              <li>กรอกน้ำหนักในช่องที่ตรงกับประเภทขยะ</li>
              <li>ระบบจะคำนวณคะแนนให้อัตโนมัติ</li>
              <li>สามารถบันทึกหลายประเภทพร้อมกันได้</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
} 