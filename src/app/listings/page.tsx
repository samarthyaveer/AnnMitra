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
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState<{
    title?: string;
    description?: string;
    quantity?: number;
    quantity_unit?: string;
    food_type?: string;
    address?: string;
    safety_window_days?: string;
    safety_window_hours?: string;
  }>({})
  const [isUpdating, setIsUpdating] = useState(false)

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

  const handleViewDetails = (listing: Listing) => {
    setSelectedListing(listing)
    setShowDetailsModal(true)
  }

  const handleEdit = (listing: Listing) => {
    setSelectedListing(listing)
    // Convert safety_window_hours to days and hours for editing
    const totalHours = listing.safety_window_hours || 4
    const days = Math.floor(totalHours / 24)
    const hours = totalHours % 24
    
    setEditForm({
      title: listing.title,
      description: listing.description,
      quantity: listing.quantity,
      quantity_unit: listing.quantity_unit,
      safety_window_days: days.toString(),
      safety_window_hours: hours.toString(),
      food_type: listing.food_type,
      address: listing.address
    })
    setShowEditModal(true)
  }

  const handleUpdateListing = async () => {
    if (!selectedListing) return

    setIsUpdating(true)
    try {
      // Calculate available until time based on safety window
      const now = new Date()
      const days = parseInt(String(editForm.safety_window_days || '0')) || 0
      const hours = parseInt(String(editForm.safety_window_hours || '0')) || 0
      const totalHours = (days * 24) + hours
      const availableUntil = new Date(now.getTime() + (totalHours * 60 * 60 * 1000))

      const updatedForm = {
        ...editForm,
        safety_window_hours: totalHours,
        available_until: availableUntil.toISOString()
      }

      const response = await fetch(`/api/listings/${selectedListing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedForm)
      })

      if (response.ok) {
        // Refresh listings
        fetchListings()
        setShowEditModal(false)
        setSelectedListing(null)
        setEditForm({})
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to update listing'}`)
      }
    } catch (error) {
      console.error('Error updating listing:', error)
      alert('Error updating listing')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchListings() // Refresh listings
        setShowDetailsModal(false)
        setSelectedListing(null)
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to delete listing'}`)
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('Error deleting listing')
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-green-400 font-medium">Loading your listings...</div>
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
          <p className="text-gray-300">Please complete your profile to manage listings.</p>
        </div>
      </div>
    )
  }

  if (profile.role !== 'canteen') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-6xl mb-6">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">Only canteen owners can manage food listings.</p>
          <Link href="/browse" className="btn-primary">
            Browse Available Food
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">My Food Listings 📋</h1>
          <p className="text-lg text-gray-300 mb-6">Manage your food sharing posts and help reduce waste</p>
          <Link 
            href="/listings/create" 
            className="btn-primary"
          >
            Create New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="glass-card p-4 sm:p-6 text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">{listings.length}</div>
            <div className="text-sm text-gray-300">Total Listings</div>
          </div>
          <div className="glass-card p-4 sm:p-6 text-center">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1">
              {listings.filter(l => l.status === 'available').length}
            </div>
            <div className="text-sm text-gray-300">Available</div>
          </div>
          <div className="glass-card p-4 sm:p-6 text-center">
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-xl sm:text-2xl font-bold text-yellow-400 mb-1">
              {listings.filter(l => l.status === 'claimed').length}
            </div>
            <div className="text-sm text-gray-300">Claimed</div>
          </div>
          <div className="glass-card p-4 sm:p-6 text-center">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-400 mb-1">
              {listings.filter(l => l.status === 'picked_up').length}
            </div>
            <div className="text-sm text-gray-300">Completed</div>
          </div>
        </div>

        {/* Listings */}
        {listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🍽️</div>
            <h2 className="text-2xl font-bold text-white mb-4">No listings yet</h2>
            <p className="text-gray-300 text-lg mb-6">Start sharing surplus food with your community</p>
            <Link 
              href="/listings/create" 
              className="btn-primary"
            >
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      listing.status === 'available' ? 'bg-green-900/50 text-green-400 border-green-500/30' :
                      listing.status === 'claimed' ? 'bg-yellow-900/50 text-yellow-400 border-yellow-500/30' :
                      listing.status === 'picked_up' ? 'bg-green-900/50 text-green-400 border-green-500/30' :
                      listing.status === 'unavailable' ? 'bg-red-900/50 text-red-400 border-red-500/30' :
                      listing.status === 'cancelled' ? 'bg-gray-700/50 text-gray-400 border-gray-500/30' :
                      'bg-gray-700/50 text-gray-400 border-gray-500/30'
                    }`}>
                      {listing.status === 'unavailable' ? 'unavailable' : listing.status}
                    </span>
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

                    {listing.food_type && (
                      <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-gray-800/30">
                        <span className="text-gray-300 font-medium">Type:</span>
                        <span className="text-white font-semibold capitalize">{listing.food_type.replace('_', ' ')}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-gray-800/30">
                      <span className="text-gray-300 font-medium">Created:</span>
                      <span className="text-white font-semibold">{new Date(listing.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {listing.address && (
                    <div className="mb-4 p-3 rounded-lg bg-blue-900/20 border border-blue-500/30">
                      <span className="text-blue-400 text-sm">📍 </span>
                      <span className="text-blue-300 text-sm font-medium">{listing.address}</span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewDetails(listing)}
                      className="flex-1 btn-secondary text-center"
                    >
                      View Details
                    </button>
                    {listing.status === 'available' && (
                      <button 
                        onClick={() => handleEdit(listing)}
                        className="flex-1 bg-gray-600/50 hover:bg-gray-500/50 text-white py-2 px-3 rounded-lg text-sm transition-all border border-gray-500/30 hover:border-gray-400/50"
                      >
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

      {/* Details Modal */}
      {showDetailsModal && selectedListing && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-modal flex items-center justify-center p-4 z-50"
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            background: 'rgba(0, 0, 0, 0.8)',
            transform: 'translateZ(0)',
            willChange: 'backdrop-filter'
          }}
        >
          <div 
            className="glass-nav max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4"
            style={{
              backdropFilter: 'blur(35px) saturate(180%)',
              WebkitBackdropFilter: 'blur(35px) saturate(180%)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              transform: 'translateZ(0)',
              willChange: 'backdrop-filter'
            }}
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Listing Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              {selectedListing.image_url && (
                <div className="relative h-48 sm:h-64 w-full mb-4 sm:mb-6 rounded-lg overflow-hidden">
                  <Image
                    src={selectedListing.image_url}
                    alt={selectedListing.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{selectedListing.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    selectedListing.status === 'available' ? 'bg-green-900/50 text-green-400 border-green-500/30' :
                    selectedListing.status === 'claimed' ? 'bg-yellow-900/50 text-yellow-400 border-yellow-500/30' :
                    selectedListing.status === 'picked_up' ? 'bg-green-900/50 text-green-400 border-green-500/30' :
                    selectedListing.status === 'unavailable' ? 'bg-red-900/50 text-red-400 border-red-500/30' :
                    selectedListing.status === 'cancelled' ? 'bg-gray-700/50 text-gray-400 border-gray-500/30' :
                    'bg-gray-700/50 text-gray-400 border-gray-500/30'
                  }`}>
                    {selectedListing.status === 'unavailable' ? 'unavailable' : selectedListing.status}
                  </span>
                </div>

                {selectedListing.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Description</h4>
                    <p className="text-gray-400">{selectedListing.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Quantity</h4>
                    <p className="text-white">{selectedListing.quantity} {selectedListing.quantity_unit}</p>
                  </div>

                  {selectedListing.food_type && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Food Type</h4>
                      <p className="text-white capitalize">{selectedListing.food_type.replace('_', ' ')}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Available For</h4>
                    <p className={`font-medium ${
                      getTimeRemaining(selectedListing.available_until || '') === 'Unavailable' 
                        ? 'text-red-400' 
                        : 'text-green-400'
                    }`}>
                      {getTimeRemaining(selectedListing.available_until || '')}
                    </p>
                  </div>
                </div>

                {selectedListing.address && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Pickup Location</h4>
                    <p className="text-gray-400">📍 {selectedListing.address}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Created</h4>
                    <p className="text-white text-sm">{new Date(selectedListing.created_at).toLocaleString()}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Available Until</h4>
                    <p className="text-white text-sm">
                      {selectedListing.available_until ? new Date(selectedListing.available_until).toLocaleString() : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                {selectedListing.status === 'available' && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      handleEdit(selectedListing)
                    }}
                    className="flex-1 btn-primary"
                  >
                    Edit Listing
                  </button>
                )}
                <button
                  onClick={() => handleDeleteListing(selectedListing.id)}
                  className="bg-red-600/80 hover:bg-red-600 text-white py-2 px-4 rounded-xl transition-all border border-red-500/30"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedListing && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-modal flex items-center justify-center p-4 z-50"
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            background: 'rgba(0, 0, 0, 0.8)',
            transform: 'translateZ(0)',
            willChange: 'backdrop-filter'
          }}
        >
          <div 
            className="glass-nav max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4"
            style={{
              backdropFilter: 'blur(35px) saturate(180%)',
              WebkitBackdropFilter: 'blur(35px) saturate(180%)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              transform: 'translateZ(0)',
              willChange: 'backdrop-filter'
            }}
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Edit Listing</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    placeholder="e.g., Fresh Sandwiches"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
                    placeholder="Describe the food..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={editForm.quantity || ''}
                      onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Unit
                    </label>
                    <select
                      value={editForm.quantity_unit || 'meals'}
                      onChange={(e) => setEditForm({ ...editForm, quantity_unit: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    >
                      <option value="meals">Meals</option>
                      <option value="servings">Servings</option>
                      <option value="pieces">Pieces</option>
                      <option value="portions">Portions</option>
                      <option value="kg">Kilograms</option>
                      <option value="lbs">Pounds</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Food Type
                  </label>
                  <select
                    value={editForm.food_type || ''}
                    onChange={(e) => setEditForm({ ...editForm, food_type: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  >
                    <option value="">Select type</option>
                    <option value="meals">Meals</option>
                    <option value="snacks">Snacks</option>
                    <option value="beverages">Beverages</option>
                    <option value="baked_goods">Baked Goods</option>
                    <option value="fruits">Fruits</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="dairy">Dairy</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Safety Window */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Safety Window *
                    </label>
                    <p className="text-xs text-gray-400 mb-3">How long should this food be available for pickup?</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Days</label>
                        <input
                          type="number"
                          min="0"
                          max="7"
                          name="safety_window_days"
                          value={editForm.safety_window_days || '0'}
                          onChange={(e) => setEditForm({ ...editForm, safety_window_days: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Hours</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          name="safety_window_hours"
                          value={editForm.safety_window_hours || '0'}
                          onChange={(e) => setEditForm({ ...editForm, safety_window_hours: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Available until: {(() => {
                        const days = parseInt(String(editForm.safety_window_days || '0')) || 0
                        const hours = parseInt(String(editForm.safety_window_hours || '0')) || 0
                        const totalHours = (days * 24) + hours
                        const availableUntil = new Date(Date.now() + (totalHours * 60 * 60 * 1000))
                        return availableUntil.toLocaleString()
                      })()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pickup Address *
                  </label>
                  <input
                    type="text"
                    value={editForm.address || ''}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    placeholder="Building, Room, Campus"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={handleUpdateListing}
                  disabled={isUpdating}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Update Listing'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
