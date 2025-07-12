import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let filter = 'all'
    try {
      const { searchParams } = new URL(request.url)
      filter = searchParams.get('filter') || 'all'
    } catch (error) {
      // Handle invalid URL during build time
      console.warn('Invalid URL during build time:', request.url)
    }
    const currentUserId = parseInt(session.user.id)

    // Build where clause based on filter
    let whereClause: Record<string, unknown> = {}
    
    if (filter === 'students') {
      whereClause.role = 'STUDENT'
    } else if (filter === 'myGrade' && session.user.role === 'STUDENT' && session.user.grade) {
      whereClause = {
        role: 'STUDENT',
        grade: session.user.grade
      }
    }

    // Get all users with their stats
    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        wasteRecords: {
          select: {
            weightG: true,
            points: true
          }
        },
        userBadges: {
          select: {
            badgeId: true
          }
        }
      }
    })

    // Calculate stats for each user
    const userStats = users.map(user => {
      const totalWeight = user.wasteRecords.reduce((sum, record) => sum + record.weightG, 0)
      const totalPoints = user.wasteRecords.reduce((sum, record) => sum + record.points, 0)
      const badgeCount = user.userBadges.length

      return {
        userId: user.id,
        name: user.name,
        role: user.role,
        grade: user.grade,
        classSection: user.classSection,
        totalWeight,
        totalPoints,
        badgeCount
      }
    })

    // Sort by points descending
    userStats.sort((a, b) => b.totalPoints - a.totalPoints)

    // Add ranks
    const leaderboard = userStats.map((user, index) => ({
      ...user,
      rank: index + 1
    }))

    // Find current user's rank
    const userRank = leaderboard.find(entry => entry.userId === currentUserId)

    // If user not in filtered list, get their overall rank
    let finalUserRank = userRank
    if (!userRank && filter !== 'all') {
      const allUsers = await prisma.user.findMany({
        include: {
          wasteRecords: {
            select: {
              weightG: true,
              points: true
            }
          },
          userBadges: {
            select: {
              badgeId: true
            }
          }
        }
      })

      const allUserStats = allUsers.map(user => {
        const totalWeight = user.wasteRecords.reduce((sum, record) => sum + record.weightG, 0)
        const totalPoints = user.wasteRecords.reduce((sum, record) => sum + record.points, 0)
        const badgeCount = user.userBadges.length

        return {
          userId: user.id,
          name: user.name,
          role: user.role,
          grade: user.grade,
          classSection: user.classSection,
          totalWeight,
          totalPoints,
          badgeCount
        }
      })

      allUserStats.sort((a, b) => b.totalPoints - a.totalPoints)
      
      const overallRank = allUserStats.findIndex(u => u.userId === currentUserId) + 1
      const currentUser = allUserStats.find(u => u.userId === currentUserId)
      
      if (currentUser) {
        finalUserRank = {
          ...currentUser,
          rank: overallRank
        }
      }
    }

    return NextResponse.json({
      leaderboard: leaderboard.slice(0, 50), // Top 50 only
      userRank: finalUserRank
    })

  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
} 