'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Pickup, User } from '@/lib/types'

export default function Pickups() {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState<User | null>(null)
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'claimed' | 'created'>('claimed')

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile()
    }
  }, [isLoaded, user])

  useEffect(() => {
    const fetchPickups = async () => {
      try {
        const response = await fetch(`/api/pickups?type=${activeTab}`)
        const data = await response.json()
        setPickups(data.pickups || [])
        setLoading(false)
      } catch (error) {
        console.error('Error fetching pickups:', error)
        setLoading(false)
      }
    }

    if (profile) {
      fetchPickups()
    }
  }, [profile, activeTab])

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

  const fetchPickups = async () => {
    try {
      const response = await fetch(`/api/pickups?type=${activeTab}`)
      const data = await response.json()
      setPickups(data.pickups || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching pickups:', error)
      setLoading(false)
    }
  }

  const updatePickupStatus = async (pickupId: string, status: string, notes?: string) => {
    setUpdating(pickupId)
    try {
      const response = await fetch('/api/pickups', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pickup_id: pickupId,
          status,
          notes
        })
      })

      if (response.ok) {
        alert(`Pickup ${status} successfully!`)
        fetchPickups()
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to update pickup'}`)
      }
    } catch (error) {
      console.error('Error updating pickup:', error)
      alert('Error updating pickup')
    } finally {
      setUpdating(null)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-green-400 font-medium">Loading pickups...</div>
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
          <p className="text-gray-300 mb-6">Please complete your profile to view pickups.</p>
          <a 
            href="/profile" 
            className="btn-primary inline-block"
          >
            Complete Profile
          </a>
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
            Food Pickups 📦
          </h1>
          <p className="text-lg text-gray-300">
            Manage your food claims and collections
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <div className="glass border border-gray-600 rounded-2xl p-1 inline-flex">
            <button
              onClick={() => setActiveTab('claimed')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'claimed'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              🎯 Food I Claimed
            </button>
            {profile.role === 'canteen' && (
              <button
                onClick={() => setActiveTab('created')}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'created'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                🏪 My Listings Pickups
              </button>
            )}
          </div>
        </div>

        {/* Pickups List */}
        {pickups.length === 0 ? (
          <div className="text-center py-16">
            <div className="glass-card p-12 max-w-md mx-auto">
              <div className="text-6xl mb-6">📦</div>
              <h2 className="text-2xl font-bold text-white mb-4">No pickups found</h2>
              <p className="text-gray-300 mb-6">
                {activeTab === 'claimed' 
                  ? 'Start browsing food to make your first claim!'
                  : 'Create food listings to start receiving pickup requests.'
                }
              </p>
              <a 
                href={activeTab === 'claimed' ? '/browse' : '/listings/create'} 
                className="btn-primary"
              >
                {activeTab === 'claimed' ? 'Browse Food' : 'Create Listing'}
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {pickups.map((pickup) => (
              <div key={pickup.id} className="glass-card p-6 hover:border-green-400/50 transition-all group">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Pickup Info */}
                  <div className="xl:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl sm:text-2xl font-semibold text-white group-hover:text-green-400 transition-colors mb-3">
                          {pickup.listing?.title}
                        </h3>
                        <p className="text-gray-300 mb-3 flex items-center gap-2">
                          <span className="text-lg">
                            {activeTab === 'claimed' ? '🏪' : '👤'}
                          </span>
                          {activeTab === 'claimed' 
                            ? `From: ${pickup.listing?.owner?.organization_name || pickup.listing?.owner?.name}`
                            : `Claimed by: ${pickup.claimer?.name}`
                          }
                        </p>
                        {pickup.listing?.description && (
                          <p className="text-gray-400 text-sm bg-gray-800/30 p-3 rounded-lg border border-gray-600">
                            {pickup.listing.description}
                          </p>
                        )}
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 border ${
                        pickup.status === 'pending' ? 'bg-yellow-900/50 text-yellow-400 border-yellow-500/30' :
                        pickup.status === 'confirmed' ? 'bg-blue-900/50 text-blue-400 border-blue-500/30' :
                        pickup.status === 'collected' ? 'bg-green-900/50 text-green-400 border-green-500/30' :
                        pickup.status === 'cancelled' ? 'bg-red-900/50 text-red-400 border-red-500/30' :
                        'bg-gray-700/50 text-gray-400 border-gray-500/30'
                      }`}>
                        {pickup.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-300">
                          <span>📊</span>
                          <span className="text-white font-medium">Quantity:</span> 
                          <span>{pickup.listing?.quantity} {pickup.listing?.quantity_unit}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <span>⏰</span>
                          <span className="text-white font-medium">Claimed:</span> 
                          <span>{new Date(pickup.claimed_at).toLocaleString()}</span>
                        </div>
                        {pickup.confirmed_at && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <span>✅</span>
                            <span className="text-white font-medium">Confirmed:</span> 
                            <span>{new Date(pickup.confirmed_at).toLocaleString()}</span>
                          </div>
                        )}
                        {pickup.collected_at && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <span>🎉</span>
                            <span className="text-white font-medium">Collected:</span> 
                            <span>{new Date(pickup.collected_at).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {pickup.pickup_code && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <span>🔑</span>
                            <span className="text-white font-medium">Pickup Code:</span>
                            <span className="font-mono text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-500/30">
                              {pickup.pickup_code}
                            </span>
                          </div>
                        )}
                        {pickup.listing?.address && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <span>📍</span>
                            <span className="text-white font-medium">Location:</span> 
                            <span className="truncate">{pickup.listing.address}</span>
                          </div>
                        )}
                        {pickup.notes && (
                          <div className="flex items-start gap-2 text-gray-300">
                            <span>📝</span>
                            <div>
                              <span className="text-white font-medium">Notes:</span> 
                              <p className="text-sm mt-1 bg-gray-800/30 p-2 rounded border border-gray-600">
                                {pickup.notes}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-3">
                    {activeTab === 'claimed' && pickup.status === 'pending' && (
                      <button
                        onClick={() => updatePickupStatus(pickup.id, 'cancelled')}
                        disabled={updating === pickup.id}
                        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating === pickup.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            Updating...
                          </span>
                        ) : (
                          '❌ Cancel Pickup'
                        )}
                      </button>
                    )}

                    {activeTab === 'created' && pickup.status === 'pending' && (
                      <button
                        onClick={() => updatePickupStatus(pickup.id, 'confirmed')}
                        disabled={updating === pickup.id}
                        className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating === pickup.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            Updating...
                          </span>
                        ) : (
                          '✅ Confirm Pickup'
                        )}
                      </button>
                    )}

                    {activeTab === 'created' && pickup.status === 'confirmed' && (
                      <button
                        onClick={() => updatePickupStatus(pickup.id, 'collected')}
                        disabled={updating === pickup.id}
                        className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating === pickup.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            Updating...
                          </span>
                        ) : (
                          '🎉 Mark as Collected'
                        )}
                      </button>
                    )}

                    {pickup.status === 'collected' && (
                      <div className="glass text-center py-6 border border-green-500/30">
                        <div className="text-green-400 text-3xl mb-3">🎉</div>
                        <p className="text-green-400 font-medium">Completed Successfully</p>
                      </div>
                    )}

                    {pickup.status === 'cancelled' && (
                      <div className="glass text-center py-6 border border-red-500/30">
                        <div className="text-red-400 text-3xl mb-3">❌</div>
                        <p className="text-red-400 font-medium">Cancelled</p>
                      </div>
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
