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
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalPickups: 0,
    completedPickups: 0
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
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

    if (isLoaded && user) {
      fetchProfile()
    }
  }, [isLoaded, user])

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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-green-400">Loading...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-green-400">Loading dashboard...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Complete Your Profile</h1>
          <p className="text-gray-400 mb-6">Please complete your profile to access the dashboard.</p>
          <Link 
            href="/profile" 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Complete Profile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome back, {profile.name}!
          </h1>
          <p className="text-sm sm:text-base text-gray-400 capitalize">
            {profile.role} Dashboard {profile.organization_name && `• ${profile.organization_name}`}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {profile.role === 'canteen' && (
            <>
              <div className="bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg border border-gray-700">
                <h3 className="text-gray-400 text-xs sm:text-sm font-medium">Total Listings</h3>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.totalListings}</p>
              </div>
              <div className="bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg border border-gray-700">
                <h3 className="text-gray-400 text-xs sm:text-sm font-medium">Active Listings</h3>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400">{stats.activeListings}</p>
              </div>
            </>
          )}
          <div className="bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-xs sm:text-sm font-medium">Total Pickups</h3>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.totalPickups}</p>
          </div>
          <div className="bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-xs sm:text-sm font-medium">Completed</h3>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400">{stats.completedPickups}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
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
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold text-white">Your Food Listings</h2>
        <Link 
          href="/listings/create" 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm text-center"
        >
          Create Listing
        </Link>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {listings.slice(0, 5).map((listing) => (
          <div key={listing.id} className="border border-gray-700 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-white text-sm sm:text-base truncate">{listing.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400">
                  {listing.quantity} {listing.quantity_unit} • Until {new Date(listing.available_until || '').toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs self-start sm:self-auto ${
                listing.status === 'available' ? 'bg-green-900 text-green-400' :
                listing.status === 'claimed' ? 'bg-yellow-900 text-yellow-400' :
                'bg-gray-700 text-gray-400'
              }`}>
                {listing.status}
              </span>
            </div>
          </div>
        ))}

        {listings.length === 0 && (
          <div className="text-center py-6 sm:py-8">
            <p className="text-gray-400 mb-4 text-sm sm:text-base">No listings yet</p>
            <Link 
              href="/listings/create" 
              className="text-green-400 hover:text-green-300 text-sm sm:text-base"
            >
              Create your first listing
            </Link>
          </div>
        )}

        {listings.length > 5 && (
          <Link 
            href="/listings" 
            className="block text-center text-green-400 hover:text-green-300 py-2 text-sm sm:text-base"
          >
            View all listings
          </Link>
        )}
      </div>
    </div>
  )
}

function UserDashboard({ pickups }: { pickups: Pickup[] }) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold text-white">Your Pickups</h2>
        <Link 
          href="/browse" 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm text-center"
        >
          Browse Food
        </Link>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {pickups.slice(0, 5).map((pickup) => (
          <div key={pickup.id} className="border border-gray-700 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-white text-sm sm:text-base truncate">{pickup.listing?.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 truncate">
                  From {pickup.listing?.owner?.organization_name || pickup.listing?.owner?.name}
                </p>
                <p className="text-xs text-gray-500">
                  Claimed: {new Date(pickup.claimed_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs self-start sm:self-auto ${
                pickup.status === 'pending' ? 'bg-yellow-900 text-yellow-400' :
                pickup.status === 'confirmed' ? 'bg-blue-900 text-blue-400' :
                pickup.status === 'collected' ? 'bg-green-900 text-green-400' :
                'bg-gray-700 text-gray-400'
              }`}>
                {pickup.status}
              </span>
            </div>
            {pickup.pickup_code && (
              <p className="text-xs sm:text-sm text-green-400 mt-2">
                Pickup Code: <span className="font-mono">{pickup.pickup_code}</span>
              </p>
            )}
          </div>
        ))}

        {pickups.length === 0 && (
          <div className="text-center py-6 sm:py-8">
            <p className="text-gray-400 mb-4 text-sm sm:text-base">No pickups yet</p>
            <Link 
              href="/browse" 
              className="text-green-400 hover:text-green-300 text-sm sm:text-base"
            >
              Browse available food
            </Link>
          </div>
        )}

        {pickups.length > 5 && (
          <Link 
            href="/pickups" 
            className="block text-center text-green-400 hover:text-green-300 py-2 text-sm sm:text-base"
          >
            View all pickups
          </Link>
        )}
      </div>
    </div>
  )
}

function RecentActivity({ pickups, userRole }: { pickups: Pickup[], userRole: string }) {
  const recentPickups = pickups.slice(0, 8)

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Recent Activity</h2>
      
      <div className="space-y-3 sm:space-y-4">
        {recentPickups.map((pickup) => (
          <div key={pickup.id} className="flex items-start sm:items-center space-x-3">
            <div className={`w-2 h-2 rounded-full mt-2 sm:mt-0 flex-shrink-0 ${
              pickup.status === 'collected' ? 'bg-green-400' :
              pickup.status === 'confirmed' ? 'bg-blue-400' :
              pickup.status === 'pending' ? 'bg-yellow-400' :
              'bg-gray-400'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-white">
                {userRole === 'canteen' 
                  ? `${pickup.claimer?.name} claimed "${pickup.listing?.title}"`
                  : `You claimed "${pickup.listing?.title}"`
                }
              </p>
              <p className="text-xs text-gray-400">
                {new Date(pickup.claimed_at).toLocaleString()}
              </p>
            </div>
            <span className="text-xs text-gray-400 capitalize flex-shrink-0">
              {pickup.status}
            </span>
          </div>
        ))}

        {recentPickups.length === 0 && (
          <p className="text-gray-400 text-center py-4 text-sm sm:text-base">No recent activity</p>
        )}
      </div>
    </div>
  )
}
