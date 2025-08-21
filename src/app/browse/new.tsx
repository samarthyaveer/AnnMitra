'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { Listing, User } from '@/lib/types'

export default function Browse() {
  const { user, isLoaded } = useUser()
  const [listings, setListings] = useState<Listing[]>([])
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    food_type: '',
    search: ''
  })

  useEffect(() => {
    if (isLoaded) {
      fetchProfile()
      fetchListings()
    }
  }, [isLoaded])

  useEffect(() => {
    fetchListings()
  }, [filters])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setProfile(data.user)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams({
        status: 'available',
        limit: '20'
      })
      
      if (filters.food_type) {
        params.append('food_type', filters.food_type)
      }

      const response = await fetch(`/api/listings?${params}`)
      const data = await response.json()
      
      let filteredListings = data.listings || []
      
      // Filter by search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        filteredListings = filteredListings.filter((listing: Listing) =>
          listing.title.toLowerCase().includes(searchTerm) ||
          listing.description?.toLowerCase().includes(searchTerm) ||
          listing.owner?.organization_name?.toLowerCase().includes(searchTerm)
        )
      }
      
      setListings(filteredListings)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching listings:', error)
      setLoading(false)
    }
  }

  const handleClaim = async (listingId: string) => {
    if (!profile) {
      alert('Please complete your profile first')
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
        alert(`Food claimed successfully! Your pickup code is: ${data.pickup.pickup_code}`)
        fetchListings() // Refresh listings
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to claim food'}`)
      }
    } catch (error) {
      console.error('Error claiming food:', error)
      alert('Error claiming food')
    } finally {
      setClaiming(null)
    }
  }

  const getTimeRemaining = (availableUntil: string) => {
    const now = new Date()
    const until = new Date(availableUntil)
    const diff = until.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
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

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-green-400">Loading available food...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Available Food</h1>
          <p className="text-gray-400">Find and claim food from your campus community</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
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
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Food Type
              </label>
              <select
                value={filters.food_type}
                onChange={(e) => setFilters(prev => ({ ...prev, food_type: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
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
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-white mb-2">No food available</h2>
            <p className="text-gray-400">Check back later or try different filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-green-600 transition-colors">
                {/* Image */}
                {listing.image_url ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={listing.image_url}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-700 flex items-center justify-center">
                    <span className="text-6xl">🍽️</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">{listing.title}</h3>
                    {listing.food_type && (
                      <span className="bg-green-900 text-green-400 px-2 py-1 rounded-full text-xs">
                        {listing.food_type.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {listing.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {listing.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Quantity:</span>
                      <span className="text-white">{listing.quantity} {listing.quantity_unit}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Available for:</span>
                      <span className={`font-medium ${
                        getTimeRemaining(listing.available_until || '') === 'Expired' 
                          ? 'text-red-400' 
                          : 'text-green-400'
                      }`}>
                        {getTimeRemaining(listing.available_until || '')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">From:</span>
                      <span className="text-white">
                        {listing.owner?.organization_name || listing.owner?.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Safety window:</span>
                      <span className="text-white">{listing.safety_window_hours}h</span>
                    </div>
                  </div>

                  {listing.address && (
                    <div className="mb-4">
                      <span className="text-gray-400 text-sm">📍 </span>
                      <span className="text-gray-300 text-sm">{listing.address}</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleClaim(listing.id)}
                    disabled={claiming === listing.id || !profile || getTimeRemaining(listing.available_until || '') === 'Expired'}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {claiming === listing.id ? 'Claiming...' : 
                     getTimeRemaining(listing.available_until || '') === 'Expired' ? 'Expired' :
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
