'use client'

import { useEffect, useState } from 'react'
import AnalyticsCharts from './AnalyticsCharts'

interface CanteenStatsData {
  totalListings: number
  totalClaims: number
  successfulPickups: number
  totalFoodOffered: number
  successRate: number
  activeDays: number
  historical_data?: Array<{
    date: string
    listings_count: number
    claims_count: number
    food_offered: number
  }>
}

interface UserStatsData {
  totalPickups: number
  successfulPickups: number
  totalFoodSaved: number
  favoriteCanteens: number
  successRate: number
  activeDays: number
  historical_data?: Array<{
    date: string
    pickups_count: number
    food_saved: number
  }>
}

interface DashboardStatsProps {
  userRole: 'canteen' | 'user' | 'ngo'
  userId?: string
}

export default function DashboardStats({ userRole, userId }: DashboardStatsProps) {
  const [stats, setStats] = useState<CanteenStatsData | UserStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return

      try {
        const response = await fetch(`/api/analytics?type=user&userId=${userId}&period=30`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  if (loading) {
    return (
      <div className="dashboard-analytics">
        <div className="analytics-header">
          <h2>Your Analytics</h2>
          <p>Loading your stats...</p>
        </div>
        <div className="analytics-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="analytics-card glass-card loading">
              <div className="analytics-icon">⏳</div>
              <div className="analytics-number">--</div>
              <div className="analytics-label">Loading...</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="dashboard-analytics">
        <div className="analytics-header">
          <h2>Your Analytics</h2>
          <p>No data available yet. Start using the platform to see your stats!</p>
        </div>
      </div>
    )
  }

  // Canteen-specific stats
  if (userRole === 'canteen') {
    const canteenStats = stats as CanteenStatsData
    const statsCards = [
      {
        icon: '📋',
        value: formatNumber(canteenStats.totalListings),
        label: 'Total Listings',
        suffix: ''
      },
      {
        icon: '👀',
        value: formatNumber(canteenStats.totalClaims),
        label: 'Claims Received',
        suffix: ''
      },
      {
        icon: '✅',
        value: formatNumber(canteenStats.successfulPickups),
        label: 'Successful Pickups',
        suffix: ''
      },
      {
        icon: '🍽️',
        value: formatNumber(canteenStats.totalFoodOffered),
        label: 'Food Offered (kg)',
        suffix: ''
      },
      {
        icon: '📊',
        value: canteenStats.successRate,
        label: 'Success Rate',
        suffix: '%'
      },
      {
        icon: '📅',
        value: canteenStats.activeDays,
        label: 'Active Days',
        suffix: ''
      }
    ]

    return (
      <div className="dashboard-analytics">
        <div className="analytics-header">
          <h2>Your Canteen Analytics</h2>
          <p>Track your food sharing impact and performance</p>
        </div>
        <div className="analytics-grid">
          {statsCards.map((stat, index) => (
            <div key={index} className="analytics-card glass-card">
              <div className="analytics-icon">{stat.icon}</div>
              <div className="analytics-number">
                {stat.value}{stat.suffix}
              </div>
              <div className="analytics-label">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {canteenStats.historical_data && canteenStats.historical_data.length > 0 && (
          <AnalyticsCharts 
            data={canteenStats.historical_data} 
            userRole="canteen"
          />
        )}
      </div>
    )
  }

  // Regular user/NGO stats
  const userStats = stats as UserStatsData
  const statsCards = [
    {
      icon: '🎯',
      value: formatNumber(userStats.totalPickups),
      label: 'Total Pickups',
      suffix: ''
    },
    {
      icon: '✅',
      value: formatNumber(userStats.successfulPickups),
      label: 'Completed Pickups',
      suffix: ''
    },
    {
      icon: '🍽️',
      value: formatNumber(userStats.totalFoodSaved),
      label: 'Food Saved (kg)',
      suffix: ''
    },
    {
      icon: '🏢',
      value: userStats.favoriteCanteens,
      label: 'Canteens Visited',
      suffix: ''
    },
    {
      icon: '📊',
      value: userStats.successRate,
      label: 'Success Rate',
      suffix: '%'
    },
    {
      icon: '📅',
      value: userStats.activeDays,
      label: 'Active Days',
      suffix: ''
    }
  ]

  return (
    <div className="dashboard-analytics">
      <div className="analytics-header">
        <h2>Your Impact Analytics</h2>
        <p>See how much food you&apos;ve helped save from waste</p>
      </div>
      <div className="analytics-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className="analytics-card glass-card">
            <div className="analytics-icon">{stat.icon}</div>
            <div className="analytics-number">
              {stat.value}{stat.suffix}
            </div>
            <div className="analytics-label">{stat.label}</div>
          </div>
        ))}
      </div>
      
      {userStats.historical_data && userStats.historical_data.length > 0 && (
        <AnalyticsCharts 
          data={userStats.historical_data} 
          userRole={userRole}
        />
      )}
    </div>
  )
}
