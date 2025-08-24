'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { User } from '@/lib/types'
import { useRealtimeListings } from '@/hooks/useRealtime'
import { useNotify } from '@/hooks/useNotify'

export default function Browse() {
  const { isLoaded } = useUser()
  const { listings: realtimeListings, loading: realtimeLoading } = useRealtimeListings()
  const notify = useNotify()
  const [profile, setProfile] = useState<User | null>(null)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    food_type: '',
    search: ''
  })

  // Filter listings based on search and food type
  const filteredListings = realtimeListings.filter(listing => {
    const matchesSearch = !filters.search || 
      listing.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      listing.description?.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesFoodType = !filters.food_type || listing.food_type === filters.food_type
    
    // Check if listing is still available (not unavailable)
    const isNotUnavailable = listing.available_until ? 
      new Date(listing.available_until) > new Date() : true
    
    return matchesSearch && matchesFoodType && listing.status === 'available' && isNotUnavailable
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/users')
        const data = await response.json()
        setProfile(data.user)
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    if (isLoaded) {
      fetchProfile()
    }
  }, [isLoaded])

  const handleClaim = async (listingId: string) => {
    if (!profile) {
      notify.profileIncomplete()
      return
    }

    setClaiming(listingId)
    try {
      const response = await fetch('/api/pickups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listing_id: listingId
        })
      })

      if (response.ok) {
        const data = await response.json()
        notify.success(
          'Food Claimed Successfully! 🎉',
          `Your pickup code is: ${data.pickup.pickup_code}. Save this code for pickup!`,
          'pickup',
          '/pickups'
        )
        // Real-time updates will handle the listing status change
      } else {
        const data = await response.json()
        notify.error('Claim Failed', data.error || 'Failed to claim food. Please try again.', 'pickup')
      }
    } catch (error) {
      console.error('Error claiming food:', error)
      notify.error('Claim Error', 'An unexpected error occurred while claiming food.', 'pickup')
    } finally {
      setClaiming(null)
    }
  }

  const getTimeRemaining = (availableUntil: string) => {
    const now = new Date()
    const until = new Date(availableUntil)
    const diff = until.getTime() - now.getTime()
    
    if (diff <= 0) return 'Unavailable'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-green-400 font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  if (realtimeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-green-400 font-medium">Loading available food...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Browse Available Food 🍽️</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">Find and claim fresh surplus food from your campus community</p>
        </div>

        {/* Filters */}
        <div className="glass-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search food, canteen, description..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Food Type
              </label>
              <select
                value={filters.food_type}
                onChange={(e) => setFilters(prev => ({ ...prev, food_type: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              >
                <option value="">All Types</option>
                <option value="meals">Prepared Meals</option>
                <option value="snacks">Snacks</option>
                <option value="beverages">Beverages</option>
                <option value="baked_goods">Baked Goods</option>
                <option value="fruits">Fruits</option>
                <option value="vegetables">Vegetables</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ food_type: '', search: '' })}
                className="w-full btn-secondary text-center"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🍽️</div>
            <h2 className="text-2xl font-bold text-white mb-4">No food available</h2>
            <p className="text-gray-300 text-lg">Check back later or try different filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="glass-card overflow-hidden hover:border-green-400/50 transition-all group">
                {/* Image */}
                {listing.image_url ? (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={listing.image_url}
                      alt={listing.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center group-hover:from-gray-700 group-hover:to-gray-800 transition-colors">
                    <span className="text-6xl">🍽️</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">{listing.title}</h3>
                    {listing.food_type && (
                      <span className="bg-green-900/50 text-green-400 px-3 py-1 rounded-full text-xs border border-green-500/30 font-medium">
                        {listing.food_type.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {listing.description && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {listing.description}
                    </p>
                  )}

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-gray-800/30">
                      <span className="text-gray-300 font-medium">Quantity:</span>
                      <span className="text-white font-semibold">{listing.quantity} {listing.quantity_unit}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-gray-800/30">
                      <span className="text-gray-300 font-medium">Available for:</span>
                      <span className={`font-semibold ${
                        getTimeRemaining(listing.available_until || '') === 'Unavailable' 
                          ? 'text-red-400' 
                          : 'text-green-400'
                      }`}>
                        {getTimeRemaining(listing.available_until || '')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-gray-800/30">
                      <span className="text-gray-300 font-medium">From:</span>
                      <span className="text-white font-semibold">
                        {listing.owner?.organization_name || listing.owner?.name}
                      </span>
                    </div>
                  </div>

                  {listing.address && (
                    <div className="mb-4 p-3 rounded-lg bg-blue-900/20 border border-blue-500/30">
                      <span className="text-blue-400 text-sm">📍 </span>
                      <span className="text-blue-300 text-sm font-medium">{listing.address}</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleClaim(listing.id)}
                    disabled={claiming === listing.id || !profile || getTimeRemaining(listing.available_until || '') === 'Unavailable'}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:hover:bg-gray-600"
                  >
                    {claiming === listing.id ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Claiming...
                      </span>
                    ) : 
                     getTimeRemaining(listing.available_until || '') === 'Unavailable' ? 'Unavailable' :
                     !profile ? 'Complete Profile to Claim' : 'Claim Food'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
