'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { Listing, User } from '@/lib/types'

export default function Listings() {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState<User | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile()
    }
  }, [isLoaded, user])

  useEffect(() => {
    if (profile) {
      fetchListings()
    }
  }, [profile])

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

  const fetchListings = async () => {
    try {
      // Note: We'll need to add an owner filter to the API
      const response = await fetch('/api/listings?owner=true')
      const data = await response.json()
      setListings(data.listings || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching listings:', error)
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-900 text-green-400'
      case 'claimed': return 'bg-yellow-900 text-yellow-400'
      case 'picked_up': return 'bg-blue-900 text-blue-400'
      case 'expired': return 'bg-red-900 text-red-400'
      case 'cancelled': return 'bg-gray-700 text-gray-400'
      default: return 'bg-gray-700 text-gray-400'
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
        <div className="text-green-400">Loading your listings...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Complete Your Profile</h1>
          <p className="text-gray-400">Please complete your profile to manage listings.</p>
        </div>
      </div>
    )
  }

  if (profile.role !== 'canteen') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">Only canteen owners can manage food listings.</p>
          <Link href="/browse" className="text-green-400 hover:text-green-300 mt-4 inline-block">
            Browse Available Food
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Food Listings</h1>
            <p className="text-gray-400">Manage your food sharing posts</p>
          </div>
          <Link 
            href="/listings/create" 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">Total Listings</h3>
            <p className="text-2xl font-bold text-white">{listings.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">Available</h3>
            <p className="text-2xl font-bold text-green-400">
              {listings.filter(l => l.status === 'available').length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">Claimed</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {listings.filter(l => l.status === 'claimed').length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">Completed</h3>
            <p className="text-2xl font-bold text-blue-400">
              {listings.filter(l => l.status === 'picked_up').length}
            </p>
          </div>
        </div>

        {/* Listings */}
        {listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-white mb-2">No listings yet</h2>
            <p className="text-gray-400 mb-6">Start sharing surplus food with your community</p>
            <Link 
              href="/listings/create" 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                      {listing.status}
                    </span>
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

                    {listing.food_type && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white">{listing.food_type.replace('_', ' ')}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Safety window:</span>
                      <span className="text-white">{listing.safety_window_hours}h</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white">{new Date(listing.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {listing.address && (
                    <div className="mb-4">
                      <span className="text-gray-400 text-sm">📍 </span>
                      <span className="text-gray-300 text-sm">{listing.address}</span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                      View Details
                    </button>
                    {listing.status === 'available' && (
                      <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
