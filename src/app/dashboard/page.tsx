'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, Listing, Pickup } from '@/lib/types'

export default function Dashboard() {
  const { isLoaded, user } = useUser()
  const [profile, setProfile] = useState<User | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalPickups: 0,
    completedPickups: 0
  })

  // Prevent hydration mismatches by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Run cleanup first to update unavailable listings
        await fetch('/api/cleanup', { method: 'POST' }).catch(() => {
          // Silently handle cleanup errors - don't block the dashboard
        })
        
        const response = await fetch('/api/users')
        const data = await response.json()
        setProfile(data.user)
        if (!data.user) {
          setLoading(false) // Stop loading if no profile found
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        setLoading(false) // Stop loading on error
      }
    }

    if (isLoaded && user && !initialized) {
      setInitialized(true)
      fetchProfile()
    } else if (isLoaded && !user) {
      setLoading(false)
    }
  }, [isLoaded, user, initialized])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user's listings (for canteens)
        if (profile?.role === 'canteen') {
          const listingsResponse = await fetch('/api/listings?owner=true')
          if (listingsResponse.ok) {
            const listingsData = await listingsResponse.json()
            setListings(listingsData.listings || [])
          }
        }

        // Fetch user's pickups
        const pickupsResponse = await fetch('/api/pickups')
        if (pickupsResponse.ok) {
          const pickupsData = await pickupsResponse.json()
          setPickups(pickupsData.pickups || [])
        }

        setLoading(false)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setLoading(false)
      }
    }

    if (profile) {
      fetchDashboardData()
    }
  }, [profile])

  useEffect(() => {
    const calculateStats = () => {
      setStats({
        totalListings: listings.length,
        activeListings: listings.filter(l => l.status === 'available').length,
        totalPickups: pickups.length,
        completedPickups: pickups.filter(p => p.status === 'collected').length
      })
    }

    if (listings.length || pickups.length) {
      calculateStats()
    }
  }, [listings, pickups])

  // Show loading only when not mounted or when Clerk is not loaded or when we're still fetching data
  if (!mounted || !isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-green-400 font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-6xl mb-6">👤</div>
          <h1 className="text-2xl font-bold text-white mb-4">Complete Your Profile</h1>
          <p className="text-gray-300 mb-6">Please complete your profile to access the dashboard.</p>
          <Link 
            href="/profile" 
            className="btn-primary inline-block"
          >
            Complete Profile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Welcome back, {profile.name}! 👋
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 capitalize">
            {profile.role} Dashboard {profile.organization_name && `• ${profile.organization_name}`}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {profile.role === 'canteen' && (
            <>
              <div className="glass-card p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl mb-2">📋</div>
                <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stats.totalListings}</div>
                <div className="text-sm text-gray-300">Total Listings</div>
              </div>
              <div className="glass-card p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl mb-2">✅</div>
                <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1">{stats.activeListings}</div>
                <div className="text-sm text-gray-300">Active Listings</div>
              </div>
            </>
          )}
          <div className="glass-card p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl mb-2">🎯</div>
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stats.totalPickups}</div>
            <div className="text-sm text-gray-300">Total Pickups</div>
          </div>
          <div className="glass-card p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl mb-2">🏆</div>
            <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1">{stats.completedPickups}</div>
            <div className="text-sm text-gray-300">Completed</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Role-specific content */}
          <div>
            {profile.role === 'canteen' ? (
              <CanteenDashboard listings={listings} />
            ) : (
              <UserDashboard pickups={pickups} />
            )}
          </div>

          {/* Right Column - Recent Activity */}
          <div>
            <RecentActivity pickups={pickups} userRole={profile.role} />
          </div>
        </div>
      </div>
    </div>
  )
}

function CanteenDashboard({ listings }: { listings: Listing[] }) {
  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3 sm:gap-0">
        <h2 className="text-xl font-semibold text-white">Your Food Listings</h2>
        <Link 
          href="/listings/create" 
          className="btn-primary text-center"
        >
          Create Listing
        </Link>
      </div>

      <div className="space-y-4">
        {listings.slice(0, 5).map((listing) => (
          <div key={listing.id} className="glass border border-gray-600 rounded-xl p-4 hover:border-green-400/30 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-white text-base truncate">{listing.title}</h3>
                <p className="text-sm text-gray-300">
                  {listing.quantity} {listing.quantity_unit} • Until {new Date(listing.available_until || '').toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto ${
                listing.status === 'available' ? 'bg-green-900/50 text-green-400 border border-green-500/30' :
                listing.status === 'claimed' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30' :
                listing.status === 'picked_up' ? 'bg-green-900/50 text-green-400 border border-green-500/30' :
                listing.status === 'unavailable' ? 'bg-red-900/50 text-red-400 border border-red-500/30' :
                listing.status === 'cancelled' ? 'bg-gray-700/50 text-gray-400 border border-gray-500/30' :
                'bg-gray-700/50 text-gray-400 border border-gray-500/30'
              }`}>
                {listing.status === 'unavailable' ? 'unavailable' : listing.status}
              </span>
            </div>
          </div>
        ))}

        {listings.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🍽️</div>
            <p className="text-gray-300 mb-4">No listings yet</p>
            <Link 
              href="/listings/create" 
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              Create your first listing
            </Link>
          </div>
        )}

        {listings.length > 5 && (
          <Link 
            href="/listings" 
            className="block text-center text-green-400 hover:text-green-300 py-3 font-medium transition-colors"
          >
            View all listings →
          </Link>
        )}
      </div>
    </div>
  )
}

function UserDashboard({ pickups }: { pickups: Pickup[] }) {
  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3 sm:gap-0">
        <h2 className="text-xl font-semibold text-white">Your Pickups</h2>
        <Link 
          href="/browse" 
          className="btn-primary text-center"
        >
          Browse Food
        </Link>
      </div>

      <div className="space-y-4">
        {pickups.slice(0, 5).map((pickup) => (
          <div key={pickup.id} className="glass border border-gray-600 rounded-xl p-4 hover:border-green-400/30 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-white text-base truncate">{pickup.listing?.title}</h3>
                <p className="text-sm text-gray-300 truncate">
                  From {pickup.listing?.owner?.organization_name || pickup.listing?.owner?.name}
                </p>
                <p className="text-xs text-gray-400">
                  Claimed: {new Date(pickup.claimed_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto ${
                pickup.status === 'pending' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30' :
                pickup.status === 'confirmed' ? 'bg-blue-900/50 text-blue-400 border border-blue-500/30' :
                pickup.status === 'collected' ? 'bg-green-900/50 text-green-400 border border-green-500/30' :
                'bg-gray-700/50 text-gray-400 border border-gray-500/30'
              }`}>
                {pickup.status}
              </span>
            </div>
            {pickup.pickup_code && (
              <p className="text-sm text-green-400 mt-3 p-2 bg-green-900/20 rounded-lg border border-green-500/30">
                Pickup Code: <span className="font-mono font-bold">{pickup.pickup_code}</span>
              </p>
            )}
          </div>
        ))}

        {pickups.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-gray-300 mb-4">No pickups yet</p>
            <Link 
              href="/browse" 
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              Browse available food
            </Link>
          </div>
        )}

        {pickups.length > 5 && (
          <Link 
            href="/pickups" 
            className="block text-center text-green-400 hover:text-green-300 py-3 font-medium transition-colors"
          >
            View all pickups →
          </Link>
        )}
      </div>
    </div>
  )
}

function RecentActivity({ pickups, userRole }: { pickups: Pickup[], userRole: string }) {
  const recentPickups = pickups.slice(0, 8)

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
      
      <div className="space-y-4">
        {recentPickups.map((pickup) => (
          <div key={pickup.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
            <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
              pickup.status === 'collected' ? 'bg-green-400 shadow-lg shadow-green-400/50' :
              pickup.status === 'confirmed' ? 'bg-blue-400 shadow-lg shadow-blue-400/50' :
              pickup.status === 'pending' ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' :
              'bg-gray-400'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">
                {userRole === 'canteen' 
                  ? `${pickup.claimer?.name} claimed "${pickup.listing?.title}"`
                  : `You claimed "${pickup.listing?.title}"`
                }
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(pickup.claimed_at).toLocaleString()}
              </p>
            </div>
            <span className={`text-xs capitalize flex-shrink-0 px-2 py-1 rounded-full font-medium ${
              pickup.status === 'collected' ? 'text-green-400 bg-green-900/30' :
              pickup.status === 'confirmed' ? 'text-blue-400 bg-blue-900/30' :
              pickup.status === 'pending' ? 'text-yellow-400 bg-yellow-900/30' :
              pickup.status === 'cancelled' ? 'text-red-400 bg-red-900/30' :
              'text-gray-400 bg-gray-700/30'
            }`}>
              {pickup.status}
            </span>
          </div>
        ))}

        {recentPickups.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-300">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  )
}
