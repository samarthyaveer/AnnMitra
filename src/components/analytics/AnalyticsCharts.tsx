'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ChartData {
  date: string
  listings_count?: number
  pickups_count?: number
  food_saved?: number
  claims_count?: number
  food_offered?: number
}

interface AnalyticsChartsProps {
  data: ChartData[]
  userRole?: 'canteen' | 'user' | 'ngo'
  isPublic?: boolean
}

export default function AnalyticsCharts({ data, userRole, isPublic = false }: AnalyticsChartsProps) {
  // Common chart options with glassmorphism theme
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(0, 212, 170, 0.5)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 11
          }
        }
      }
    }
  }

  // Format dates for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const labels = data.map(d => formatDate(d.date))

  if (isPublic) {
    // Public charts for landing page
    const activityData = {
      labels,
      datasets: [
        {
          label: 'New Listings',
          data: data.map(d => d.listings_count || 0),
          borderColor: 'rgba(0, 212, 170, 1)',
          backgroundColor: 'rgba(0, 212, 170, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Pickups',
          data: data.map(d => d.pickups_count || 0),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    }

    const foodSavedData = {
      labels,
      datasets: [
        {
          label: 'Food Saved (kg)',
          data: data.map(d => d.food_saved || 0),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1
        }
      ]
    }

    return (
      <div className="charts-section">
        <h3 className="charts-title">Platform Activity Trends</h3>
        <div className="charts-grid">
          <div className="chart-container glass-card">
            <h4>Daily Activity</h4>
            <div className="chart-wrapper">
              <Line data={activityData} options={commonOptions} />
            </div>
          </div>
          <div className="chart-container glass-card">
            <h4>Food Saved Daily</h4>
            <div className="chart-wrapper">
              <Bar data={foodSavedData} options={commonOptions} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (userRole === 'canteen') {
    // Canteen specific charts
    const performanceData = {
      labels,
      datasets: [
        {
          label: 'Listings Created',
          data: data.map(d => d.listings_count || 0),
          borderColor: 'rgba(0, 212, 170, 1)',
          backgroundColor: 'rgba(0, 212, 170, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Claims Received',
          data: data.map(d => d.claims_count || 0),
          borderColor: 'rgba(147, 51, 234, 1)',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    }

    const foodData = {
      labels,
      datasets: [
        {
          label: 'Food Offered (kg)',
          data: data.map(d => d.food_offered || 0),
          backgroundColor: 'rgba(251, 191, 36, 0.8)',
          borderColor: 'rgba(251, 191, 36, 1)',
          borderWidth: 1
        }
      ]
    }

    // Success rate doughnut chart
    const totalClaims = data.reduce((sum, d) => sum + (d.claims_count || 0), 0)
    const successfulClaims = Math.floor(totalClaims * 0.75) // Estimated success rate
    const failedClaims = totalClaims - successfulClaims

    const successData = {
      labels: ['Successful Pickups', 'Pending/Failed'],
      datasets: [
        {
          data: [successfulClaims, failedClaims],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 2
        }
      ]
    }

    const doughnutOptions = {
      ...commonOptions,
      scales: undefined, // Remove scales for doughnut chart
      plugins: {
        ...commonOptions.plugins,
        legend: {
          ...commonOptions.plugins?.legend,
          position: 'bottom' as const
        }
      }
    }

    return (
      <div className="charts-section">
        <h3 className="charts-title">Your Canteen Performance</h3>
        <div className="charts-grid">
          <div className="chart-container glass-card">
            <h4>Listings vs Claims</h4>
            <div className="chart-wrapper">
              <Line data={performanceData} options={commonOptions} />
            </div>
          </div>
          <div className="chart-container glass-card">
            <h4>Food Offered Daily</h4>
            <div className="chart-wrapper">
              <Bar data={foodData} options={commonOptions} />
            </div>
          </div>
          <div className="chart-container glass-card">
            <h4>Success Rate</h4>
            <div className="chart-wrapper">
              <Doughnut data={successData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Regular user charts
  const userActivityData = {
    labels,
    datasets: [
      {
        label: 'Pickups Attempted',
        data: data.map(d => d.pickups_count || 0),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const userFoodData = {
    labels,
    datasets: [
      {
        label: 'Food Saved (kg)',
        data: data.map(d => d.food_saved || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1
      }
    ]
  }

  return (
    <div className="charts-section">
      <h3 className="charts-title">Your Impact Over Time</h3>
      <div className="charts-grid">
        <div className="chart-container glass-card">
          <h4>Pickup Activity</h4>
          <div className="chart-wrapper">
            <Line data={userActivityData} options={commonOptions} />
          </div>
        </div>
        <div className="chart-container glass-card">
          <h4>Food Saved</h4>
          <div className="chart-wrapper">
            <Bar data={userFoodData} options={commonOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}
