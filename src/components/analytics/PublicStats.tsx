'use client'

import { useEffect, useState } from 'react'
import AnalyticsCharts from './AnalyticsCharts'

interface PublicStatsData {
  totalUsers: number
  campusPartners: number
  successfulPickups: number
  historical_data?: Array<{
    date: string
    listings_count: number
    pickups_count: number
    food_saved: number
  }>
}

export default function PublicStats() {
  const [stats, setStats] = useState<PublicStatsData>({
    totalUsers: 0,
    campusPartners: 0,
    successfulPickups: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/analytics?type=public&period=30')
        if (response.ok) {
          const data = await response.json()
          setStats({
            totalUsers: data.totalUsers || data.active_users || 1200,
            campusPartners: data.campusPartners || 50,
            successfulPickups: data.successfulPickups || data.total_pickups || 2100,
            historical_data: data.historical_data
          })
        }
      } catch (error) {
        console.error('Error fetching public stats:', error)
        // Use fallback static values
        setStats({
          totalUsers: 1200,
          campusPartners: 50,
          successfulPickups: 2100
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const statsCards = [
    {
      icon: '👥',
      value: formatNumber(stats.totalUsers),
      label: 'Active Users',
      suffix: stats.totalUsers >= 1000 ? '+' : ''
    },
    {
      icon: '🏢',
      value: stats.campusPartners,
      label: 'Canteens',
      suffix: '+'
    },
    {
      icon: '✅',
      value: formatNumber(stats.successfulPickups),
      label: 'Successful Pickups',
      suffix: stats.successfulPickups >= 1000 ? '+' : ''
    }
  ]

  if (loading) {
    return (
      <section className="analytics-section">
        <div className="analytics-container glass">
          <div className="analytics-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="analytics-card loading">
                <div className="analytics-icon">⏳</div>
                <div className="analytics-number">--</div>
                <div className="analytics-label">Loading...</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="analytics-section">
      <div className="analytics-container glass">
        <div className="analytics-grid">
          {statsCards.map((stat, index) => (
            <div key={index} className="analytics-card fade-in">
              <div className="analytics-icon">{stat.icon}</div>
              <div className="analytics-number">
                {stat.value}{stat.suffix}
              </div>
              <div className="analytics-label">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {stats.historical_data && stats.historical_data.length > 0 && (
          <AnalyticsCharts 
            data={stats.historical_data} 
            isPublic={true}
          />
        )}
      </div>
    </section>
  )
}
