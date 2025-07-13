import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, role: true, grade: true, classSection: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all users with their waste records
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        grade: true,
        classSection: true,
        wasteRecords: {
          select: {
            points: true,
            weightG: true
          }
        }
      }
    })

    // Calculate user statistics and rankings
    const userStats = users.map(user => ({
      id: user.id,
      name: user.name,
      role: user.role,
      grade: user.grade,
      classSection: user.classSection,
      totalPoints: user.wasteRecords.reduce((sum, record) => sum + record.points, 0),
      totalWeight: user.wasteRecords.reduce((sum, record) => sum + record.weightG, 0),
      recordCount: user.wasteRecords.length,
      isCurrentUser: user.id === currentUser.id
    }))

    // Sort by total points (descending)
    const sortedUsers = userStats
      .filter(user => user.totalPoints > 0) // Only include users with points
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }))

    // Find current user in the rankings
    const currentUserRank = sortedUsers.find(user => user.isCurrentUser)

    // Category breakdowns
    const categories = {
      overall: sortedUsers,
      students: sortedUsers.filter(user => user.role === 'STUDENT'),
      teachers: sortedUsers.filter(user => user.role === 'TEACHER'),
      byGrade: {} as { [key: string]: typeof sortedUsers }
    }

    // Group students by grade
    for (let grade = 1; grade <= 6; grade++) {
      const gradeUsers = sortedUsers
        .filter(user => user.role === 'STUDENT' && user.grade === grade)
        .map((user, index) => ({
          ...user,
          rank: index + 1 // Re-rank within grade
        }))
      
      categories.byGrade[grade.toString()] = gradeUsers
    }

    // Get top class (if applicable)
    const topClass = null // Placeholder - would need more complex logic

    return NextResponse.json({
      users: sortedUsers,
      currentUser: currentUserRank || null,
      totalParticipants: sortedUsers.length,
      topClass,
      categories
    })

  } catch (error) {
    console.error('Leaderboard API error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลอันดับ' },
      { status: 500 }
    )
  }
} 