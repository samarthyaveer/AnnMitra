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
  const [editForm, setEditForm] = useState<Partial<Listing>>({})
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

  const handleViewDetails = (listing: Listing) => {
    setSelectedListing(listing)
    setShowDetailsModal(true)
  }

  const handleEdit = (listing: Listing) => {
    setSelectedListing(listing)
    setEditForm({
      title: listing.title,
      description: listing.description,
      quantity: listing.quantity,
      quantity_unit: listing.quantity_unit,
      safety_window_hours: listing.safety_window_hours,
      available_until: listing.available_until ? new Date(listing.available_until).toISOString().slice(0, 16) : '',
      food_type: listing.food_type,
      address: listing.address
    })
    setShowEditModal(true)
  }

  const handleUpdateListing = async () => {
    if (!selectedListing) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/listings/${selectedListing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
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
                    <button 
                      onClick={() => handleViewDetails(listing)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                    >
                      View Details
                    </button>
                    {listing.status === 'available' && (
                      <button 
                        onClick={() => handleEdit(listing)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Listing Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {selectedListing.image_url && (
                <div className="relative h-64 w-full mb-6 rounded-lg overflow-hidden">
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
                  <h3 className="text-xl font-semibold text-white mb-2">{selectedListing.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedListing.status)}`}>
                    {selectedListing.status}
                  </span>
                </div>

                {selectedListing.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Description</h4>
                    <p className="text-gray-400">{selectedListing.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
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
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Safety Window</h4>
                    <p className="text-white">{selectedListing.safety_window_hours} hours</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Available For</h4>
                    <p className={`font-medium ${
                      getTimeRemaining(selectedListing.available_until || '') === 'Expired' 
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Created</h4>
                    <p className="text-white">{new Date(selectedListing.created_at).toLocaleString()}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Available Until</h4>
                    <p className="text-white">
                      {selectedListing.available_until ? new Date(selectedListing.available_until).toLocaleString() : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                {selectedListing.status === 'available' && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      handleEdit(selectedListing)
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Edit Listing
                  </button>
                )}
                <button
                  onClick={() => handleDeleteListing(selectedListing.id)}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Listing</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white"
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
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
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
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                    placeholder="Describe the food..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={editForm.quantity || ''}
                      onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) })}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
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
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
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
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Safety Window (hours)
                    </label>
                    <input
                      type="number"
                      value={editForm.safety_window_hours || 4}
                      onChange={(e) => setEditForm({ ...editForm, safety_window_hours: parseInt(e.target.value) })}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                      placeholder="4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Available Until *
                    </label>
                    <input
                      type="datetime-local"
                      value={editForm.available_until || ''}
                      onChange={(e) => setEditForm({ ...editForm, available_until: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                    />
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
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                    placeholder="Building, Room, Campus"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleUpdateListing}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {isUpdating ? 'Updating...' : 'Update Listing'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
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
